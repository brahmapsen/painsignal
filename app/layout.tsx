import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PainSignal Prototype',
  description: 'Clinician-reviewed pain intelligence prototype',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="text-slate-950">{children}</body>
    </html>
  )
}
