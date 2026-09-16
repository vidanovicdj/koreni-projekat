import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-linen p-10">
      <h1 className="font-serif text-xl text-ink">Dobrodošla!</h1>
      <p className="text-sm text-ink/70 mt-1">Ulogovana kao: {user?.email}</p>
    </div>
  )
}