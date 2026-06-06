'use client'

import Link from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronDown, ClipboardList, Pill, ShieldAlert, Stethoscope } from 'lucide-react'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { RiskBadge } from '@/components/RiskBadge'
import { patients } from '@/lib/patients'
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
  CLINICAL_DISCLAIMER,
  CLINICAL_CONTEXT_FOR_OPIOID_REVIEW,
  CLINICAL_FACTORS_BULLETS,
  CLINICAL_FACTORS_INTRO,
  explanation,
  keyMarkers,
  opioidAnalysis,
  phenotype,
  phenotypeStyle,
  phenotypeSummary,
  supportingEvidence,
  riskLevel,
  riskScore,
  type BiomarkerStatus,
  type EvidenceTag,
} from '@/lib/rules'
import { contentWidthClass } from '@/lib/layout'

function EvidenceTagChip({ tag }: { tag: EvidenceTag }) {
  const cls =
    tag === 'Possible contributor'
      ? 'bg-amber-100 text-amber-900'
      : tag === 'Signal present'
        ? 'bg-sky-100 text-sky-900'
        : tag === 'Needs clinician review'
          ? 'bg-orange-100 text-orange-900'
          : 'bg-slate-100 text-slate-700'
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{tag}</span>
}

function StatusChip({ status }: { status: BiomarkerStatus }) {
  const cls =
    status === 'high'
      ? 'bg-red-100 text-red-800'
      : status === 'low'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-emerald-100 text-emerald-800'
  const label = status === 'high' ? 'High' : status === 'low' ? 'Low' : 'Normal'
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

export default function Dashboard() {
  return (
    <Suspense fallback={<main className="px-5 py-5 text-sm text-slate-700">Loading dashboard…</main>}>
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
  const opioid = opioidAnalysis(patient)
  const baseScore = riskScore(patient)
  const adjustment = answers ? questionnaireRiskAdjustment(answers) : 0
  const score = answers ? mergedRiskScore(baseScore, answers) : baseScore
  const level = riskLevel(score)
  const type = phenotype(patient)
  const style = phenotypeStyle(type)
  const markers = keyMarkers(patient)
  const labReasons = explanation(patient)
  const evidence = supportingEvidence(patient)
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
            <p className="text-xs font-normal uppercase tracking-wide text-sky-800">Clinician decision support</p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Opioid Risk Intelligence Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Organizes patient signals for clinician review — not a substitute for clinical judgment.
            </p>
          </div>
          <label className="relative block w-full sm:w-64">
            <span className="mb-1 block text-xs text-slate-600">Select patient</span>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
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

        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="border-2 border-orange-300 bg-orange-50">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-900">
              <Pill className="h-4 w-4" />
              Opioid Escalation Risk
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <RiskBadge level={opioid.level} />
              <span className="text-2xl font-semibold text-slate-950">{opioid.score}/100</span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-slate-700 ring-1 ring-orange-200">
                {opioid.confidence}% confidence
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-800">
              <span className="font-semibold">Primary signal:</span> {opioid.primaryDriver}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-700">
              <span>Current opioid use: {patient.currentOpioidUse ? 'Yes' : 'No'}</span>
              <span>MME/day: {patient.mmePerDay}</span>
              <span>Prior exposure: {patient.priorOpioidExposure}</span>
            </div>
            <p className="mt-2 text-sm text-slate-800">
              <span className="font-semibold">For clinician review:</span> {patient.nextBestAction}
            </p>
          </Card>

          <div className={`rounded-lg border-2 p-4 ${style.banner}`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Signal pattern classification</span>
            </div>
            <h2 className="mt-1.5 text-xl font-bold tracking-tight sm:text-2xl">{type}</h2>
            <p className="mt-1.5 text-sm leading-snug">{phenotypeSummary(patient)}</p>
            <div className="mt-2 flex items-center gap-2">
              <RiskBadge level={level} />
              <span className="text-sm text-slate-800">Composite signal score {score}/100</span>
              {adjustment > 0 && (
                <span className="text-xs text-slate-600">(+{adjustment} questionnaire)</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {markers.map(m => (
            <Card key={m.label} className="text-center">
              <div className="text-xs text-slate-600">{m.label}</div>
              <div className="mt-1 text-xl font-semibold text-slate-950">{m.value}</div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <StatusChip status={m.status} />
                <span className="text-xs text-slate-500">{m.note}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Clinical Factors for Review</h3>
            <p className="mt-1.5 text-sm text-slate-800">{CLINICAL_FACTORS_INTRO}</p>
            <ul className="mt-2 space-y-1">
              {CLINICAL_FACTORS_BULLETS.map(step => (
                <li key={step} className="flex items-start gap-2 text-sm text-slate-800">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-700" />
                  {step}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-900" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-amber-950">Clinical Context for Opioid Review</h3>
            </div>
            <p className="mt-2 text-sm leading-snug text-slate-800">{CLINICAL_CONTEXT_FOR_OPIOID_REVIEW}</p>
          </Card>
        </div>

        <Card className="mt-4">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Supporting Evidence</h3>
          <p className="mt-1 text-sm text-slate-600">
            Patient-specific data points organized for clinician interpretation.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs text-slate-700">
                <tr>
                  <th className="px-3 py-1.5">Measure</th>
                  <th className="px-3 py-1.5">Value</th>
                  <th className="px-3 py-1.5">Review label</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map(item => (
                  <tr key={item.label} className="border-t border-slate-200">
                    <td className="px-3 py-2 text-slate-800">{item.label}</td>
                    <td className="px-3 py-2 font-semibold text-slate-950">{item.value}</td>
                    <td className="px-3 py-2">
                      <EvidenceTagChip tag={item.tag} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="mt-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-sky-800" />
              <h3 className="text-base font-bold text-slate-950">Questionnaire inputs</h3>
            </div>
            <Link href={`/questionnaire?patient=${selectedId}`} className="text-sm text-sky-800 hover:underline">
              Edit questionnaire →
            </Link>
          </div>
          <p className="mt-1.5 text-sm text-slate-700">
            Patient-reported responses merged with labs, wearables, and opioid history for clinician review.
          </p>

          {contributions.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs text-slate-700">
                  <tr>
                    <th className="px-3 py-1.5">Questionnaire answer</th>
                    <th className="px-3 py-1.5">Factors into</th>
                    <th className="px-3 py-1.5">Contribution to index</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.map(row => (
                    <tr key={row.question} className="border-t border-slate-200">
                      <td className="px-3 py-2 text-slate-800">
                        <span className="font-semibold">{row.question}:</span> {row.answer}
                      </td>
                      <td className="px-3 py-2 text-slate-700">{row.affects}</td>
                      <td className="px-3 py-2 text-sky-900">{row.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-600">No questionnaire flags recorded for this patient.</p>
          )}

          {questionnaireReasons.length > 0 && (
            <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-sky-900">Questionnaire signals for review</p>
              <ul className="mt-1.5 space-y-0.5">
                {questionnaireReasons.map(r => (
                  <li key={r} className="text-sm text-slate-800">
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
            <p className="mt-0.5 text-sm text-slate-700">{patient.pathway}</p>
            <p className="mt-0.5 text-xs text-slate-500">Last check-in: {patient.lastCheckIn}</p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {patient.symptoms.map(s => (
                <span key={s} className={`rounded-full border px-2.5 py-0.5 text-xs ${style.chip}`}>
                  {s}
                </span>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Signal summary</h3>
            <p className="mt-1 text-xs text-slate-500">Labs & wearables — for clinician correlation</p>
            <ul className="mt-1.5 space-y-1">
              {labReasons.map(r => (
                <li key={r} className="flex items-start gap-2 text-sm text-slate-800">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${style.accent.replace('text-', 'bg-')}`} />
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Card>
            <div className="text-xs text-slate-600">Pain today (PRO)</div>
            <div className="mt-0.5 text-lg font-semibold">{answers?.painToday ?? patient.painScore}/10</div>
          </Card>
          <Card>
            <div className="text-xs text-slate-600">Sleep efficiency</div>
            <div className="mt-0.5 text-lg font-semibold">{patient.sleepEfficiency}%</div>
          </Card>
          <Card>
            <div className="text-xs text-slate-600">Steps (24h)</div>
            <div className="mt-0.5 text-lg font-semibold">{patient.steps.toLocaleString()}</div>
          </Card>
          <Card>
            <div className="text-xs text-slate-600">Function interference (PRO)</div>
            <div className="mt-0.5 text-lg font-semibold">{answers?.interference ?? patient.bpiInterference}/10</div>
          </Card>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          {CLINICAL_DISCLAIMER}
          {' · '}
          <Link href={`/patients/${patient.id}`} className="text-sky-800 hover:underline">
            View full record →
          </Link>
          {' · '}
          <Link href="/patients" className="text-sky-800 hover:underline">
            Population view →
          </Link>
        </p>
      </section>
    </main>
  )
}
