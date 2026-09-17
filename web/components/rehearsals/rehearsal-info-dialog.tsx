'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { deleteRehearsal } from '@/app/(protected)/rehearsals/actions'
import type { Rehearsal } from '@/lib/types'

export default function RehearsalInfoDialog({
  rehearsal,
  ensembleName,
  open,
  onOpenChange,
  canManage,
}: {
  rehearsal: Rehearsal
  ensembleName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  canManage: boolean
}) {
  const [creatorName, setCreatorName] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!open || !rehearsal.created_by) return

    const supabase = createClient()
    supabase
      .from('staff')
      .select('user_name, user_surname')
      .eq('id', rehearsal.created_by)
      .single()
      .then(({ data }) => {
        if (data) setCreatorName(`${data.user_name} ${data.user_surname}`)
      })
  }, [open, rehearsal.created_by])

  async function handleDelete() {
    setDeleting(true)
    const result = await deleteRehearsal(rehearsal.id)
    setDeleting(false)

    if (result.success) {
      onOpenChange(false)
      router.refresh()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-sm border-[3px] border-gold bg-ink">
        <DialogHeader>
            <DialogTitle className="font-serif text-linen">Detalji probe</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 text-sm text-linen mt-1">
            <p><span className="text-linen/60">Grupa:</span> {ensembleName}</p>
            <p>
            <span className="text-linen/60">Vreme:</span>{' '}
            {format(new Date(rehearsal.rehearsal_datetime), "d.M.yyyy. 'u' HH:mm")}
            </p>
            {rehearsal.rehearsal_location && (
            <p><span className="text-linen/60">Lokacija:</span> {rehearsal.rehearsal_location}</p>
            )}
            <p><span className="text-linen/60">Zakazao/la:</span> {creatorName ?? '—'}</p>
        </div>

        {canManage && (
            <div className="flex justify-end gap-2 mt-4">
            <Button
                variant="outline"
                onClick={handleDelete}
                disabled={deleting}
                className="text-linen border-gold hover:bg-wine/20 bg-transparent"
            >
                {deleting ? 'Otkazivanje...' : 'Otkaži probu'}
            </Button>
            </div>
        )}
        </DialogContent>
    </Dialog>
  )
}