'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Member } from '@/lib/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStaffRole } from '@/lib/supabase/get-staff-role'

export async function updateMember(id: string, updates: Partial<Member>) {
  const supabase = await createClient()

  const { error } = await supabase.from('members').update(updates).eq('id', id)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/members')
  return { success: true }
}

export async function createMember(data: {
  email: string
  password: string
  member_name: string
  member_surname: string
  date_of_birth: string | null
  place_of_birth: string | null
  gender: string | null
  citizen_id: string | null
  residence: string | null
  passport_no: string | null
  profession: string | null
  phone_number: string | null
  admission_date: string | null
  status: string
  ensemble_id: string | null
  category: number
}) {
  const role = await getStaffRole()
  if (role !== 'admin') {
    return { success: false, message: 'Samo administrator može kreirati nove članove.' }
  }

  const admin = createAdminClient()

  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
  })

  if (createError || !userData.user) {
    return { success: false, message: createError?.message ?? 'Greška pri kreiranju naloga.' }
  }

  const { error: insertError } = await admin.from('members').insert({
    id: userData.user.id,
    member_name: data.member_name,
    member_surname: data.member_surname,
    date_of_birth: data.date_of_birth,
    place_of_birth: data.place_of_birth,
    citizen_id: data.citizen_id,
    residence: data.residence,
    passport_no: data.passport_no,
    profession: data.profession,
    phone_number: data.phone_number,
    admission_date: data.admission_date ?? new Date().toISOString().slice(0, 10),
    status: data.status,
    ensemble_id: data.ensemble_id,
    category: data.category,
    gender: data.gender,
  })

  if (insertError) {
    await admin.auth.admin.deleteUser(userData.user.id)
    return { success: false, message: insertError.message }
  }

  revalidatePath('/members')
  return { success: true }
}