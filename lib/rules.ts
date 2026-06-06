import { Patient } from './data'

export type Risk = 'Low' | 'Moderate' | 'High'
export type BiomarkerStatus = 'high' | 'low' | 'normal'

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
    return 'Elevated IL-6 and CRP with preserved HRV — systemic inflammation, not autonomic collapse.'
  }
  if (type === 'Centralized/Fibromyalgia Phenotype') {
    return 'Normal inflammatory labs but low HRV and deep sleep — centralized pain with autonomic and sleep disruption.'
  }
  if (type === 'Metabolic/Neuropathic Phenotype') {
    return 'Elevated HbA1c and low vitamin D — metabolic drivers with neuropathic symptom pattern.'
  }
  return 'Multiple overlapping signals — review full panel before routing.'
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
  if (p.dn4 >= 4) reasons.push('DN4 suggests neuropathic features')
  if (p.painScore >= 7) reasons.push('high reported pain')
  if (p.bpiInterference >= 7) reasons.push('high daily-function interference')
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
    return { banner: 'bg-red-50 border-red-300 text-red-950', accent: 'text-red-800', chip: 'bg-red-100 text-red-900 border-red-300 font-medium' }
  }
  if (type === 'Centralized/Fibromyalgia Phenotype') {
    return { banner: 'bg-violet-50 border-violet-300 text-violet-950', accent: 'text-violet-800', chip: 'bg-violet-100 text-violet-900 border-violet-300 font-medium' }
  }
  if (type === 'Metabolic/Neuropathic Phenotype') {
    return { banner: 'bg-amber-50 border-amber-300 text-amber-950', accent: 'text-amber-900', chip: 'bg-amber-100 text-amber-950 border-amber-300 font-medium' }
  }
  return { banner: 'bg-slate-50 border-slate-300 text-slate-950', accent: 'text-slate-800', chip: 'bg-slate-100 text-slate-900 border-slate-300 font-medium' }
}
