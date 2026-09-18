import { createClient } from '@/lib/supabase/server'
import AssignmentPanel from '@/components/assignments/assignment-panel'
import type { Member, CostumeItem } from '@/lib/types'

export default async function AssignmentsPage() {
  const supabase = await createClient()

  const [{ data: members, error: mError }, { data: items, error: iError }] = await Promise.all([
    supabase.from('members').select('*').order('member_surname'),
    supabase.from('costume_items').select('*').order('costume_item_name'),
  ])

  if (mError || iError) {
    return <p className="text-red-600">Greška pri učitavanju podataka.</p>
  }

  return (
    <AssignmentPanel
      members={(members ?? []) as Member[]}
      costumeItems={(items ?? []) as CostumeItem[]}
    />
  )
}