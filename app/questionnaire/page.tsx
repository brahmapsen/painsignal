'use client'

import Link from 'next/link'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ClipboardList } from 'lucide-react'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { patients } from '@/lib/patients'
import { CLINICAL_DISCLAIMER, phenotype, riskLevel, riskScore } from '@/lib/rules'
import {
  QUESTIONS,
  answersFromPatient,
  loadQuestionnaire,
  questionnaireContributions,
  questionnaireRiskAdjustment,
  questionnaireSignals,
  saveQuestionnaire,
  type QuestionnaireAnswers,
} from '@/lib/questionnaire'
import { contentWidthClass } from '@/lib/layout'

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<main className="px-5 py-5 text-sm text-slate-700">Loading questionnaire…</main>}>
      <QuestionnaireContent />
    </Suspense>
  )
}

function QuestionnaireContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialId = searchParams.get('patient') ?? patients[0].id
  const [patientId, setPatientId] = useState(initialId)
  const patient = patients.find(p => p.id === patientId) ?? patients[0]

  const [answers, setAnswers] = useState<QuestionnaireAnswers>(() => answersFromPatient(patient))

  useEffect(() => {
    const fromUrl = searchParams.get('patient')
    if (fromUrl && patients.some(p => p.id === fromUrl)) {
      setPatientId(fromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    const p = patients.find(x => x.id === patientId) ?? patients[0]
    const saved = loadQuestionnaire(patientId)
    setAnswers(saved ?? answersFromPatient(p))
  }, [patientId])

  function selectPatient(id: string) {
    setPatientId(id)
  }

  function update<K extends keyof QuestionnaireAnswers>(key: K, value: QuestionnaireAnswers[K]) {
    setAnswers(prev => ({ ...prev, [key]: value }))
  }

  const baseScore = riskScore(patient)
  const adjustment = questionnaireRiskAdjustment(answers)
  const mergedScore = Math.min(baseScore + adjustment, 100)
  const contributions = useMemo(() => questionnaireContributions(answers), [answers])
  const signals = useMemo(() => questionnaireSignals(answers), [answers])
  const type = phenotype(patient)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    saveQuestionnaire(patientId, answers)
    router.push(`/?patient=${patientId}`)
  }

  return (
    <main>
      <Header />
      <section className={`${contentWidthClass} py-5`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-normal uppercase tracking-wide text-sky-800">Physician-administered intake</p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Clinical pain questionnaire</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-700">
              Capture patient responses during the visit. Answers are organized with labs and wearable data for clinician review.
            </p>
          </div>
          <label className="relative block w-full sm:w-56">
            <span className="mb-1 block text-xs font-normal text-slate-700">Patient</span>
            <select
              value={patientId}
              onChange={e => selectPatient(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-400 bg-white py-2 pl-3 pr-9 text-sm font-normal text-slate-950 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.label} — {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute bottom-2.5 right-3 h-4 w-4 text-slate-600" />
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <h3 className="mb-3 text-sm font-bold text-slate-900">
              <ClipboardList className="mr-1 inline h-4 w-4 text-sky-800" />
              Questions for {patient.name}
            </h3>
            <div className="space-y-4">
              {QUESTIONS.map((q, i) => (
                <div key={q.id} className="border-t border-slate-200 pt-4 first:border-0 first:pt-0">
                  <p className="text-sm font-normal text-slate-950">
                    {i + 1}. {q.text}
                  </p>

                  {q.type === 'scale' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{q.min}</span>
                        <span className="text-base font-semibold text-sky-900">{answers[q.id]}/10</span>
                        <span>{q.max}</span>
                      </div>
                      <input
                        type="range"
                        min={q.min}
                        max={q.max}
                        value={answers[q.id]}
                        onChange={e => update(q.id, Number(e.target.value) as QuestionnaireAnswers[typeof q.id])}
                        className="mt-2 w-full accent-sky-700"
                      />
                    </div>
                  )}

                  {q.type === 'choice' && (
                    <div className="mt-2 flex gap-2">
                      {q.options.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => update(q.id, opt.value)}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-normal transition ${
                            answers[q.id] === opt.value
                              ? 'border-sky-700 bg-sky-50 text-sky-950'
                              : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'yesno' && (
                    <div className="mt-2 flex gap-2">
                      {([true, false] as const).map(val => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => update(q.id, val)}
                          className={`rounded-lg border px-3 py-1.5 text-sm font-normal transition ${
                            answers[q.id] === val
                              ? 'border-sky-700 bg-sky-50 text-sky-950'
                              : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400'
                          }`}
                        >
                          {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card className="mt-4">
            <h2 className="text-base font-bold text-slate-950">Live analysis preview</h2>
            <p className="mt-0.5 text-sm text-slate-700">
              How these responses may factor into the organized signal view for {patient.label}.
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs text-slate-600">Labs + wearables base</div>
                <div className="mt-0.5 text-xl font-semibold">{baseScore}/100</div>
              </div>
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                <div className="text-xs text-sky-900">Questionnaire adjustment</div>
                <div className="mt-0.5 text-xl font-semibold text-sky-950">+{adjustment} pts</div>
              </div>
              <div className="rounded-lg bg-slate-900 p-3 text-white">
                <div className="text-xs text-slate-300">Merged risk score</div>
                <div className="mt-0.5 text-xl font-semibold">
                  {mergedScore}/100 · {riskLevel(mergedScore)}
                </div>
              </div>
            </div>

            <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
              <span className="font-semibold">Signal pattern (labs):</span> {type}
              {signals.length > 0 && (
                <span className="text-slate-700"> — {signals.length} questionnaire signal(s) for review</span>
              )}
            </p>

            {contributions.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs text-slate-700">
                    <tr>
                      <th className="pb-1.5 pr-3">Answer</th>
                      <th className="pb-1.5 pr-3">Affects</th>
                      <th className="pb-1.5">Contribution to index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contributions.map(row => (
                      <tr key={row.question} className="border-t border-slate-200">
                        <td className="py-1.5 pr-3 text-slate-800">
                          <span className="font-semibold">{row.question}:</span> {row.answer}
                        </td>
                        <td className="py-1.5 pr-3 text-slate-700">{row.affects}</td>
                        <td className="py-1.5 text-sky-900">{row.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-600">No questionnaire flags at current answers.</p>
            )}
          </Card>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              {CLINICAL_DISCLAIMER} Saved locally for demo.
            </p>
            <div className="flex gap-2">
              <Link
                href="/"
                className="rounded-lg border border-slate-400 px-4 py-2 text-sm font-normal text-slate-800 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-sky-900 px-4 py-2 text-sm font-normal text-white hover:bg-sky-950"
              >
                Save & view on dashboard
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}
