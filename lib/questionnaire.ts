import { Patient } from './data'

export type QuestionnaireAnswers = {
  painToday: number
  interference: number
  sleepRestfulness: number
  painDistribution: 'widespread' | 'localized'
  morningStiffness: boolean
  jointSwelling: boolean
  neuropathicSymptoms: boolean
  diabetesDiagnosis: boolean
  allodynia: boolean
  painWorseWithPoorSleep: boolean
}

export type QuestionnaireContribution = {
  question: string
  answer: string
  affects: string
  impact: string
  points: number
}

export const QUESTIONS = [
  {
    id: 'painToday' as const,
    text: 'On a scale of 0–10, how would you rate your pain today?',
    type: 'scale' as const,
    min: 0,
    max: 10,
  },
  {
    id: 'interference' as const,
    text: 'How much is pain interfering with daily activities? (0–10)',
    type: 'scale' as const,
    min: 0,
    max: 10,
  },
  {
    id: 'sleepRestfulness' as const,
    text: 'How rested do you feel after sleep? (0 = not at all, 10 = fully rested)',
    type: 'scale' as const,
    min: 0,
    max: 10,
  },
  {
    id: 'painDistribution' as const,
    text: 'Is your pain widespread across multiple body areas, or localized to one region?',
    type: 'choice' as const,
    options: [
      { value: 'widespread' as const, label: 'Widespread' },
      { value: 'localized' as const, label: 'Localized' },
    ],
  },
  {
    id: 'morningStiffness' as const,
    text: 'Do you have morning stiffness lasting more than 30 minutes?',
    type: 'yesno' as const,
  },
  {
    id: 'jointSwelling' as const,
    text: 'Do you notice joint swelling, warmth, or redness?',
    type: 'yesno' as const,
  },
  {
    id: 'neuropathicSymptoms' as const,
    text: 'Do you experience burning, tingling, numbness, or electric-shock sensations?',
    type: 'yesno' as const,
  },
  {
    id: 'diabetesDiagnosis' as const,
    text: 'Has the patient been told they have diabetes or prediabetes?',
    type: 'yesno' as const,
  },
  {
    id: 'allodynia' as const,
    text: 'Does light touch, clothing, or pressure sometimes feel painful?',
    type: 'yesno' as const,
  },
  {
    id: 'painWorseWithPoorSleep' as const,
    text: 'Does your pain noticeably worsen after a poor night of sleep?',
    type: 'yesno' as const,
  },
]

const STORAGE_KEY = 'painsignal-questionnaires'

export function answersFromPatient(p: Patient): QuestionnaireAnswers {
  const widespread =
    p.activityVariance > 70 ||
    p.symptoms.some(s => s.includes('widespread') || s.includes('fatigue'))

  return {
    painToday: p.painScore,
    interference: p.bpiInterference,
    sleepRestfulness: Math.round(p.sleepEfficiency / 10),
    painDistribution: widespread ? 'widespread' : 'localized',
    morningStiffness: p.symptoms.some(s => s.includes('stiffness')),
    jointSwelling: p.symptoms.some(s => s.includes('swelling') || s.includes('warmth')),
    neuropathicSymptoms:
      p.dn4 >= 4 ||
      p.symptoms.some(s => s.includes('burning') || s.includes('tingling') || s.includes('numbness')),
    diabetesDiagnosis: p.hba1c >= 6.5,
    allodynia: p.symptoms.some(s => s.includes('widespread')) || p.bpiInterference >= 7,
    painWorseWithPoorSleep: p.sleepEfficiency < 70 || p.symptoms.some(s => s.includes('sleep')),
  }
}

export function loadQuestionnaire(patientId: string): QuestionnaireAnswers | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const all = JSON.parse(raw) as Record<string, QuestionnaireAnswers>
    return all[patientId] ?? null
  } catch {
    return null
  }
}

export function saveQuestionnaire(patientId: string, answers: QuestionnaireAnswers) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? (JSON.parse(raw) as Record<string, QuestionnaireAnswers>) : {}
    all[patientId] = answers
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    /* ignore storage errors in demo */
  }
}

