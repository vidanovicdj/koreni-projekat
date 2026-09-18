'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createAssignment } from '@/app/(protected)/assignments/actions'
import type { CostumeItem } from '@/lib/types'

const inputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'

export default function NewAssignmentDialog({
  memberId,
  availableItems,
  open,
  onOpenChange,
}: {
  memberId: string
  availableItems: CostumeItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [itemId, setItemId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const items = availableItems.map((i) => ({
    label: `${i.costume_item_name}${i.region ? ` (${i.region})` : ''}`,
    value: i.id,
  }))

  async function handleSave() {
    if (!itemId) {
      setError('Izaberi komad.')
      return
    }
    setSaving(true)
    setError(null)

    const result = await createAssignment(itemId, memberId)

    setSaving(false)

    if (!result.success) {
      setError(result.message ?? 'Greška pri čuvanju.')
      return
    }

    setItemId(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md border-[3px] border-ink bg-linen">
        <DialogHeader>
          <DialogTitle className="font-serif text-ink">Novo zaduženje</DialogTitle>
        </DialogHeader>

        {items.length === 0 ? (
          <p className="text-sm text-ink/50 italic mt-2">Nema dostupnih komada u fundusu.</p>
        ) : (
          <Select items={items} value={itemId} onValueChange={setItemId}>
            <SelectTrigger className={`${inputStyle} w-full mt-2`}>
              <SelectValue placeholder="Izaberi komad" />
            </SelectTrigger>
            <SelectContent className="min-w-[320px]">
              {items.map((i) => (
                <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button>
          <Button onClick={handleSave} disabled={saving || items.length === 0} className="bg-wine hover:bg-wine/90">
            {saving ? 'Čuvanje...' : 'Zaduži'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}