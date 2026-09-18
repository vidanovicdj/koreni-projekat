'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { upsertAttendance } from '@/app/(protected)/rehearsals/actions'
import { ATTENDANCE_LABELS, type Rehearsal, type Member, type AttendanceStatus, type Attendance } from '@/lib/types'

const inputStyle = 'border-2 border-gold bg-linen text-ink focus-visible:ring-wine focus-visible:ring-1'
const attendanceItems = Object.entries(ATTENDANCE_LABELS).map(([value, label]) => ({ label, value }))

export default function AttendanceDialog({
  rehearsal,
  ensembleName,
  open,
  onOpenChange,
  readOnly,
}: {
  rehearsal: Rehearsal
  ensembleName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  readOnly: boolean
}) {
  const [members, setMembers] = useState<Member[]>([])
  const [attendance, setAttendance] = useState<Record<string, Attendance>>({})
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    async function load() {
      setLoading(true)
      const supabase = createClient()

      const [{ data: membersData }, { data: attendanceData }] = await Promise.all([
        supabase.from('members').select('*').eq('ensemble_id', rehearsal.ensemble_id),
        supabase.from('attendance').select('*').eq('rehearsal_id', rehearsal.id),
      ])

      setMembers((membersData ?? []) as Member[])

      const map: Record<string, Attendance> = {}
      ;(attendanceData ?? []).forEach((a: Attendance) => {
        map[a.member_id] = a
      })
      setAttendance(map)
      setLoading(false)
    }

    load()
  }, [open, rehearsal.id, rehearsal.ensemble_id])

  async function handleStatusChange(memberId: string, status: AttendanceStatus) {
    setSavingId(memberId)
    const currentReason = attendance[memberId]?.absence_reason ?? null

    await upsertAttendance(rehearsal.id, memberId, status, currentReason)

    setAttendance((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] ?? {
          id: '',
          member_id: memberId,
          rehearsal_id: rehearsal.id,
          recorded_by: null,
          recorded_at: new Date().toISOString(),
        }),
        attendance_status: status,
        absence_reason: status === 'prisutan' ? null : currentReason,
      },
    }))
    setSavingId(null)
  }

  async function handleReasonBlur(memberId: string, reason: string) {
    const status = attendance[memberId]?.attendance_status
    if (!status || status === 'prisutan') return

    setSavingId(memberId)
    await upsertAttendance(rehearsal.id, memberId, status, reason || null)
    setAttendance((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], absence_reason: reason || null },
    }))
    setSavingId(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl border-[3px] border-gold bg-ink">
        <DialogHeader>
          <DialogTitle className="font-serif text-linen">
            Prisustvo — {ensembleName}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-linen/60">Učitavanje...</p>
        ) : members.length === 0 ? (
          <p className="text-sm text-linen/50 italic">Nema članova u ovoj grupi.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            {members.map((m) => {
              const current = attendance[m.id]
              const status = current?.attendance_status ?? null

              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center border-b border-linen/15 pb-3"
                >
                  <p className="text-sm text-linen">
                    {m.member_name} {m.member_surname}
                  </p>

                  <Select
                    items={attendanceItems}
                    value={status}
                    onValueChange={(v) => v && handleStatusChange(m.id, v as AttendanceStatus)}
                    disabled={readOnly || savingId === m.id}
                  >
                    <SelectTrigger className={`${inputStyle} w-44`}>
                      <SelectValue placeholder="Označi" />
                    </SelectTrigger>
                    <SelectContent>
                      {attendanceItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {status && status !== 'prisutan' ? (
                    <Input
                      className={inputStyle}
                      placeholder="Razlog odsustva"
                      value={current?.absence_reason ?? ''}
                      onChange={(e) =>
                        setAttendance((prev) => ({
                          ...prev,
                          [m.id]: { ...prev[m.id], absence_reason: e.target.value },
                        }))
                      }
                      onBlur={(e) => handleReasonBlur(m.id, e.target.value)}
                      disabled={readOnly}
                    />
                  ) : (
                    <span />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}