import { createClient } from './server'

export async function getStaffRole() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('staff')
    .select('user_role')
    .eq('id', user.id)
    .single()

  return data?.user_role ?? null
}