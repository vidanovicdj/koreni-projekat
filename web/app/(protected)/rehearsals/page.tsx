import { createClient } from '@/lib/supabase/server'
import { getStaffRole } from '@/lib/supabase/get-staff-role'
import MonthCalendar from '@/components/rehearsals/month-calendar'
import type { Rehearsal, Ensemble } from '@/lib/types'

export default async function ReheaesalsPage() {
  const supabase = await createClient()
  const role = await getStaffRole()

  const [{ data: rehearsals, error: rError }, { data: ensembles, error: eError }] =
    await Promise.all([
      supabase.from('rehearsals').select('*'),
      supabase.from('ensembles').select('*').order('created_at'),
    ])

  if (rError || eError) {
    return <p className="text-red-600">Greška pri učitavanju proba.</p>
  }

  return (
    <div>
      <h1 className="font-serif text-xl text-ink mb-6">Probe</h1>
      <MonthCalendar
        rehearsals={(rehearsals ?? []) as Rehearsal[]}
        ensembles={(ensembles ?? []) as Ensemble[]}
        canManage={role === 'rukovodilac'}
        canViewAttendance={role === 'rukovodilac' || role === 'admin'}
      />
    </div>
  )
}