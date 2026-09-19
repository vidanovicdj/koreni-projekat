'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AttendanceStatus } from '@/lib/types'
import { sendPushNotification } from '@/lib/push'

export async function createRehearsal(data: {
  ensemble_id: string
  rehearsal_datetime: string
  rehearsal_location: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: rehearsal, error } = await supabase
    .from('rehearsals')
    .insert({
      ...data,
      created_by: user?.id,
    })
    .select()
    .single()

  if (error) return { success: false, message: error.message }

  const { data: ensemble } = await supabase
    .from('ensembles')
    .select('ensemble_name')
    .eq('id', data.ensemble_id)
    .single()

  const { data: members } = await supabase
    .from('members')
    .select('id, push_token')
    .eq('ensemble_id', data.ensemble_id)
    .eq('status', 'aktivan')

  const dateLabel = new Date(data.rehearsal_datetime).toLocaleDateString('sr-RS', {
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const body = `${ensemble?.ensemble_name ?? 'Nova proba'} — ${dateLabel}${data.rehearsal_location ? ', ' + data.rehearsal_location : ''}`

  for (const member of members ?? []) {
    await supabase.from('notifications').insert({
      member_id: member.id,
      notification_subject: 'Nova proba zakazana',
      notification_text: body,
    })

    if (member.push_token) {
      await sendPushNotification(member.push_token, 'Nova proba zakazana', body)
    }
  }

  revalidatePath('/rehearsals')
  return { success: true }
}

export async function upsertAttendance(
  rehearsal_id: string,
  member_id: string,
  attendance_status: AttendanceStatus,
  absence_reason: string | null
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('attendance').upsert(
    {
      rehearsal_id,
      member_id,
      attendance_status,
      absence_reason: attendance_status === 'prisutan' ? null : absence_reason,
      recorded_by: user?.id,
      recorded_at: new Date().toISOString(),
    },
    { onConflict: 'member_id,rehearsal_id' }
  )

  if (error) return { success: false, message: error.message }

  revalidatePath('/rehearsals')
  return { success: true }
}

export async function deleteRehearsal(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('rehearsals').delete().eq('id', id)

  if (error) return { success: false, message: error.message }

  revalidatePath('/probe')
  return { success: true }
}