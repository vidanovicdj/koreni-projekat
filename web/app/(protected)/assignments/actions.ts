'use server'

import { createClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/push'
import { revalidatePath } from 'next/cache'

export async function createAssignment(costume_item_id: string, member_id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { error: assignError } = await supabase.from('resource_assignments').insert({
    costume_item_id,
    member_id,
    assigned_by: user?.id,
    borrow_date: new Date().toISOString().slice(0, 10),
    status: 'zaduzeno',
  })

  if (assignError) return { success: false, message: assignError.message }

  const { error: itemError } = await supabase
    .from('costume_items')
    .update({ status: 'zaduzeno' })
    .eq('id', costume_item_id)

  if (itemError) return { success: false, message: itemError.message }

  const { data: member } = await supabase
    .from('members')
    .select('push_token')
    .eq('id', member_id)
    .single()

  const { data: item } = await supabase
    .from('costume_items')
    .select('costume_item_name')
    .eq('id', costume_item_id)
    .single()

  await supabase.from('notifications').insert({
    member_id,
    notification_subject: 'Novi kostim zadužen',
    notification_text: `Zadužen je scenski kostim: ${item?.costume_item_name ?? 'komad iz fundusa'}`,
  })

  if (member?.push_token) {
    await sendPushNotification(
      member.push_token,
      'Novi kostim zadužen',
      `Zadužen je scenski kostim: ${item?.costume_item_name ?? 'komad iz fundusa'}`
    )
  }

  revalidatePath('/assignments')
  revalidatePath('/wardrobe')
  return { success: true }
}

export async function returnAssignment(assignmentId: string, costumeItemId: string) {
  const supabase = await createClient()

  const { error: assignError } = await supabase
    .from('resource_assignments')
    .update({ status: 'vraceno', return_date: new Date().toISOString().slice(0, 10) })
    .eq('id', assignmentId)

  if (assignError) return { success: false, message: assignError.message }

  const { error: itemError } = await supabase
    .from('costume_items')
    .update({ status: 'dostupno' })
    .eq('id', costumeItemId)

  if (itemError) return { success: false, message: itemError.message }

  revalidatePath('/assignments')
  revalidatePath('/wardrobe')
  return { success: true }
}