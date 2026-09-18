'use client'

import { useState } from 'react'
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
import { createCostumeItem } from '@/app/(protected)/wardrobe/actions'
import { GENDER_LABELS } from '@/lib/types'

const inputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'
const genderItems = Object.entries(GENDER_LABELS).map(([value, label]) => ({ label, value }))

export default function NewItemDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [name, setName] = useState('')
  const [region, setRegion] = useState('')
  const [gender, setGender] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    if (!name.trim()) {
      setError('Unesi naziv.')
      return
    }
    setSaving(true)
    setError(null)

    const result = await createCostumeItem({
      costume_item_name: name,
      region: region || null,
      gender: gender,
    })

    setSaving(false)

    if (!result.success) {
      setError(result.message ?? 'Greška pri čuvanju.')
      return
    }

    setName('')
    setRegion('')
    setGender(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-md border-[3px] border-ink bg-linen">
        <DialogHeader>
          <DialogTitle className="font-serif text-ink">Novi komad fundusa</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <div>
            <Label>Naziv</Label>
            <Input className={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="npr. Šajkača" />
          </div>
          <div>
            <Label>Region</Label>
            <Input className={inputStyle} value={region} onChange={(e) => setRegion(e.target.value)} placeholder="npr. Šumadija" />
          </div>
          <div>
            <Label>Pol</Label>
            <Select items={genderItems} value={gender} onValueChange={setGender}>
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
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-wine hover:bg-wine/90">
            {saving ? 'Čuvanje...' : 'Dodaj'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}