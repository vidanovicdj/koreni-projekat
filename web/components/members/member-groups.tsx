'use client'

import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import MemberModal from './member-modal'
import NewMemberDialog from './new-member-dialog'
import { STATUS_LABELS, type Member, type Ensemble } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const filterInputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'

const STATUS_COLOR: Record<string, string> = {
  aktivan: 'bg-sage/15 text-sage border-sage/30',
  neaktivan: 'bg-gray-200 text-gray-600 border-gray-300',
  suspendovan: 'bg-wine/10 text-wine border-wine/30',
}

export default function MemberGroups({
  members,
  ensembles,
  role,
}: {
  members: Member[]
  ensembles: Ensemble[]
  role: string | null
}) {
  const [selected, setSelected] = useState<Member | null>(null)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('sve')
  const [newOpen, setNewOpen] = useState(false)

const filterItems = [
  { label: 'Sve grupe', value: 'sve' },
  ...ensembles.map((e) => ({ label: e.ensemble_name, value: e.id })),
]

const visibleEnsembles = filter === 'sve' ? ensembles : ensembles.filter((e) => e.id === filter)

  function openMember(m: Member) {
    setSelected(m)
    setOpen(true)
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-serif text-lg text-ink">Radionice</h2>
          <div className="flex items-center gap-3">
            <Select items={filterItems} value={filter} onValueChange={(v) => setFilter(v ?? 'sve')}>
            </Select>
            {role === 'admin' && (
              <button
                onClick={() => setNewOpen(true)}
                className="flex items-center gap-1.5 text-sm text-wine hover:text-wine/80"
              >
                <Plus size={16} /> Novi član
              </button>
            )}
          </div>
        </div>
        <div className="h-[3px] w-14 mb-4 rounded-full bg-[repeating-linear-gradient(45deg,#B08D3F_0_5px,#7A1F2B_5px_10px)]" />

        <div className="flex flex-col gap-6">
          {visibleEnsembles.map((ens) => {
            const group = members.filter((m) => m.ensemble_id === ens.id)
            return (
              <div key={ens.id}>
                <h3 className="text-sm font-medium text-ink/70 mb-2">
                  {ens.ensemble_name} <span className="text-ink/40">({group.length})</span>
                </h3>

                {group.length === 0 ? (
                  <p className="text-sm text-ink/40 italic">Nema članova u ovoj grupi.</p>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[#DCD3C0] text-left text-ink/60">
                        <th className="py-2 font-normal">Ime</th>
                        <th className="py-2 font-normal">Prezime</th>
                        <th className="py-2 font-normal">Datum rođenja</th>
                        <th className="py-2 font-normal">Telefon</th>
                        <th className="py-2 font-normal">Status</th>
                        <th className="py-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.map((m) => (
                        <tr key={m.id} className="border-b border-[#DCD3C0]/60">
                          <td className="py-2 text-ink">{m.member_name}</td>
                          <td className="py-2 text-ink">{m.member_surname}</td>
                          <td className="py-2 text-ink/70">{m.date_of_birth ?? '—'}</td>
                          <td className="py-2 text-ink/70">{m.phone_number ?? '—'}</td>
                          <td className="py-2">
                            <Badge variant="outline" className={STATUS_COLOR[m.status]}>
                              {STATUS_LABELS[m.status]}
                            </Badge>
                          </td>
                          <td className="py-2 text-right">
                            <button
                              onClick={() => openMember(m)}
                              className="text-ink/40 hover:text-wine transition"
                              aria-label="Otvori profil člana"
                            >
                              <Search size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <MemberModal member={selected} ensembles={ensembles} open={open} onOpenChange={setOpen} />
      <NewMemberDialog ensembles={ensembles} open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}