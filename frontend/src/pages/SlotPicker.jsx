import { useEffect, useState } from 'react'

import { api } from '../api/client.js'

const packages = [
  { code: 'GENERAL', label: 'ตรวจสุขภาพทั่วไป' },
  { code: 'EXECUTIVE', label: 'ตรวจสุขภาพผู้บริหาร' },
]

function formatDate(date) {
  return date.toISOString().slice(0, 10)
}

// รองรับ FR-BKG-01 และ FR-BKG-06 สำหรับการเลือกแพ็กเกจและช่วงเวลาที่ว่าง
export default function SlotPicker() {
  const today = formatDate(new Date())
  const lastDate = new Date()
  lastDate.setDate(lastDate.getDate() + 29)
  const [dateFrom, setDateFrom] = useState(today)
  const [packageCode, setPackageCode] = useState(packages[0].code)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    api.getSlots({ dateFrom, packageCode })
      .then((response) => {
        if (active) setSlots(response.slots ?? response)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [dateFrom, packageCode])

  return (
    <main className="mx-auto min-h-screen max-w-3xl bg-slate-50 px-6 py-10 text-slate-900">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Health check booking</p>
        <h1 className="mt-2 text-3xl font-bold text-teal-950">ระบบจองคิวตรวจสุขภาพ</h1>
        <p className="mt-2 text-slate-600">เลือกแพ็กเกจและวันเพื่อดูช่วงเวลาที่ว่าง</p>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="slot-picker-title">
        <h2 id="slot-picker-title" className="text-xl font-semibold text-slate-900">เลือกช่วงเวลาตรวจ</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            แพ็กเกจ
            <select
              aria-label="แพ็กเกจ"
              className="rounded-lg border border-slate-300 px-3 py-2"
              value={packageCode}
              onChange={(event) => setPackageCode(event.target.value)}
            >
              {packages.map((item) => <option key={item.code} value={item.code}>{item.label}</option>)}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            วันตรวจ
            <input
              aria-label="วันตรวจ"
              className="rounded-lg border border-slate-300 px-3 py-2"
              type="date"
              min={today}
              max={formatDate(lastDate)}
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="mt-6" aria-live="polite">
        {loading && <p className="rounded-lg bg-white p-4 text-slate-600">กำลังโหลดช่วงเวลาที่ว่าง...</p>}
        {!loading && error && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
        {!loading && !error && slots.length === 0 && (
          <p className="rounded-lg bg-white p-4 text-slate-600">ไม่พบช่วงเวลาที่ว่าง</p>
        )}
        {!loading && !error && slots.length > 0 && (
          <ul className="grid gap-3 sm:grid-cols-2" aria-label="ช่วงเวลาที่ว่าง">
            {slots.map((slot) => (
              <li key={slot.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <div>
                  <p className="font-semibold text-slate-900">{slot.start_time}</p>
                  <p className="text-sm text-slate-500">{slot.slot_date ?? dateFrom}</p>
                </div>
                <p className="text-sm font-medium text-teal-800">เหลือ {slot.remaining} ที่</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}