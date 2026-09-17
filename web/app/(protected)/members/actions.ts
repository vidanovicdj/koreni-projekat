'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Member } from '@/lib/types'

export async function updateMember(id: string, updates: Partial<Member>) {
  const supabase = await createClient()

  const { error } = await supabase.from('members').update(updates).eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/members')
  return { success: true }
}