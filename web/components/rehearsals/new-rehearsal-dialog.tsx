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
import { format } from 'date-fns'
import { createRehearsal } from '@/app/(protected)/rehearsals/actions'
import type { Ensemble } from '@/lib/types'

const inputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'

export default function NewRehearsalDialog({
  open,
  onOpenChange,
  defaultDate,
  ensembles,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultDate: Date
  ensembles: Ensemble[]
}) {
  const [ensembleId, setEnsembleId] = useState<string | null>(null)
  const [time, setTime] = useState('18:00')
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ensembleItems = ensembles.map((e) => ({ label: e.ensemble_name, value: e.id }))

  async function handleSave() {
    if (!ensembleId) {
      setError('Izaberi grupu.')
      return
    }
    setSaving(true)
    setError(null)

    const [hours, minutes] = time.split(':').map(Number)
    const datetime = new Date(defaultDate)
    datetime.setHours(hours, minutes, 0, 0)

    const result = await createRehearsal({
      ensemble_id: ensembleId,
      rehearsal_datetime: datetime.toISOString(),
      rehearsal_location: location || null,
    })

    setSaving(false)

    if (!result.success) {
      setError(result.message ?? 'Greška pri čuvanju.')
      return
    }

    onOpenChange(false)
    setEnsembleId(null)
    setLocation('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-lg border-[3px] border-ink bg-linen">
        <DialogHeader>
          <DialogTitle className="font-serif text-ink">
            Nova proba — {format(defaultDate, 'd.M.yyyy.')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-2">
          <div>
            <Label>Grupa</Label>
            <Select items={ensembleItems} value={ensembleId} onValueChange={setEnsembleId}>
              <SelectTrigger className={`inputStyle w-full`}>
                <SelectValue placeholder="Izaberi grupu" />
              </SelectTrigger>
              <SelectContent className="min-w-[320px]">
                {ensembleItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Vreme</Label>
            <Input
              className={inputStyle}
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          <div>
            <Label>Lokacija</Label>
            <Input
              className={inputStyle}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="npr. Dom kulture, velika sala"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-wine hover:bg-wine/90">
            {saving ? 'Čuvanje...' : 'Zakaži'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}