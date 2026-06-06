import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PainSignal — Opioid Risk Intelligence',
  description: 'Clinician decision support that organizes pain and opioid escalation signals for review',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-950">{children}</body>
    </html>
  )
}
