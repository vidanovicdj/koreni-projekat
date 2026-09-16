import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/sidebar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: staff, error } = await supabase
    .from('staff')
    .select('user_name, user_surname, user_role')
    .eq('id', user.id)
    .single()

  if (!staff) redirect('/login')

  return (
    <div className="flex min-h-screen bg-linen">
      <Sidebar role={staff.user_role} name={`${staff.user_name} ${staff.user_surname}`} />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}