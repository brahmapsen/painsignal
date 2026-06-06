import { patientRecords, type Patient, type PriorOpioidExposure } from './data'

export type Risk = 'Low' | 'Moderate' | 'High'
export type BiomarkerStatus = 'high' | 'low' | 'normal'

export type OpioidDriver = {
  label: string
  points: number
}

export type OpioidAnalysis = {
  score: number
  level: Risk
  confidence: number
  primaryDriver: string
  drivers: OpioidDriver[]
}

export function riskScore(p: Patient) {
  let score = 0
  if (p.painScore >= 7) score += 20
  if (p.bpiInterference >= 7) score += 15
  if (p.sleepEfficiency < 70) score += 15
  if (p.hrv < 25) score += 15
  if (p.restingHrDelta >= 10) score += 10
  if (p.steps < 2000) score += 10
  if (p.il6 > 5 || p.crp > 10 || p.esr > 30) score += 20
  if (p.dn4 >= 4) score += 15
  if (p.hba1c >= 6.5 || p.vitaminD < 20) score += 10
  return Math.min(score, 100)
}

export function riskLevel(score: number): Risk {
  if (score >= 70) return 'High'
  if (score >= 40) return 'Moderate'
  return 'Low'
}

export function phenotype(p: Patient) {
  if (p.il6 > 5 && p.crp > 10 && p.hrv >= 30) return 'Inflammatory Phenotype'
  if (p.il6 <= 5 && p.hrv < 25 && p.deepSleepPct < 10) return 'Centralized/Fibromyalgia Phenotype'
  if (p.hba1c >= 6.5 && p.vitaminD < 20) return 'Metabolic/Neuropathic Phenotype'
  return 'Mixed phenotype'
}

export function phenotypeSummary(p: Patient) {
  const type = phenotype(p)
  if (type === 'Inflammatory Phenotype') {
    return 'Lab and wearable signals may be associated with an inflammatory pattern — elevated IL-6 and CRP with preserved HRV.'
  }
  if (type === 'Centralized/Fibromyalgia Phenotype') {
    return 'Signals may be associated with a centralized pain pattern — inflammatory markers within typical range with low HRV and reduced deep sleep.'
  }
  if (type === 'Metabolic/Neuropathic Phenotype') {
    return 'Signals may be associated with a metabolic/neuropathic pattern — HbA1c and vitamin D findings alongside neuropathic symptom reports.'
  }
  return 'Multiple overlapping signals present — full panel review may help organize findings for clinician interpretation.'
}

export function explanation(p: Patient) {
  const reasons: string[] = []
  if (p.il6 > 5) reasons.push('elevated IL-6')
  if (p.crp > 10) reasons.push('elevated CRP')
  if (p.hrv >= 30 && p.il6 > 5) reasons.push('HRV within normal range')
  if (p.il6 <= 5 && p.crp <= 10) reasons.push('inflammatory markers within normal range')
  if (p.hrv < 25) reasons.push('low HRV')
  if (p.deepSleepPct < 10) reasons.push('low deep sleep')
  if (p.hba1c >= 6.5) reasons.push('elevated HbA1c')
  if (p.vitaminD < 20) reasons.push('low vitamin D')
  if (p.dn4 >= 4) reasons.push('DN4 score may be associated with neuropathic symptom features')
  if (p.painScore >= 7) reasons.push('patient-reported pain may be elevated')
  if (p.bpiInterference >= 7) reasons.push('functional interference may be elevated')
  return reasons
}

export function biomarkerStatus(
  marker: 'il6' | 'crp' | 'hrv' | 'deepSleep' | 'hba1c' | 'vitaminD',
  value: number,
): BiomarkerStatus {
  switch (marker) {
    case 'il6':
      return value > 5 ? 'high' : 'normal'
    case 'crp':
      return value > 10 ? 'high' : 'normal'
    case 'hrv':
      return value < 25 ? 'low' : 'normal'
    case 'deepSleep':
      return value < 10 ? 'low' : 'normal'
    case 'hba1c':
      return value >= 6.5 ? 'high' : 'normal'
    case 'vitaminD':
      return value < 20 ? 'low' : 'normal'
  }
}

export type PhenotypeKeyMarker = {
  label: string
  value: string
  status: BiomarkerStatus
  note: string
}

