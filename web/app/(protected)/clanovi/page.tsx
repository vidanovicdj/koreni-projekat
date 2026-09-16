import { createClient } from '@/lib/supabase/server'
import MemberGroups from '@/components/clanovi/member-groups'
import type { Member, Ensemble } from '@/lib/types'

export default async function ClanoviPage() {
  const supabase = await createClient()

  const [{ data: members, error: membersError }, { data: ensembles, error: ensemblesError }] =
    await Promise.all([
      supabase.from('members').select('*').order('member_surname'),
      supabase.from('ensembles').select('*').order('created_at'),
    ])

  if (membersError || ensemblesError) {
    return <p className="text-red-600">Greška pri učitavanju podataka.</p>
  }

  return (
    <div>
      <h1 className="font-serif text-xl text-ink mb-6">Članovi</h1>
      <MemberGroups
        members={(members ?? []) as Member[]}
        ensembles={(ensembles ?? []) as Ensemble[]}
      />
    </div>
  )
}