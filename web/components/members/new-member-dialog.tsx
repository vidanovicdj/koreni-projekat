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
import { createMember } from '@/app/(protected)/members/actions'
import { DISCOUNT_LABELS, PERSON_GENDER_LABELS, STATUS_LABELS, type Ensemble } from '@/lib/types'

const inputStyle = 'border-2 border-ink/30 focus-visible:ring-wine focus-visible:ring-1'
const discountItems = Object.entries(DISCOUNT_LABELS).map(([value, label]) => ({ label, value }))
const statusItems = Object.entries(STATUS_LABELS).map(([value, label]) => ({ label, value }))

type FormState = {
  email: string
  password: string
  name: string
  surname: string
  dob: string
  placeOfBirth: string
  gender: string | null
  citizenId: string
  residence: string
  passportNo: string
  profession: string
  phone: string
  admissionDate: string
  status: string
  ensembleId: string | null
  category: string
}

const initialState: FormState = {
  email: '',
  password: '',
  name: '',
  surname: '',
  dob: '',
  placeOfBirth: '',
  gender: null,
  citizenId: '',
  residence: '',
  passportNo: '',
  profession: '',
  phone: '',
  admissionDate: '',
  status: 'aktivan',
  ensembleId: null,
  category: '0',
}

export default function NewMemberDialog({
  ensembles,
  open,
  onOpenChange,
}: {
  ensembles: Ensemble[]
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [form, setForm] = useState<FormState>(initialState)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ensembleItems = ensembles.map((e) => ({ label: e.ensemble_name, value: e.id }))

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function reset() {
    setForm(initialState)
    setError(null)
  }

  async function handleSave() {
    if (!form.email.trim() || !form.name.trim() || !form.surname.trim() || !form.password.trim()) {
      setError('Email, lozinka, ime i prezime su obavezni.')
      return
    }
    setSaving(true)
    setError(null)

    const result = await createMember({
      email: form.email.trim(),
      password: form.password,
      member_name: form.name,
      member_surname: form.surname,
      date_of_birth: form.dob || null,
      place_of_birth: form.placeOfBirth || null,
      gender: form.gender || null,
      citizen_id: form.citizenId || null,
      residence: form.residence || null,
      passport_no: form.passportNo || null,
      profession: form.profession || null,
      phone_number: form.phone || null,
      admission_date: form.admissionDate || null,
      status: form.status,
      ensemble_id: form.ensembleId,
      category: Number(form.category),
    })

    setSaving(false)

    if (!result.success) {
      setError(result.message ?? 'Greška pri čuvanju.')
      return
    }

    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="!max-w-3xl w-[90vw] border-[3px] border-ink bg-linen" style={{ maxWidth: '54rem' }}>
        <DialogHeader>
          <DialogTitle className="font-serif text-ink">Novi član</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-ink/50 -mt-1">
          Postavi privremenu lozinku i prosledi je članu — prijaviće se u mobilnu app tim podacima.
        </p>

        <div className="grid grid-cols-3 gap-4 mt-2">
          <div className="col-span-2">
            <Label>Email</Label>
            <Input className={inputStyle} type="email" value={form.email} onChange={(e) => field('email', e.target.value)} />
          </div>
          <div>
            <Label>Privremena lozinka</Label>
            <Input className={inputStyle} value={form.password} onChange={(e) => field('password', e.target.value)} />
          </div>
          <div>
            <Label>Ime</Label>
            <Input className={inputStyle} value={form.name} onChange={(e) => field('name', e.target.value)} />
          </div>
          <div>
            <Label>Prezime</Label>
            <Input className={inputStyle} value={form.surname} onChange={(e) => field('surname', e.target.value)} />
          </div>
          <div>
            <Label>Pol</Label>
            <Select
              items={Object.entries(PERSON_GENDER_LABELS).map(([value, label]) => ({ label, value }))}
              value={form.gender}
              onValueChange={(v) => field('gender', v)}
            >
              <SelectTrigger className={inputStyle}>
                <SelectValue placeholder="Izaberi" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PERSON_GENDER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Datum rođenja</Label>
            <Input className={inputStyle} type="date" value={form.dob} onChange={(e) => field('dob', e.target.value)} />
          </div>
          <div>
            <Label>Mesto rođenja</Label>
            <Input className={inputStyle} value={form.placeOfBirth} onChange={(e) => field('placeOfBirth', e.target.value)} />
          </div>
          <div>
            <Label>JMBG</Label>
            <Input className={inputStyle} value={form.citizenId} onChange={(e) => field('citizenId', e.target.value)} />
          </div>
          <div>
            <Label>Broj pasoša</Label>
            <Input className={inputStyle} value={form.passportNo} onChange={(e) => field('passportNo', e.target.value)} />
          </div>
          <div>
            <Label>Prebivalište</Label>
            <Input className={inputStyle} value={form.residence} onChange={(e) => field('residence', e.target.value)} />
          </div>
          <div>
            <Label>Profesija</Label>
            <Input className={inputStyle} value={form.profession} onChange={(e) => field('profession', e.target.value)} />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input className={inputStyle} value={form.phone} onChange={(e) => field('phone', e.target.value)} />
          </div>
          <div>
            <Label>Datum prijema</Label>
            <Input className={inputStyle} type="date" value={form.admissionDate} onChange={(e) => field('admissionDate', e.target.value)} />
          </div>
          <div>
            <Label>Status</Label>
            <Select items={statusItems} value={form.status} onValueChange={(v) => field('status', v ?? 'aktivan')}>
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
          <div>
            <Label>Grupa (ansambl)</Label>
            <Select items={ensembleItems} value={form.ensembleId} onValueChange={(v) => field('ensembleId', v)}>
              <SelectTrigger className={inputStyle}>
                <SelectValue placeholder="Izaberi grupu" />
              </SelectTrigger>
              <SelectContent className="min-w-[280px]">
                {ensembleItems.map((i) => (
                  <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Popust na članarinu</Label>
            <Select items={discountItems} value={form.category} onValueChange={(v) => field('category', v ?? '0')}>
              <SelectTrigger className={inputStyle}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {discountItems.map((i) => (
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
            {saving ? 'Kreiranje...' : 'Kreiraj člana'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}