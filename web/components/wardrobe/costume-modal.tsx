'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { updateCostumeItem } from '@/app/(protected)/wardrobe/actions'
import {
  COSTUME_STATUS_LABELS,
  GENDER_LABELS,
  type CostumeItem,
  type ResourceAssignment,
} from '@/lib/types'

const inputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'
const statusItems = Object.entries(COSTUME_STATUS_LABELS).map(([value, label]) => ({ label, value }))
const genderItems = Object.entries(GENDER_LABELS).map(([value, label]) => ({ label, value }))

type HistoryRow = ResourceAssignment & { member_name: string }

export default function CostumeModal({
  item,
  open,
  onOpenChange,
}: {
  item: CostumeItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<CostumeItem | null>(item)
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(item)
  }, [item])

  useEffect(() => {
    if (!open || !item) return

    const supabase = createClient()
    supabase
      .from('resource_assignments')
      .select('*, members(member_name, member_surname)')
      .eq('costume_item_id', item.id)
      .order('borrow_date', { ascending: false })
      .then(({ data }) => {
        setHistory(
          (data ?? []).map((row: any) => ({
            ...row,
            member_name: `${row.members?.member_name ?? ''} ${row.members?.member_surname ?? ''}`,
          }))
        )
      })
  }, [open, item])

  if (!form) return null

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError(null)

    const result = await updateCostumeItem(form.id, {
      costume_item_name: form.costume_item_name,
      gender: form.gender,
      region: form.region,
      status: form.status,
    })

    setSaving(false)

    if (!result.success) {
      setError(result.message ?? 'Greška pri čuvanju.')
      return
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-xl border-[3px] border-ink bg-linen">
        <DialogHeader>
          <DialogTitle className="font-serif text-ink">{form.costume_item_name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div>
            <Label>Naziv</Label>
            <Input
              className={inputStyle}
              value={form.costume_item_name}
              onChange={(e) => setForm({ ...form, costume_item_name: e.target.value })}
            />
          </div>
          <div>
            <Label>Region</Label>
            <Input
              className={inputStyle}
              value={form.region ?? ''}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            />
          </div>
          <div>
            <Label>Pol</Label>
            <Select
              items={genderItems}
              value={form.gender ?? undefined}
              onValueChange={(v) => setForm({ ...form, gender: v as CostumeItem['gender'] })}
            >
              <SelectTrigger className={inputStyle}>
                <SelectValue placeholder="Izaberi" />
              </SelectTrigger>
              <SelectContent>
                {genderItems.map((i) => (
                  <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select
              items={statusItems}
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as CostumeItem['status'] })}
            >
              <SelectTrigger className={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusItems.map((i) => (
                  <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Zatvori</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-wine hover:bg-wine/90">
            {saving ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-[#DCD3C0]">
          <h3 className="text-sm font-medium text-ink/70 mb-2">Istorija zaduženja</h3>
          {history.length === 0 ? (
            <p className="text-sm text-ink/40 italic">Nema zabeleženih zaduženja.</p>
          ) : (
            <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
              {history.map((h) => (
                <div key={h.id} className="text-xs text-ink/70 flex justify-between">
                  <span>{h.member_name}</span>
                  <span>
                    {format(new Date(h.borrow_date), 'd.M.yyyy.')} —{' '}
                    {h.return_date ? format(new Date(h.return_date), 'd.M.yyyy.') : 'trenutno zaduženo'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}