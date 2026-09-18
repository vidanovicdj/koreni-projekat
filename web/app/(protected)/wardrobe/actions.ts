'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CostumeItem } from '@/lib/types'

export async function createCostumeItem(data: {
  costume_item_name: string
  gender: string | null
  region: string | null
}) {
  const supabase = await createClient()

  const { error } = await supabase.from('costume_items').insert({
    ...data,
    status: 'dostupno',
  })

  if (error) return { success: false, message: error.message }

  revalidatePath('/wardrobe')
  return { success: true }
}

export async function updateCostumeItem(id: string, updates: Partial<CostumeItem>) {
  const supabase = await createClient()

  const { error } = await supabase.from('costume_items').update(updates).eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/wardrobe')
  revalidatePath('/zaduzenja')
  return { success: true }
}