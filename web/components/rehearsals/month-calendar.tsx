'use client'

import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { Rehearsal, Ensemble } from '@/lib/types'
import NewRehearsalDialog from './new-rehearsal-dialog'
import RehearsalDetail from './rehearsal-detail'

const DAY_LABELS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']
const MONTH_LABELS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

export default function MonthCalendar({
  rehearsals,
  ensembles,
  canManage,
  canViewAttendance,
}: {
  rehearsals: Rehearsal[]
  ensembles: Ensemble[]
  canManage: boolean
  canViewAttendance: boolean
}) {
  const [cursor, setCursor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [newDialogOpen, setNewDialogOpen] = useState(false)

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  function rehearsalsOnDay(day: Date) {
    return rehearsals.filter((r) => isSameDay(new Date(r.rehearsal_datetime), day))
  }

  const selectedRehearsals = selectedDay ? rehearsalsOnDay(selectedDay) : []

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor((c) => subMonths(c, 1))} className="text-ink/60 hover:text-ink">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-serif text-lg text-ink">
            {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
          </h2>
          <button onClick={() => setCursor((c) => addMonths(c, 1))} className="text-ink/60 hover:text-ink">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs text-ink/50 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const inMonth = isSameMonth(day, cursor)
            const dayRehearsals = rehearsalsOnDay(day)
            const selected = selectedDay && isSameDay(day, selectedDay)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(day)}
                onDoubleClick={() => {
                  setSelectedDay(day)
                  if (canManage) setNewDialogOpen(true)
                }}
                className={`min-h-[88px] rounded-lg border p-1.5 flex flex-col items-center gap-1 transition
                  ${inMonth ? 'text-ink' : 'text-ink/30'}
                  ${selected ? 'border-wine bg-wine/10' : 'border-[#DCD3C0] hover:border-ink/30'}
                `}
              >
                <span className={`text-sm ${isToday(day) ? 'font-semibold' : ''}`}>{day.getDate()}</span>
                <div className="flex flex-col gap-1 w-full">
                  {dayRehearsals.slice(0, 3).map((r) => (
                    <span
                      key={r.id}
                      className="text-[11px] leading-none rounded-full border border-ink/30 px-2 py-1 text-center"
                    >
                      {format(new Date(r.rehearsal_datetime), 'HH:mm')}
                    </span>
                  ))}
                  {dayRehearsals.length > 3 && (
                    <span className="text-[10px] text-ink/50">+{dayRehearsals.length - 3} još</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="w-80 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-base text-ink">
            {selectedDay ? format(selectedDay, 'd.M.yyyy.') : 'Izaberi dan'}
          </h3>
          {canManage && selectedDay && (
            <button
              onClick={() => setNewDialogOpen(true)}
              className="text-wine hover:text-wine/80"
              aria-label="Nova proba"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {selectedDay && selectedRehearsals.length === 0 && (
          <p className="text-sm text-ink/40 italic">Nema zakazanih proba.</p>
        )}

        <div className="flex flex-col gap-2">
          {selectedRehearsals.map((r) => {
            const ensemble = ensembles.find((e) => e.id === r.ensemble_id)
            return (
              <RehearsalDetail
                key={r.id}
                rehearsal={r}
                ensembleName={ensemble?.ensemble_name ?? '—'}
                canViewAttendance={canViewAttendance}
                canRecordAttendance={canManage}
              />
            )
          })}
        </div>
      </div>

      {selectedDay && (
        <NewRehearsalDialog
          open={newDialogOpen}
          onOpenChange={setNewDialogOpen}
          defaultDate={selectedDay}
          ensembles={ensembles}
        />
      )}
    </div>
  )
}