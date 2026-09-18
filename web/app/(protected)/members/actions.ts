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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { data: linkData, error: inviteError } = await admin.auth.admin.generateLink({
    type: 'invite',
    email: data.email,
    options: { redirectTo: `${siteUrl}/dobrodoslica` },
  })

  if (inviteError || !linkData.user) {
    return { success: false, message: inviteError?.message ?? 'Greška pri kreiranju naloga.' }
  }

  const { error: insertError } = await admin.from('members').insert({
    id: linkData.user.id,
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
  })

  if (insertError) {
    await admin.auth.admin.deleteUser(linkData.user.id)
    return { success: false, message: insertError.message }
  }

  revalidatePath('/members')
  return { success: true, inviteLink: linkData.properties.action_link }
}