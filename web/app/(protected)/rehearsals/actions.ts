'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { AttendanceStatus } from '@/lib/types'

export async function createRehearsal(data: {
  ensemble_id: string
  rehearsal_datetime: string
  rehearsal_location: string | null
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('rehearsals').insert({
    ...data,
    created_by: user?.id,
  })

  if (error) return { success: false, message: error.message }

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