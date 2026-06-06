'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ClipboardList, Stethoscope } from 'lucide-react'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { RiskBadge } from '@/components/RiskBadge'
import { patients } from '@/lib/data'
import {
  answersFromPatient,
  loadQuestionnaire,
  mergedRiskScore,
  questionnaireContributions,
  questionnaireRiskAdjustment,
  questionnaireSignals,
  type QuestionnaireAnswers,
} from '@/lib/questionnaire'
import {
  explanation,
  keyMarkers,
  phenotype,
  phenotypeStyle,
  phenotypeSummary,
  riskLevel,
  riskScore,
  type BiomarkerStatus,
} from '@/lib/rules'
import { contentWidthClass } from '@/lib/layout'

function StatusChip({ status }: { status: BiomarkerStatus }) {
  const cls =
    status === 'high'
      ? 'bg-red-100 text-red-800'
      : status === 'low'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-emerald-100 text-emerald-800'
  const label = status === 'high' ? 'High' : status === 'low' ? 'Low' : 'Normal'
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
}

export default function Dashboard() {
  return (
    <Suspense fallback={<main className="px-5 py-5 text-sm font-medium text-slate-700">Loading dashboard…</main>}>
      <DashboardContent />
    </Suspense>
  )
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const initialPatient = searchParams.get('patient') ?? patients[0].id

  const [selectedId, setSelectedId] = useState(initialPatient)
  const [answers, setAnswers] = useState<QuestionnaireAnswers | null>(null)

  const patient = patients.find(p => p.id === selectedId) ?? patients[0]
  const baseScore = riskScore(patient)
  const adjustment = answers ? questionnaireRiskAdjustment(answers) : 0
  const score = answers ? mergedRiskScore(baseScore, answers) : baseScore
  const level = riskLevel(score)
  const type = phenotype(patient)
  const style = phenotypeStyle(type)
  const markers = keyMarkers(patient)
  const labReasons = explanation(patient)
  const questionnaireReasons = answers ? questionnaireSignals(answers) : []
  const contributions = answers ? questionnaireContributions(answers) : []

  useEffect(() => {
    const fromUrl = searchParams.get('patient')
    if (fromUrl && patients.some(p => p.id === fromUrl)) {
      setSelectedId(fromUrl)
    }
  }, [searchParams])

  useEffect(() => {
    const saved = loadQuestionnaire(selectedId)
    const p = patients.find(x => x.id === selectedId) ?? patients[0]
    setAnswers(saved ?? answersFromPatient(p))
  }, [selectedId])

  return (
    <main>
      <Header />
      <section className={`${contentWidthClass} py-5`}>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-800">Clinician phenotype dashboard</p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Pain Management for Value-Based Care
            </h1>
          </div>
          <label className="relative block w-full sm:w-64">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Select patient</span>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-400 bg-white py-2 pl-3 pr-9 text-sm font-semibold text-slate-950 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200"
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

        <div className={`rounded-lg border-2 p-4 sm:p-5 ${style.banner}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Phenotype classification</span>
              </div>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">{type}</h2>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-snug">{phenotypeSummary(patient)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-0.5">
              <div className="flex items-center gap-2">
                <RiskBadge level={level} />
                <span className="text-xl font-bold">{score}/100</span>
              </div>
              {adjustment > 0 && (
                <span className="text-xs font-medium text-slate-800">
                  {baseScore} base + {adjustment} questionnaire
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {markers.map(m => (
            <Card key={m.label} className="text-center">
              <div className="text-xs font-semibold text-slate-700">{m.label}</div>
              <div className="mt-1 text-xl font-bold text-slate-950">{m.value}</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <StatusChip status={m.status} />
                <span className="text-xs font-medium text-slate-600">{m.note}</span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-sky-800" />
              <h3 className="text-base font-bold text-slate-950">Questionnaire inputs</h3>
            </div>
            <Link href={`/questionnaire?patient=${selectedId}`} className="text-sm font-semibold text-sky-800 hover:underline">
              Edit questionnaire →
            </Link>
          </div>
          <p className="mt-1.5 text-sm font-medium text-slate-800">
            Patient-reported answers from the clinical visit are merged with objective labs and wearables below.
          </p>

          {contributions.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs font-semibold text-slate-800">
                  <tr>
                    <th className="px-3 py-1.5">Questionnaire answer</th>
                    <th className="px-3 py-1.5">Factors into</th>
                    <th className="px-3 py-1.5">Impact on analysis</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map(row => (
                    <tr key={row.question} className="border-t border-slate-200">
                      <td className="px-3 py-2 font-medium text-slate-950">
                        <span className="font-bold">{row.question}:</span> {row.answer}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-800">{row.affects}</td>
                      <td className="px-3 py-2 font-semibold text-sky-900">{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm font-medium text-slate-700">No questionnaire flags recorded for this patient.</p>
          )}

          {questionnaireReasons.length > 0 && (
            <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-900">Questionnaire confirms</p>
              <ul className="mt-1.5 space-y-0.5">
                {questionnaireReasons.map(r => (
                  <li key={r} className="text-sm font-medium text-slate-900">
                    • {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Patient context</h3>
            <p className="mt-1.5 text-base font-bold text-slate-950">
              {patient.label}: {patient.name}, {patient.age}y
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">{patient.pathway}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-600">Last check-in: {patient.lastCheckIn}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {patient.symptoms.map(s => (
                <span key={s} className={`rounded-full border px-2.5 py-0.5 text-xs ${style.chip}`}>
                  {s}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Why this phenotype</h3>
            <p className="mt-1 text-xs font-semibold text-slate-600">Labs & wearables</p>
            <ul className="mt-1.5 space-y-1">
              {labReasons.map(r => (
                <li key={r} className="flex items-start gap-2 text-sm font-medium text-slate-900">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.accent.replace('text-', 'bg-')}`} />
                  {r}
                </li>
              ))}
            </ul>
            {questionnaireReasons.length > 0 && (
              <>
                <p className="mt-3 text-xs font-semibold text-slate-600">Questionnaire</p>
                <ul className="mt-1.5 space-y-1">
                  {questionnaireReasons.map(r => (
                    <li key={`q-${r}`} className="flex items-start gap-2 text-sm font-medium text-slate-900">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-700" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Card>
            <div className="text-xs font-semibold text-slate-700">Pain today (PRO)</div>
            <div className="mt-0.5 text-lg font-bold">{answers?.painToday ?? patient.painScore}/10</div>
          </Card>
          <Card>
            <div className="text-xs font-semibold text-slate-700">Sleep efficiency</div>
            <div className="mt-0.5 text-lg font-bold">{patient.sleepEfficiency}%</div>
          </Card>
          <Card>
            <div className="text-xs font-semibold text-slate-700">Steps (24h)</div>
            <div className="mt-0.5 text-lg font-bold">{patient.steps.toLocaleString()}</div>
          </Card>
          <Card>
            <div className="text-xs font-semibold text-slate-700">Function interference (PRO)</div>
            <div className="mt-0.5 text-lg font-bold">{answers?.interference ?? patient.bpiInterference}/10</div>
          </Card>
        </div>

        <p className="mt-4 text-center text-xs font-medium text-slate-600">
          Workflow support only — not autonomous diagnosis.{' '}
          <Link href={`/patients/${patient.id}`} className="font-semibold text-sky-800 hover:underline">
            View full record →
          </Link>
        </p>
      </section>
    </main>
  )
}
