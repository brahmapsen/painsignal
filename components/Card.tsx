export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-300 bg-white p-3.5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}
