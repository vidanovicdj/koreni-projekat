'use client'

import { useEffect, useState, useMemo } from 'react'
import { differenceInDays } from 'date-fns'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { COSTUME_STATUS_LABELS } from '@/lib/types'

type CostumeRow = {
  id: string
  region: string | null
  status: string
}

type AssignmentRow = {
  costume_item_id: string
  borrow_date: string
  return_date: string | null
  status: string
}

const COLORS: Record<string, string> = {
  dostupno: '#3B4A34',
  zaduzeno: '#7A1F2B',
  na_popravci: '#B08D3F',
  van_upotrebe: '#8a8378',
}

export default function GarderoberStats() {
  const [items, setItems] = useState<CostumeRow[]>([])
  const [assignments, setAssignments] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()

      const [{ data: itemsData }, { data: assignmentsData }] = await Promise.all([
        supabase.from('costume_items').select('id, region, status'),
        supabase.from('resource_assignments').select('costume_item_id, borrow_date, return_date, status'),
      ])

      setItems((itemsData ?? []) as CostumeRow[])
      setAssignments((assignmentsData ?? []) as AssignmentRow[])
      setLoading(false)
    }

    load()
  }, [])

  const stats = useMemo(() => {
    const statusCounts: Record<string, number> = {
        dostupno: 0,
        zaduzeno: 0,
        na_popravci: 0,
        van_upotrebe: 0,
    }
    items.forEach((i) => {
        statusCounts[i.status] = (statusCounts[i.status] ?? 0) + 1
    })

    const pieData = Object.entries(statusCounts)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
        name: COSTUME_STATUS_LABELS[status as keyof typeof COSTUME_STATUS_LABELS],
        value: count,
        key: status,
        }))

    const durations = assignments.map((a) => {
        const end = a.return_date ? new Date(a.return_date) : new Date()
        return differenceInDays(end, new Date(a.borrow_date))
    })
    const avgDays = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0

    const regionMap = new Map<string, { total: number; zaduzeno: number }>()
    items.forEach((i) => {
        const region = i.region ?? 'Bez regiona'
        const entry = regionMap.get(region) ?? { total: 0, zaduzeno: 0 }
        entry.total += 1
        if (i.status === 'zaduzeno') entry.zaduzeno += 1
        regionMap.set(region, entry)
    })
    const byRegion = Array.from(regionMap.entries())
        .map(([region, { total, zaduzeno }]) => ({
        region,
        pct: total > 0 ? Math.round((zaduzeno / total) * 100) : 0,
        zaduzeno,
        total,
        }))
        .sort((a, b) => a.region.localeCompare(b.region))

    return {
        pieData,
        avgDays,
        byRegion,
    }
    }, [items, assignments])

  if (loading) return <p className="text-sm text-ink/50">Učitavanje...</p>

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#DCD3C0] rounded-md p-4">
          <p className="text-xs text-ink/60 mb-2">Zaduženo / slobodno</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {stats.pieData.map((entry) => (
                    <Cell key={entry.key} fill={COLORS[entry.key as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ backgroundColor: '#F6F1E4', border: '1px solid #231A15' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-[#DCD3C0] rounded-md p-4 flex flex-col justify-center items-center">
          <p className="text-xs text-ink/60 mb-2">Prosečno trajanje zaduženja</p>
          <p className="text-3xl font-serif text-ink">{stats.avgDays.toFixed(1)}</p>
          <p className="text-xs text-ink/50 mt-1">dana</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-ink/70 mb-3">Zauzetost po regionu</h3>
        {stats.byRegion.length === 0 ? (
          <p className="text-sm text-ink/40 italic">Nema komada u fundusu.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.byRegion.map((r) => (
              <div key={r.region}>
                <div className="flex justify-between text-xs text-ink/70 mb-1">
                  <span>{r.region}</span>
                  <span>{r.pct}% ({r.zaduzeno}/{r.total})</span>
                </div>
                <div className="h-2 rounded-full bg-[#DCD3C0] overflow-hidden">
                  <div
                    className="h-full bg-wine rounded-full transition-all"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}