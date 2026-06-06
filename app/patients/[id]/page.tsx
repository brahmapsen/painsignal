import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { RiskBadge } from '@/components/RiskBadge'
import { patients } from '@/lib/patients'
import {
  CLINICAL_CONTEXT_FOR_OPIOID_REVIEW,
  CLINICAL_DISCLAIMER,
  CLINICAL_FACTORS_BULLETS,
  CLINICAL_FACTORS_INTRO,
  explanation,
  opioidAnalysis,
  opioidEscalationLevel,
  phenotype,
  phenotypeSummary,
  supportingEvidence,
  riskLevel,
  riskScore,
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

export default function PatientDetail({ params }: { params: { id: string } }) {
  const p = patients.find(x => x.id === params.id)
  if (!p) notFound()

  const score = riskScore(p)
  const level = riskLevel(score)
  const opioid = opioidAnalysis(p)
  const reasons = explanation(p)
  const evidence = supportingEvidence(p)

  return (
    <main>
      <Header />
      <section className={`${contentWidthClass} py-5`}>
        <Link href="/" className="text-sm text-sky-800 hover:underline">
          ← Back to dashboard
        </Link>

        <div className="mt-3 flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">{p.name}</h1>
            <p className="mt-1 text-sm text-slate-700">
              {p.pathway} · Last check-in: {p.lastCheckIn}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={opioidEscalationLevel(p.opioidRiskScore)} />
            <span className="text-xl font-semibold">{p.opioidRiskScore}/100 escalation risk index</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card>
            <div className="text-xs text-slate-600">Opioid use status</div>
            <div className="mt-1 text-lg font-semibold">{p.currentOpioidUse ? 'Active' : 'None reported'}</div>
            <p className="text-sm text-slate-700">
              MME {p.mmePerDay}/day · Prior exposure: {p.priorOpioidExposure}
            </p>
          </Card>
          <Card>
            <div className="text-xs text-slate-600">Pain / function (PRO)</div>
            <div className="mt-1 text-2xl font-semibold">{p.painScore}/10</div>
            <p className="text-sm text-slate-700">Interference: {p.bpiInterference}/10</p>
          </Card>
          <Card>
            <div className="text-xs text-slate-600">Sleep / HRV</div>
            <div className="mt-1 text-2xl font-semibold">{p.sleepEfficiency}%</div>
            <p className="text-sm text-slate-700">
              HRV: {p.hrv} ms · Deep sleep: {p.deepSleepPct}%
            </p>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="text-base font-bold text-slate-950">Opioid escalation signals</h2>
            <p className="mt-2 text-sm text-slate-800">
              Stratification level: {opioid.level} · {opioid.confidence}% model confidence
            </p>
            <p className="mt-1 text-sm text-slate-700">Primary signal: {opioid.primaryDriver}</p>
            <p className="mt-2 rounded-lg bg-orange-50 px-3 py-2 text-sm text-orange-950">
              <span className="font-semibold">For clinician review:</span> {p.nextBestAction}
            </p>
          </Card>
          <Card>
            <h2 className="text-base font-bold text-slate-950">Signal pattern summary</h2>
            <p className="mt-2 rounded-lg border border-sky-200 bg-sky-50 p-3 font-semibold text-sky-950">
              {phenotype(p)}
            </p>
            <p className="mt-2 text-sm text-slate-700">{phenotypeSummary(p)}</p>
            <p className="mt-1 text-sm text-slate-600">Composite signal score: {score}/100 ({level})</p>
          </Card>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Card>
            <h2 className="text-base font-bold text-slate-950">Clinical Factors for Review</h2>
            <p className="mt-2 text-sm text-slate-800">{CLINICAL_FACTORS_INTRO}</p>
            <ul className="mt-2 space-y-1 text-sm text-slate-800">
              {CLINICAL_FACTORS_BULLETS.map(s => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </Card>
          <Card>
            <h2 className="text-base font-bold text-slate-950">Clinical Context for Opioid Review</h2>
            <p className="mt-2 text-sm leading-snug text-slate-800">{CLINICAL_CONTEXT_FOR_OPIOID_REVIEW}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-700">
              {reasons.map(r => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-4">
          <h2 className="text-base font-bold text-slate-950">Supporting Evidence</h2>
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
          <div className="text-xs text-slate-600">Laboratory markers</div>
          <div className="mt-1 text-lg font-semibold">
            CRP {p.crp} · IL-6 {p.il6} · DN4 {p.dn4}/10
          </div>
          <p className="text-sm text-slate-700">
            HbA1c {p.hba1c}% · Vit D {p.vitaminD} ng/mL · ESR {p.esr}
          </p>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-500">{CLINICAL_DISCLAIMER}</p>
      </section>
    </main>
  )
}
