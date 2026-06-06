import Link from 'next/link'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { RiskBadge } from '@/components/RiskBadge'
import { patients } from '@/lib/patients'
import { CLINICAL_DISCLAIMER, opioidEscalationLevel, phenotype } from '@/lib/rules'
import { contentWidthClass } from '@/lib/layout'

export default function PopulationPage() {
  const sorted = [...patients].sort((a, b) => b.opioidRiskScore - a.opioidRiskScore)

  return (
    <main>
      <Header />
      <section className={`${contentWidthClass} py-5`}>
        <div className="mb-4">
          <p className="text-xs font-normal uppercase tracking-wide text-sky-800">Population monitoring</p>
          <h1 className="mt-0.5 text-xl font-bold text-slate-950 sm:text-2xl">All Patients — Opioid Risk Queue</h1>
          <p className="mt-1 text-sm text-slate-700">
            {patients.length} patients · sorted by opioid escalation risk
          </p>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs text-slate-700">
                <tr>
                  <th className="px-3 py-2">Patient</th>
                  <th className="px-3 py-2">Opioid risk</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Phenotype</th>
                  <th className="px-3 py-2">MME/day</th>
                  <th className="px-3 py-2">Review summary</th>
                </tr>
              </thead>
              <tbody className="text-slate-800">
                {sorted.map(p => (
                  <tr key={p.id} className="border-t border-slate-200">
                    <td className="px-3 py-2.5">
                      <Link href={`/?patient=${p.id}`} className="font-semibold text-sky-900 hover:underline">
                        {p.label}: {p.name}
                      </Link>
                      <div className="text-xs text-slate-500">Age {p.age} · {p.lastCheckIn}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <RiskBadge level={opioidEscalationLevel(p.opioidRiskScore)} />
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-950">{p.opioidRiskScore}/100</td>
                    <td className="px-3 py-2.5">{phenotype(p)}</td>
                    <td className="px-3 py-2.5">{p.currentOpioidUse ? p.mmePerDay : '—'}</td>
                    <td className="px-3 py-2.5">{p.nextBestAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="mt-4 text-center text-xs text-slate-500">{CLINICAL_DISCLAIMER}</p>
      </section>
    </main>
  )
}
