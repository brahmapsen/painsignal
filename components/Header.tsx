import Link from 'next/link'
import { contentWidthClass } from '@/lib/layout'

export function Header() {
  return (
    <header className="border-b border-slate-300 bg-white">
      <div className={`${contentWidthClass} flex items-center justify-between py-2.5`}>
        <Link href="/" className="text-lg font-bold text-sky-950">
          PainSignal
        </Link>
        <nav className="flex gap-4 text-sm font-normal text-slate-800">
          <Link href="/" className="hover:text-sky-900">
            Opioid Risk Dashboard
          </Link>
          <Link href="/patients" className="hover:text-sky-900">
            Population
          </Link>
          <Link href="/questionnaire" className="hover:text-sky-900">
            Questionnaire
          </Link>
          <Link href="/patient-checkin" className="hover:text-sky-900">
            Patient Check-in
          </Link>
        </nav>
      </div>
    </header>
  )
}
