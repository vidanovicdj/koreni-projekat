'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { returnAssignment } from '@/app/(protected)/assignments/actions'
import NewAssignmentDialog from './new-assignment-dialog'
import AllAssignmentsList from './all-assignments-list'
import type { Member, CostumeItem, ResourceAssignment } from '@/lib/types'

const inputStyle = 'border-2 border-wine focus-visible:ring-wine focus-visible:ring-1'

type AssignmentRow = ResourceAssignment & { costume_item_name: string }

export default function AssignmentPanel({
  members,
  costumeItems,
}: {
  members: Member[]
  costumeItems: CostumeItem[]
}) {
  const [memberId, setMemberId] = useState<string | null>(null)
  const [view, setView] = useState<'all' | 'member'>('all')
  const [rows, setRows] = useState<AssignmentRow[]>([])
  const [loading, setLoading] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [returningId, setReturningId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const memberItems = members.map((m) => ({
    label: `${m.member_name} ${m.member_surname}`,
    value: m.id,
  }))

  const availableItems = costumeItems.filter((i) => i.status === 'dostupno')

  async function loadMemberRows(id: string) {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('resource_assignments')
      .select('*, costume_items(costume_item_name)')
      .eq('member_id', id)
      .order('borrow_date', { ascending: false })

    setRows(
      (data ?? []).map((row: any) => ({
        ...row,
        costume_item_name: row.costume_items?.costume_item_name ?? '—',
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    if (memberId && view === 'member') {
      loadMemberRows(memberId)
    }
  }, [memberId, view, refreshKey])

  async function handleReturn(assignmentId: string, costumeItemId: string) {
    setReturningId(assignmentId)
    await returnAssignment(assignmentId, costumeItemId)
    setReturningId(null)
    setRefreshKey((k) => k + 1)
  }

  const active = rows.filter((r) => r.status === 'zaduzeno')
  const history = rows.filter((r) => r.status === 'vraceno')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-xl text-ink">Zaduženja</h1>
        {view === 'member' && (
          <button
            onClick={() => setView('all')}
            className="text-sm text-wine hover:text-wine/80 underline"
          >
            Prikaži sva zaduženja
          </button>
        )}
      </div>

      <div className="max-w-sm mb-8">
        <Select
          items={memberItems}
          value={memberId}
          onValueChange={(v) => {
            setMemberId(v)
            if (v) setView('member')
          }}
        >
          <SelectTrigger className={`${inputStyle} w-full`}>
            <SelectValue placeholder="Izaberi člana" />
          </SelectTrigger>
          <SelectContent className="min-w-[300px]">
            {memberItems.map((m) => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {view === 'all' && (
        <section>
          <h3 className="text-sm font-medium text-ink/70 mb-2">Trenutna zaduženja — svi članovi</h3>
          <AllAssignmentsList refreshKey={refreshKey} />
        </section>
      )}

      {view === 'member' && memberId && !loading && (
        <div className="flex flex-col gap-8">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-ink/70">Trenutno zaduženo</h3>
              <button
                onClick={() => setNewOpen(true)}
                className="flex items-center gap-1.5 text-sm text-wine hover:text-wine/80"
              >
                <Plus size={16} /> Novo zaduženje
              </button>
            </div>

            {active.length === 0 ? (
              <p className="text-sm text-ink/40 italic">Nema trenutnih zaduženja.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {active.map((r) => (
                  <div
                    key={r.id}
                    className="border border-[#DCD3C0] rounded-md p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm text-ink">{r.costume_item_name}</p>
                      <p className="text-xs text-ink/50">
                        Zaduženo {format(new Date(r.borrow_date), 'd.M.yyyy.')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={returningId === r.id}
                      onClick={() => handleReturn(r.id, r.costume_item_id)}
                    >
                      {returningId === r.id ? 'Razduživanje...' : 'Razduži'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-sm font-medium text-ink/70 mb-2">Istorija</h3>
            {history.length === 0 ? (
              <p className="text-sm text-ink/40 italic">Nema prethodnih zaduženja.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {history.map((r) => (
                  <div key={r.id} className="text-xs text-ink/60 flex justify-between">
                    <span>{r.costume_item_name}</span>
                    <span>
                      {format(new Date(r.borrow_date), 'd.M.yyyy.')} — {format(new Date(r.return_date!), 'd.M.yyyy.')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {memberId && (
        <NewAssignmentDialog
          memberId={memberId}
          availableItems={availableItems}
          open={newOpen}
          onOpenChange={(open) => {
            setNewOpen(open)
            if (!open) setRefreshKey((k) => k + 1)
          }}
        />
      )}
    </div>
  )
}