export function keyMarkers(p: Patient): PhenotypeKeyMarker[] {
  const type = phenotype(p)
  if (type === 'Inflammatory Phenotype') {
    return [
      { label: 'IL-6', value: `${p.il6} pg/mL`, status: biomarkerStatus('il6', p.il6), note: 'Ref: < 5' },
      { label: 'CRP', value: `${p.crp} mg/L`, status: biomarkerStatus('crp', p.crp), note: 'Ref: < 10' },
      { label: 'HRV', value: `${p.hrv} ms`, status: biomarkerStatus('hrv', p.hrv), note: 'Ref: ≥ 25' },
    ]
  }
  if (type === 'Centralized/Fibromyalgia Phenotype') {
    return [
      { label: 'IL-6', value: `${p.il6} pg/mL`, status: biomarkerStatus('il6', p.il6), note: 'Ref: < 5' },
      { label: 'HRV', value: `${p.hrv} ms`, status: biomarkerStatus('hrv', p.hrv), note: 'Ref: ≥ 25' },
      { label: 'Deep sleep', value: `${p.deepSleepPct}%`, status: biomarkerStatus('deepSleep', p.deepSleepPct), note: 'Ref: ≥ 10' },
    ]
  }
  return [
    { label: 'HbA1c', value: `${p.hba1c}%`, status: biomarkerStatus('hba1c', p.hba1c), note: 'Ref: < 6.5' },
    { label: 'Vitamin D', value: `${p.vitaminD} ng/mL`, status: biomarkerStatus('vitaminD', p.vitaminD), note: 'Ref: ≥ 20' },
    { label: 'DN4 score', value: `${p.dn4}/10`, status: p.dn4 >= 4 ? 'high' : 'normal', note: 'Neuropathic screen' },
  ]
}

export function phenotypeStyle(type: string) {
  if (type === 'Inflammatory Phenotype') {
    return { banner: 'bg-red-50 border-red-300 text-red-950', accent: 'text-red-800', chip: 'bg-red-100 text-red-900 border-red-300' }
  }
  if (type === 'Centralized/Fibromyalgia Phenotype') {
    return { banner: 'bg-violet-50 border-violet-300 text-violet-950', accent: 'text-violet-800', chip: 'bg-violet-100 text-violet-900 border-violet-300' }
  }
  if (type === 'Metabolic/Neuropathic Phenotype') {
    return { banner: 'bg-amber-50 border-amber-300 text-amber-950', accent: 'text-amber-900', chip: 'bg-amber-100 text-amber-950 border-amber-300' }
  }
  return { banner: 'bg-slate-50 border-slate-300 text-slate-950', accent: 'text-slate-800', chip: 'bg-slate-100 text-slate-900 border-slate-300' }
}

function priorExposurePoints(exposure: PriorOpioidExposure): number {
  if (exposure === 'chronic') return 20
  if (exposure === 'prior') return 10
  return 0
}

export function opioidEscalationDrivers(p: Patient): OpioidDriver[] {
  const drivers: OpioidDriver[] = []
  const type = phenotype(p)

  if (p.painScore >= 7) drivers.push({ label: 'Elevated pain score (≥ 7/10)', points: 15 })
  if (p.bpiInterference >= 7) drivers.push({ label: 'Elevated function interference (≥ 7/10)', points: 15 })
  if (p.sleepEfficiency < 70) drivers.push({ label: 'Reduced sleep efficiency (< 70%)', points: 10 })
  if (p.hrv < 25) drivers.push({ label: 'Reduced HRV (< 25 ms)', points: 10 })

  const exposurePts = priorExposurePoints(p.priorOpioidExposure)
  if (exposurePts > 0) {
    drivers.push({
      label: `Prior opioid exposure (${p.priorOpioidExposure})`,
      points: exposurePts,
    })
  }

  if (p.currentOpioidUse) drivers.push({ label: 'Current opioid use', points: 12 })
  if (p.mmePerDay >= 50) drivers.push({ label: 'Elevated MME (≥ 50/day)', points: 15 })
  else if (p.mmePerDay >= 30) drivers.push({ label: 'Moderate MME (≥ 30/day)', points: 8 })

  if (p.dn4 >= 4) drivers.push({ label: 'DN4 score ≥ 4 — neuropathic symptom pattern', points: 10 })

  if (type === 'Centralized/Fibromyalgia Phenotype') {
    drivers.push({ label: 'Centralized pattern signals present', points: 12 })
  } else if (type === 'Inflammatory Phenotype') {
    drivers.push({ label: 'Inflammatory pattern signals present', points: 5 })
  } else if (type === 'Metabolic/Neuropathic Phenotype') {
    drivers.push({ label: 'Metabolic/neuropathic pattern signals present', points: 8 })
  }

  return drivers.sort((a, b) => b.points - a.points)
}

export function opioidEscalationScore(p: Patient): number {
  const total = opioidEscalationDrivers(p).reduce((sum, d) => sum + d.points, 0)
  return Math.min(total, 100)
}

export function opioidEscalationLevel(score: number): Risk {
  if (score >= 55) return 'High'
  if (score >= 30) return 'Moderate'
  return 'Low'
}

export function opioidPrimaryDriver(p: Patient): string {
  const drivers = opioidEscalationDrivers(p)
  return drivers[0]?.label ?? 'No dominant escalation signals identified for review'
}

export function opioidConfidence(p: Patient): number {
  const drivers = opioidEscalationDrivers(p)
  const signalCount = drivers.length
  const type = phenotype(p)
  let confidence = 55 + signalCount * 6
  if (type !== 'Mixed phenotype') confidence += 10
  if (p.currentOpioidUse || p.priorOpioidExposure !== 'none') confidence += 8
  return Math.min(confidence, 95)
}

export function opioidAnalysis(p: Patient): OpioidAnalysis {
  const score = opioidEscalationScore(p)
  return {
    score,
    level: opioidEscalationLevel(score),
    confidence: opioidConfidence(p),
    primaryDriver: opioidPrimaryDriver(p),
    drivers: opioidEscalationDrivers(p),
  }
}

