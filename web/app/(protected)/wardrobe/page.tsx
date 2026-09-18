import { createClient } from '@/lib/supabase/server'
import CostumeGroups from '@/components/wardrobe/costume-groups'
import type { CostumeItem } from '@/lib/types'

export default async function WardrobePage() {
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('costume_items')
    .select('*')
    .order('costume_item_name')

  if (error) {
    return <p className="text-red-600">Greška pri učitavanju fundusa: {error.message}</p>
  }

  return <CostumeGroups items={(items ?? []) as CostumeItem[]} />
}