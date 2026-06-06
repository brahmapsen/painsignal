export function RiskBadge({ level }: { level: 'Low' | 'Moderate' | 'High' }) {
  const cls =
    level === 'High'
      ? 'bg-red-100 text-red-900 border-red-400'
      : level === 'Moderate'
        ? 'bg-amber-100 text-amber-950 border-amber-400'
        : 'bg-emerald-100 text-emerald-900 border-emerald-400'
  return <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{level}</span>
}