export function questionnaireContributions(answers: QuestionnaireAnswers): QuestionnaireContribution[] {
  const rows: QuestionnaireContribution[] = []

  if (answers.painToday >= 7) {
    rows.push({
      question: 'Pain today',
      answer: `${answers.painToday}/10`,
      affects: 'Risk score',
      impact: '+20 pts',
      points: 20,
    })
  }

  if (answers.interference >= 7) {
    rows.push({
      question: 'Daily interference',
      answer: `${answers.interference}/10`,
      affects: 'Risk score · Function flag',
      impact: '+15 pts',
      points: 15,
    })
  }

  if (answers.sleepRestfulness <= 5) {
    rows.push({
      question: 'Sleep restfulness',
      answer: `${answers.sleepRestfulness}/10`,
      affects: 'Risk score · Centralized phenotype',
      impact: '+15 pts',
      points: 15,
    })
  }

  if (answers.painDistribution === 'widespread') {
    rows.push({
      question: 'Pain distribution',
      answer: 'Widespread',
      affects: 'Centralized/Fibromyalgia phenotype',
      impact: 'May support review of centralized pattern',
      points: 10,
    })
  }

  if (answers.morningStiffness) {
    rows.push({
      question: 'Morning stiffness',
      answer: 'Yes',
      affects: 'Inflammatory phenotype',
      impact: 'May support review of inflammatory symptoms',
      points: 10,
    })
  }

  if (answers.jointSwelling) {
    rows.push({
      question: 'Joint swelling/warmth',
      answer: 'Yes',
      affects: 'Inflammatory phenotype',
      impact: 'May support review of inflammatory symptoms',
      points: 10,
    })
  }

  if (answers.neuropathicSymptoms) {
    rows.push({
      question: 'Neuropathic symptoms',
      answer: 'Yes',
      affects: 'Risk score · Metabolic/Neuropathic phenotype',
      impact: '+15 pts · DN4 proxy',
      points: 15,
    })
  }

  if (answers.diabetesDiagnosis) {
    rows.push({
      question: 'Diabetes history',
      answer: 'Yes',
      affects: 'Metabolic/Neuropathic phenotype',
      impact: 'May support review of metabolic factors',
      points: 10,
    })
  }

  if (answers.allodynia) {
    rows.push({
      question: 'Allodynia (touch sensitivity)',
      answer: 'Yes',
      affects: 'Centralized/Fibromyalgia phenotype',
      impact: 'May support review of centralized sensitization',
      points: 10,
    })
  }

  if (answers.painWorseWithPoorSleep) {
    rows.push({
      question: 'Pain worse after poor sleep',
      answer: 'Yes',
      affects: 'Centralized/Fibromyalgia phenotype',
      impact: 'May be associated with sleep–pain pattern',
      points: 10,
    })
  }

  return rows
}

export function questionnaireRiskAdjustment(answers: QuestionnaireAnswers): number {
  return questionnaireContributions(answers).reduce((sum, row) => sum + row.points, 0)
}

export function questionnaireSignals(answers: QuestionnaireAnswers): string[] {
  const signals: string[] = []
  if (answers.morningStiffness || answers.jointSwelling) {
    signals.push('Questionnaire responses may be associated with inflammatory symptom pattern')
  }
  if (
    answers.painDistribution === 'widespread' ||
    answers.allodynia ||
    answers.painWorseWithPoorSleep ||
    answers.sleepRestfulness <= 5
  ) {
    signals.push('Questionnaire responses may be associated with centralized pain pattern')
  }
  if (answers.neuropathicSymptoms || answers.diabetesDiagnosis) {
    signals.push('Questionnaire responses may be associated with metabolic/neuropathic pattern')
  }
  if (answers.painToday >= 7) signals.push('Patient-reported pain ≥ 7/10')
  if (answers.interference >= 7) signals.push('High functional interference reported')
  return signals
}

export function mergedRiskScore(baseScore: number, answers: QuestionnaireAnswers): number {
  return Math.min(baseScore + questionnaireRiskAdjustment(answers), 100)
}
