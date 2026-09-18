'use client'

import { useState, useMemo } from 'react'
import { Search, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import CostumeModal from './costume-modal'
import NewItemDialog from './new-item-dialog'
import { COSTUME_STATUS_LABELS, GENDER_LABELS, type CostumeItem } from '@/lib/types'
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '../ui/select'

const STATUS_COLOR: Record<string, string> = {
  dostupno: 'bg-sage/15 text-sage border-sage/30',
  zaduzeno: 'bg-wine/10 text-wine border-wine/30',
  na_popravci: 'bg-gold/15 text-gold border-gold/40',
  van_upotrebe: 'bg-gray-200 text-gray-600 border-gray-300',
}

export default function CostumeGroups({ items }: { items: CostumeItem[] }) {
  const [selected, setSelected] = useState<CostumeItem | null>(null)
  const [open, setOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  const regions = useMemo(() => {
    const set = new Set(items.map((i) => i.region ?? 'Bez regiona'))
    return Array.from(set).sort()
  }, [items])

  const [filter, setFilter] = useState('sve')

  const filterItems = [
    { label: 'Svi regioni', value: 'sve' },
    ...regions.map((r) => ({ label: r, value: r })),
  ]

  const visibleRegions = filter === 'sve' ? regions : regions.filter((r) => r === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-lg text-ink mb-1">Fundus</h2>
          <div className="h-[3px] w-14 rounded-full bg-[repeating-linear-gradient(45deg,#B08D3F_0_5px,#7A1F2B_5px_10px)]" />
        </div>
        <div className="flex items-center gap-3">
          <Select items={filterItems} value={filter} onValueChange={(v) => setFilter(v ?? 'sve')}>
            <SelectTrigger className="border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-[200px]">
              {filterItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-1.5 text-sm text-wine hover:text-wine/80"
          >
            <Plus size={16} /> Novi komad
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {visibleRegions.map((region) => {
          const group = items.filter((i) => (i.region ?? 'Bez regiona') === region)
          return (
            <div key={region}>
              <h3 className="text-sm font-medium text-ink/70 mb-2">
                {region} <span className="text-ink/40">({group.length})</span>
              </h3>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#DCD3C0] text-left text-ink/60">
                    <th className="py-2 font-normal">Naziv</th>
                    <th className="py-2 font-normal">Pol</th>
                    <th className="py-2 font-normal">Status</th>
                    <th className="py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((i) => (
                    <tr key={i.id} className="border-b border-[#DCD3C0]/60">
                      <td className="py-2 text-ink">{i.costume_item_name}</td>
                      <td className="py-2 text-ink/70">{i.gender ? GENDER_LABELS[i.gender] : '—'}</td>
                      <td className="py-2">
                        <Badge variant="outline" className={STATUS_COLOR[i.status]}>
                          {COSTUME_STATUS_LABELS[i.status]}
                        </Badge>
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => { setSelected(i); setOpen(true) }}
                          className="text-ink/40 hover:text-wine transition"
                          aria-label="Detalji komada"
                        >
                          <Search size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      <CostumeModal item={selected} open={open} onOpenChange={setOpen} />
      <NewItemDialog open={newOpen} onOpenChange={setNewOpen} />
    </div>
  )
}