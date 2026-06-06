'use client'

import { useMemo, useState } from 'react'
import { Header } from '@/components/Header'
import { Card } from '@/components/Card'
import { contentWidthClass } from '@/lib/layout'

type FormState = { pain: number; interference: number; sleep: number; steps: number; dn4: number; symptoms: string }

export default function PatientCheckIn() {
  const [form, setForm] = useState<FormState>({
    pain: 6,
    interference: 5,
    sleep: 72,
    steps: 3200,
    dn4: 2,
    symptoms: 'burning pain after walking',
  })

  const score = useMemo(() => {
    let s = 0
    if (form.pain >= 7) s += 25
    if (form.interference >= 7) s += 20
    if (form.sleep < 70) s += 15
    if (form.steps < 2000) s += 15
    if (form.dn4 >= 4) s += 20
    return Math.min(s, 100)
  }, [form])

  const level = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low'

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <main>
      <Header />
      <section className={`${contentWidthClass} py-5`}>
        <h1 className="text-xl font-bold text-slate-950 sm:text-2xl">Patient daily check-in</h1>
        <p className="mt-1 text-sm font-medium text-slate-800">
          Demo intake form for pain, sleep, activity, and neuropathic symptoms.
        </p>

        <Card className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ['pain', 'Pain today', 0, 10],
                ['interference', 'Daily interference', 0, 10],
                ['sleep', 'Sleep efficiency %', 40, 100],
                ['steps', 'Steps yesterday', 0, 10000],
                ['dn4', 'DN4 neuropathic score', 0, 10],
              ] as const
            ).map(([key, label, min, max]) => (
              <label key={key} className="block">
                <span className="text-sm font-semibold text-slate-800">
                  {label}: {(form as Record<string, number>)[key]}
                </span>
                <input
                  className="mt-1.5 w-full accent-sky-800"
                  type="range"
                  min={min}
                  max={max}
                  value={(form as Record<string, number>)[key]}
                  onChange={e => update(key, Number(e.target.value) as FormState[typeof key])}
                />
              </label>
            ))}
            <label className="md:col-span-2">
              <span className="text-sm font-semibold text-slate-800">Symptoms</span>
              <textarea
                className="mt-1.5 w-full rounded-lg border border-slate-400 p-2.5 text-sm font-medium text-slate-950"
                value={form.symptoms}
                onChange={e => update('symptoms', e.target.value)}
              />
            </label>
          </div>
        </Card>

        <Card className="mt-4">
          <h2 className="text-base font-bold text-slate-950">Computed triage preview</h2>
          <div className="mt-2 text-2xl font-bold">{level} risk · {score}/100</div>
          <p className="mt-1.5 text-sm font-medium text-slate-800">
            This demo uses transparent rules. In a real pilot, the care team would review all flags before any action.
          </p>
        </Card>
      </section>
    </main>
  )
}
