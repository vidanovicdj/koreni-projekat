'use client'

import { useState, useEffect, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Ensemble } from '@/lib/types'

const inputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'

type AttendanceRow = {
  rehearsal_id: string
  attendance_status: string
  members: { gender: 'musko' | 'zensko' | null } | null
}

type RehearsalRow = {
  id: string
  rehearsal_datetime: string
}

export default function RukovodilacStats({ ensembles }: { ensembles: Ensemble[] }) {
  const [month, setMonth] = useState(new Date())
  const [ensembleFilter, setEnsembleFilter] = useState('sve')
  const [rehearsals, setRehearsals] = useState<RehearsalRow[]>([])
  const [attendance, setAttendance] = useState<AttendanceRow[]>([])
  const [loading, setLoading] = useState(true)

  const ensembleItems = [
    { label: 'Sve grupe', value: 'sve' },
    ...ensembles.map((e) => ({ label: e.ensemble_name, value: e.id })),
  ]

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const from = startOfMonth(month).toISOString()
      const to = endOfMonth(month).toISOString()

      let query = supabase
        .from('rehearsals')
        .select('id, rehearsal_datetime')
        .gte('rehearsal_datetime', from)
        .lte('rehearsal_datetime', to)

      if (ensembleFilter !== 'sve') {
        query = query.eq('ensemble_id', ensembleFilter)
      }

      const { data: rehearsalsData } = await query
      const rIds = (rehearsalsData ?? []).map((r) => r.id)

      let attendanceData: AttendanceRow[] = []
      if (rIds.length > 0) {
        const { data } = await supabase
          .from('attendance')
          .select('rehearsal_id, attendance_status, members(gender)')
          .in('rehearsal_id', rIds)
        attendanceData = (data ?? []) as unknown as AttendanceRow[]
      }

      setRehearsals((rehearsalsData ?? []) as RehearsalRow[])
      setAttendance(attendanceData)
      setLoading(false)
    }

    load()
  }, [month, ensembleFilter])

  const stats = useMemo(() => {
    const heldIds = new Set(attendance.map((a) => a.rehearsal_id))
    const heldCount = heldIds.size

    const presentCount = attendance.filter((a) => a.attendance_status === 'prisutan').length
    const avgPerRehearsal = heldCount > 0 ? presentCount / heldCount : 0

    const byGender: Record<'musko' | 'zensko', { present: number; total: number }> = {
      musko: { present: 0, total: 0 },
      zensko: { present: 0, total: 0 },
    }
    attendance.forEach((a) => {
      const g = a.members?.gender
      if (g === 'musko' || g === 'zensko') {
        byGender[g].total += 1
        if (a.attendance_status === 'prisutan') byGender[g].present += 1
      }
    })

    const chartData = rehearsals
      .filter((r) => heldIds.has(r.id))
      .sort((a, b) => new Date(a.rehearsal_datetime).getTime() - new Date(b.rehearsal_datetime).getTime())
      .map((r) => ({
        label: format(new Date(r.rehearsal_datetime), 'd.M.'),
        prisutni: attendance.filter((a) => a.rehearsal_id === r.id && a.attendance_status === 'prisutan').length,
      }))

    return { heldCount, avgPerRehearsal, byGender, chartData }
  }, [rehearsals, attendance])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setMonth((m) => subMonths(m, 1))} className="text-ink/60 hover:text-ink">
            <ChevronLeft size={18} />
          </button>
          <h2 className="font-serif text-lg text-ink w-40 text-center">
            {format(month, 'LLLL yyyy.')}
          </h2>
          <button onClick={() => setMonth((m) => addMonths(m, 1))} className="text-ink/60 hover:text-ink">
            <ChevronRight size={18} />
          </button>
        </div>

        <Select items={ensembleItems} value={ensembleFilter} onValueChange={(v) => setEnsembleFilter(v ?? 'sve')}>
          <SelectTrigger className={`${inputStyle} w-56`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="min-w-[220px]">
            {ensembleItems.map((i) => (
              <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-ink/50">Učitavanje...</p>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#DCD3C0] rounded-md p-4">
              <p className="text-xs text-ink/60 mb-1">Održanih proba</p>
              <p className="text-2xl font-serif text-ink">{stats.heldCount}</p>
            </div>
            <div className="border border-[#DCD3C0] rounded-md p-4">
              <p className="text-xs text-ink/60 mb-1">Prosečan broj dolazaka po probi</p>
              <p className="text-2xl font-serif text-ink">{stats.avgPerRehearsal.toFixed(1)}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-ink/70 mb-2">Prisustvo po polu</h3>
            <div className="grid grid-cols-2 gap-4">
              {(['musko', 'zensko'] as const).map((g) => {
                const { present, total } = stats.byGender[g]
                const rate = total > 0 ? Math.round((present / total) * 100) : 0
                return (
                  <div key={g} className="border border-[#DCD3C0] rounded-md p-4">
                    <p className="text-xs text-ink/60 mb-1">{g === 'musko' ? 'Muško' : 'Žensko'}</p>
                    <p className="text-lg text-ink">{present} dolazaka <span className="text-ink/50 text-sm">({rate}%)</span></p>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-ink/70 mb-2">Dolasci po probi</h3>
            {stats.chartData.length === 0 ? (
              <p className="text-sm text-ink/40 italic">Nema evidentiranih proba u ovom mesecu.</p>
            ) : (
              <div className="h-64 border border-[#DCD3C0] rounded-md p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#DCD3C0" />
                    <XAxis dataKey="label" stroke="#231A15" fontSize={12} />
                    <YAxis stroke="#231A15" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#F6F1E4', border: '1px solid #231A15' }}
                    />
                    <Bar dataKey="prisutni" fill="#7A1F2B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}