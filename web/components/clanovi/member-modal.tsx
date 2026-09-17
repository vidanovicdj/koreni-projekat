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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { updateMember } from '@/app/(protected)/members/actions'
import { STATUS_LABELS, DISCOUNT_LABELS, type Member, type Ensemble } from '@/lib/types'

const inputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'

export default function MemberModal({
  member,
  ensembles,
  open,
  onOpenChange,
}: {
  member: Member | null
  ensembles: Ensemble[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<Member | null>(member)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setForm(member)
  }, [member])

  if (!form) return null

  function field(key: keyof Member, value: string | null) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const ensembleItems = ensembles.map((e) => ({ label: e.ensemble_name, value: e.id }))
  const discountItems = Object.entries(DISCOUNT_LABELS).map(([value, label]) => ({ label, value }))
  const statusItems = Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value }))

  async function handleSave() {
    if (!form) return
    setSaving(true)
    setError(null)

    const result = await updateMember(form.id, {
      member_name: form.member_name,
      member_surname: form.member_surname,
      date_of_birth: form.date_of_birth,
      place_of_birth: form.place_of_birth,
      citizen_id: form.citizen_id,
      passport_no: form.passport_no,
      admission_date: form.admission_date,
      residence: form.residence,
      profession: form.profession,
      phone_number: form.phone_number,
      status: form.status,
      ensemble_id: form.ensemble_id,
      category: form.category,
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
      <DialogContent
        className="!max-w-3xl w-[90vw] border-[3px] border-ink bg-linen"
        style={{ maxWidth: '54rem' }}
      >
        <DialogHeader>
          <DialogTitle className="font-serif text-ink">
            {form.member_name} {form.member_surname}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <Label>Ime</Label>
            <Input className={inputStyle} value={form.member_name} onChange={(e) => field('member_name', e.target.value)} />
          </div>
          <div>
            <Label>Prezime</Label>
            <Input className={inputStyle} value={form.member_surname} onChange={(e) => field('member_surname', e.target.value)} />
          </div>
          <div>
            <Label>Datum rođenja</Label>
            <Input className={inputStyle} type="date" value={form.date_of_birth ?? ''} onChange={(e) => field('date_of_birth', e.target.value)} />
          </div>
          <div>
            <Label>Mesto rođenja</Label>
            <Input className={inputStyle} value={form.place_of_birth ?? ''} onChange={(e) => field('place_of_birth', e.target.value)} />
          </div>
          <div>
            <Label>JMBG</Label>
            <Input className={inputStyle} value={form.citizen_id ?? ''} onChange={(e) => field('citizen_id', e.target.value)} />
          </div>
          <div>
            <Label>Broj pasoša</Label>
            <Input className={inputStyle} value={form.passport_no ?? ''} onChange={(e) => field('passport_no', e.target.value)} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input className={inputStyle} value={form.phone_number ?? ''} onChange={(e) => field('phone_number', e.target.value)} />
          </div>
          <div>
            <Label>Adresa</Label>
            <Input className={inputStyle} value={form.residence ?? ''} onChange={(e) => field('residence', e.target.value)} />
          </div>
          <div>
            <Label>Zanimanje</Label>
            <Input className={inputStyle} value={form.profession ?? ''} onChange={(e) => field('profession', e.target.value)} />
          </div>
          <div>
            <Label>Datum učlanjenja</Label>
            <Input className={inputStyle} type="date" value={form.admission_date ?? ''} onChange={(e) => field('admission_date', e.target.value)} />
          </div>
          <div>
            <Label>Grupa (ansambl)</Label>
            <Select items={ensembleItems} value={form.ensemble_id ?? undefined} onValueChange={(v) => field('ensemble_id', v)}>
              <SelectTrigger className={inputStyle}>
                <SelectValue placeholder="Izaberi grupu" />
              </SelectTrigger>
              <SelectContent>
                {ensembleItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Popust na članarinu</Label>
            <Select
              items={discountItems}
              value={String(form.category)}
              onValueChange={(v) => setForm((prev) => (prev ? { ...prev, category: Number(v) as Member['category'] } : prev))}
            >
              <SelectTrigger className={inputStyle}>
                <SelectValue placeholder="Izaberi popust" />
              </SelectTrigger>
              <SelectContent>
                {discountItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select items={statusItems} value={form.status} onValueChange={(v) => field('status', v)}>
              <SelectTrigger className={inputStyle}>
                <SelectValue placeholder="Izaberi status" />
              </SelectTrigger>
              <SelectContent>
                {statusItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Otkaži</Button>
          <Button onClick={handleSave} disabled={saving} className="bg-wine hover:bg-wine/90">
            {saving ? 'Čuvanje...' : 'Sačuvaj'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}