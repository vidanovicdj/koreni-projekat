'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ClipboardList } from 'lucide-react'
import type { Rehearsal } from '@/lib/types'
import AttendanceDialog from './attendance-dialog'
import RehearsalInfoDialog from './rehearsal-info-dialog'

export default function RehearsalDetail({
  rehearsal,
  ensembleName,
  canViewAttendance,
  canRecordAttendance,
}: {
  rehearsal: Rehearsal
  ensembleName: string
  canViewAttendance: boolean
  canRecordAttendance: boolean
}) {
  const [attendanceOpen, setAttendanceOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  return (
    <>
      <div className="border border-[#DCD3C0] rounded-md p-3 flex items-start justify-between">
        <button onClick={() => setInfoOpen(true)} className="text-left hover:opacity-80 transition">
          <p className="text-sm font-medium text-ink">{ensembleName}</p>
          <p className="text-xs text-ink/60 mt-0.5">
            {format(new Date(rehearsal.rehearsal_datetime), 'HH:mm')}
            {rehearsal.rehearsal_location ? ` — ${rehearsal.rehearsal_location}` : ''}
          </p>
        </button>
        {canViewAttendance && (
          <button
            onClick={() => setAttendanceOpen(true)}
            className="text-ink/40 hover:text-wine transition"
            aria-label="Prisustvo"
          >
            <ClipboardList size={18} />
          </button>
        )}
      </div>

      {canViewAttendance && (
        <AttendanceDialog
          rehearsal={rehearsal}
          ensembleName={ensembleName}
          open={attendanceOpen}
          onOpenChange={setAttendanceOpen}
          readOnly={!canRecordAttendance}
        />
      )}

      <RehearsalInfoDialog
        rehearsal={rehearsal}
        ensembleName={ensembleName}
        open={infoOpen}
        onOpenChange={setInfoOpen}
        canManage={canRecordAttendance}
      />
    </>
  )
}