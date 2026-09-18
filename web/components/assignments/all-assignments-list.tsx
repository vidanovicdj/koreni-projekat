'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

type Row = {
  id: string
  borrow_date: string
  costume_item_name: string
  member_name: string
}

export default function AllAssignmentsList({ refreshKey }: { refreshKey: number }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('resource_assignments')
        .select('id, borrow_date, costume_items(costume_item_name), members(member_name, member_surname)')
        .eq('status', 'zaduzeno')
        .order('borrow_date', { ascending: false })

      setRows(
        (data ?? []).map((row: any) => ({
          id: row.id,
          borrow_date: row.borrow_date,
          costume_item_name: row.costume_items?.costume_item_name ?? '—',
          member_name: `${row.members?.member_name ?? ''} ${row.members?.member_surname ?? ''}`,
        }))
      )
      setLoading(false)
    }

    load()
  }, [refreshKey])

  if (loading) return <p className="text-sm text-ink/50">Učitavanje...</p>

  if (rows.length === 0) {
    return <p className="text-sm text-ink/40 italic">Trenutno nema zaduženih komada.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div
          key={r.id}
          className="border border-[#DCD3C0] rounded-md p-3 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-ink">{r.costume_item_name}</p>
            <p className="text-xs text-ink/60">{r.member_name}</p>
          </div>
          <p className="text-xs text-ink/50">Zaduženo {format(new Date(r.borrow_date), 'd.M.yyyy.')}</p>
        </div>
      ))}
    </div>
  )
}