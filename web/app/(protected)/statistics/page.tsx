import { createClient } from '@/lib/supabase/server'
import { getStaffRole } from '@/lib/supabase/get-staff-role'
import RukovodilacStats from '@/components/statistics/rukovodilac-stats'
import GarderoberStats from '@/components/statistics/garderober-stats'  
import type { Ensemble } from '@/lib/types'

export default async function StatisticsPage() {
  const supabase = await createClient()
  const role = await getStaffRole()

  const { data: ensembles } = await supabase.from('ensembles').select('*').order('created_at')

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-serif text-xl text-ink">Statistika</h1>

      {(role === 'rukovodilac' || role === 'admin') && (
        <section>
          {role === 'admin' && (
            <h2 className="text-sm font-medium text-ink/70 mb-3">Probe i prisustvo</h2>
          )}
          <RukovodilacStats ensembles={(ensembles ?? []) as Ensemble[]} />
        </section>
      )}

      {(role === 'garderober' || role === 'admin') && (
        <section>
          {role === 'admin' && (
            <h2 className="text-sm font-medium text-ink/70 mb-3">Fundus</h2>
          )}
          <GarderoberStats />
        </section>
      )}
    </div>
  )
}