export function recommendedPathway(_p: Patient): string {
  return CLINICAL_FACTORS_INTRO
}

export function nonOpioidCareSteps(_p: Patient): string[] {
  return CLINICAL_FACTORS_BULLETS
}

export function avoidOpioidReason(_p: Patient): string {
  return CLINICAL_CONTEXT_FOR_OPIOID_REVIEW
}

export function nextBestAction(p: Patient): string {
  const opioid = opioidAnalysis(p)
  const type = phenotype(p)

  if (opioid.level === 'High') {
    return `Multiple signals may be associated with elevated escalation risk — organized for ${type.toLowerCase()} review.`
  }
  if (opioid.level === 'Moderate') {
    return `Several findings may warrant clinician review alongside ${type.toLowerCase()} signals.`
  }
  return `Findings organized for clinician review — limited escalation signals identified at this time.`
}

export function supportingEvidence(p: Patient): SupportingEvidenceItem[] {
  return [
    {
      label: 'DN4 score',
      value: `${p.dn4}/10`,
      tag: p.dn4 >= 4 ? 'Signal present' : 'Clinical correlation recommended',
    },
    {
      label: 'HbA1c',
      value: `${p.hba1c}%`,
      tag: p.hba1c >= 6.5 ? 'Possible contributor' : 'Clinical correlation recommended',
    },
    {
      label: 'Vitamin D',
      value: `${p.vitaminD} ng/mL`,
      tag: p.vitaminD < 20 ? 'Possible contributor' : 'Clinical correlation recommended',
    },
    {
      label: 'HRV trend',
      value: `${p.hrv} ms`,
      tag: p.hrv < 25 ? 'Signal present' : 'Clinical correlation recommended',
    },
    {
      label: 'Sleep quality',
      value: `${p.sleepEfficiency}% efficiency · ${p.deepSleepPct}% deep sleep`,
      tag: p.sleepEfficiency < 70 || p.deepSleepPct < 10 ? 'Needs clinician review' : 'Clinical correlation recommended',
    },
    {
      label: 'Pain interference score',
      value: `${p.bpiInterference}/10`,
      tag: p.bpiInterference >= 7 ? 'Needs clinician review' : 'Clinical correlation recommended',
    },
  ]
}

export const NO_IMAGING_CONTEXT_MESSAGE =
  'No imaging context available. PainSignal can still synthesize biomarkers, wearable trends, and patient-reported outcomes.'

export function structuralContextSummary(p: Patient): string {
  if (!p.imaging) {
    return NO_IMAGING_CONTEXT_MESSAGE
  }

  const { structuralContribution } = p.imaging

  if (structuralContribution === 'Low') {
    return 'Current imaging summary does not appear to fully explain the overall symptom pattern. Structural findings may be a secondary contributor. Imaging findings should be interpreted alongside biomarkers, wearables, and patient-reported outcomes.'
  }

  if (structuralContribution === 'Moderate') {
    return 'Reported imaging findings may contribute to some mechanical symptoms. Current imaging summary may not fully explain the overall symptom pattern. Imaging findings should be interpreted alongside biomarkers, wearables, and patient-reported outcomes.'
  }

  return 'Reported imaging findings may be a more prominent structural context layer. Imaging findings should still be interpreted alongside biomarkers, wearables, and patient-reported outcomes — clinical correlation recommended.'
}

export function enrichPatient(
  p: Omit<Patient, 'opioidRiskScore' | 'recommendedPathway' | 'avoidOpioidReason' | 'nextBestAction'>,
): Patient {
  const score = opioidEscalationScore(p as Patient)
  return {
    ...p,
    opioidRiskScore: score,
    recommendedPathway: recommendedPathway(p as Patient),
    avoidOpioidReason: avoidOpioidReason(p as Patient),
    nextBestAction: nextBestAction(p as Patient),
  }
}

export const CLINICAL_DISCLAIMER =
  'Clinical decision support only. PainSignal does not diagnose, prescribe, or replace clinician judgment.'

export const CLINICAL_CONTEXT_FOR_OPIOID_REVIEW =
  'The patient\'s questionnaire responses, laboratory markers, wearable trends, and functional signals highlight factors that may be relevant when reviewing opioid escalation risk. These findings are intended to support clinician review and should be interpreted within the broader clinical context.'

export const CLINICAL_FACTORS_INTRO =
  'Current findings suggest several areas that may warrant clinician review before considering opioid escalation.'

export const CLINICAL_FACTORS_BULLETS = [
  'Neuropathic symptom patterns reported on questionnaire',
  'Metabolic factors that may contribute to symptom burden',
  'Sleep disruption and reduced recovery signals',
  'Functional limitations associated with chronic pain',
  'Prior opioid exposure or escalation risk, if present',
]

export type EvidenceTag =
  | 'Possible contributor'
  | 'Signal present'
  | 'Needs clinician review'
  | 'Clinical correlation recommended'

export type SupportingEvidenceItem = {
  label: string
  value: string
  tag: EvidenceTag
}
