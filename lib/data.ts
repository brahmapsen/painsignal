export type PriorOpioidExposure = 'none' | 'prior' | 'chronic'

export type StructuralContribution = 'Low' | 'Moderate' | 'High'

export type PatientImaging = {
  modality: string
  bodyRegion: string
  reportDate: string
  summary: string
  findings: string[]
  structuralContribution: StructuralContribution
  correlationNote: string
}

export type Patient = {
  id: string
  label: string
  name: string
  age: number
  pathway: string
  painScore: number
  bpiInterference: number
  dn4: number
  sleepEfficiency: number
  deepSleepPct: number
  hrv: number
  restingHrDelta: number
  steps: number
  activityVariance: number
  il6: number
  crp: number
  esr: number
  hba1c: number
  vitaminD: number
  symptoms: string[]
  lastCheckIn: string
  currentOpioidUse: boolean
  mmePerDay: number
  priorOpioidExposure: PriorOpioidExposure
  opioidRiskScore: number
  recommendedPathway: string
  avoidOpioidReason: string
  nextBestAction: string
  imaging?: PatientImaging
}

/** Base clinical records — opioid intelligence fields filled by enrichPatient(). */
export const patientRecords: Omit<
  Patient,
  'opioidRiskScore' | 'recommendedPathway' | 'avoidOpioidReason' | 'nextBestAction'
>[] = [
  {
    id: 'patient-a',
    label: 'Patient A',
    name: 'Maria Lopez',
    age: 58,
    pathway: 'Post-surgical pain · Rheumatology follow-up',
    painScore: 7,
    bpiInterference: 6,
    dn4: 2,
    sleepEfficiency: 72,
    deepSleepPct: 13,
    hrv: 44,
    restingHrDelta: 6,
    steps: 4200,
    activityVariance: 38,
    il6: 9.2,
    crp: 14.2,
    esr: 38,
    hba1c: 5.6,
    vitaminD: 32,
    symptoms: ['joint swelling', 'morning stiffness', 'localized warmth'],
    lastCheckIn: 'Today, 8:10 AM',
    currentOpioidUse: true,
    mmePerDay: 30,
    priorOpioidExposure: 'prior',
    imaging: {
      modality: 'MRI',
      bodyRegion: 'Lumbar spine',
      reportDate: '2025-11-12',
      summary: 'Mild degenerative disc changes without clear nerve root compression.',
      findings: [
        'Mild L4-L5 disc bulge',
        'No severe canal stenosis',
        'No acute fracture',
      ],
      structuralContribution: 'Low',
      correlationNote:
        'Structural findings appear limited relative to inflammatory markers and patient-reported symptoms. Clinical correlation recommended.',
    },
  },
  {
    id: 'patient-b',
    label: 'Patient B',
    name: 'James Carter',
    age: 47,
    pathway: 'Chronic widespread pain · Primary care',
    painScore: 6,
    bpiInterference: 8,
    dn4: 1,
    sleepEfficiency: 58,
    deepSleepPct: 4,
    hrv: 17,
    restingHrDelta: 3,
    steps: 3100,
    activityVariance: 82,
    il6: 2.4,
    crp: 1.8,
    esr: 9,
    hba1c: 5.4,
    vitaminD: 28,
    symptoms: ['widespread pain', 'non-restorative sleep', 'fatigue'],
    lastCheckIn: 'Today, 7:30 AM',
    currentOpioidUse: true,
    mmePerDay: 45,
    priorOpioidExposure: 'chronic',
    imaging: {
      modality: 'MRI',
      bodyRegion: 'Lumbar spine',
      reportDate: '2025-10-28',
      summary: 'Multilevel degenerative changes common in chronic back pain populations.',
      findings: [
        'Moderate degenerative disc disease',
        'Facet arthropathy',
        'No acute inflammatory lesion noted in report',
      ],
      structuralContribution: 'Moderate',
      correlationNote:
        'Imaging may explain some mechanical symptoms, but sleep disruption, low HRV, and widespread symptoms suggest non-structural contributors may also be relevant.',
    },
  },
  {
    id: 'patient-c',
    label: 'Patient C',
    name: 'Anika Rao',
    age: 52,
    pathway: 'Diabetic neuropathy · Endocrine follow-up',
    painScore: 6,
    bpiInterference: 5,
    dn4: 5,
    sleepEfficiency: 71,
    deepSleepPct: 11,
    hrv: 36,
    restingHrDelta: 2,
    steps: 2800,
    activityVariance: 41,
    il6: 3.1,
    crp: 2.1,
    esr: 11,
    hba1c: 8.4,
    vitaminD: 12,
    symptoms: ['burning feet', 'numbness', 'tingling at night'],
    lastCheckIn: 'Yesterday, 9:20 PM',
    currentOpioidUse: false,
    mmePerDay: 0,
    priorOpioidExposure: 'none',
    imaging: {
      modality: 'X-ray',
      bodyRegion: 'Foot/ankle',
      reportDate: '2025-12-03',
      summary: 'No acute osseous abnormality.',
      findings: [
        'No acute fracture',
        'Mild degenerative change',
        'No focal destructive lesion',
      ],
      structuralContribution: 'Low',
      correlationNote:
        'Imaging does not appear to fully explain burning, numbness, and tingling symptoms. Metabolic and neuropathic signals may warrant review.',
    },
  },
]
