import { ScanLine } from 'lucide-react'
import { Card } from '@/components/Card'
import { RiskBadge } from '@/components/RiskBadge'
import type { Patient } from '@/lib/data'
import { NO_IMAGING_CONTEXT_MESSAGE, structuralContextSummary, type Risk } from '@/lib/rules'

export function StructuralContextCard({ patient }: { patient: Patient }) {
  const imaging = patient.imaging
  const summary = structuralContextSummary(patient)

  return (
    <Card className="border-slate-300 bg-slate-50">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">Structural Context</h3>
        </div>
        <span className="rounded-full border border-slate-400 bg-white px-2.5 py-0.5 text-xs text-slate-700">
          Supporting Layer
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-600">
        Imaging is used as a supporting structural context layer and is not required for PainSignal analysis.
      </p>

      {!imaging ? (
        <p className="mt-3 text-sm text-slate-700">{NO_IMAGING_CONTEXT_MESSAGE}</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-800">
            <span>
              <span className="font-semibold">{imaging.modality}</span> · {imaging.bodyRegion}
            </span>
            <span className="text-slate-600">Report date: {imaging.reportDate}</span>
            <span className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Structural contribution:</span>
              <RiskBadge level={imaging.structuralContribution as Risk} />
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-800">
            <span className="font-semibold">Report summary:</span> {imaging.summary}
          </p>

          <div className="mt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-600">Key reported findings</p>
            <ul className="mt-1.5 space-y-1">
              {imaging.findings.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-800">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
            <span className="font-semibold">Correlation note:</span> {imaging.correlationNote}
          </p>
        </>
      )}

      <p className="mt-3 text-xs text-slate-600">{summary}</p>
    </Card>
  )
}
