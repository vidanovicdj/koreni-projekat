import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getStaffRole } from '@/lib/supabase/get-staff-role'
import { startOfMonth, endOfMonth, format, differenceInDays, subDays } from 'date-fns'
import {
  Users,
  Layers,
  UserCog,
  Shirt,
  Calendar,
  TrendingUp,
  Clock,
  PackageCheck,
  PackageOpen,
  Cake,
  AlertTriangle,
} from 'lucide-react'

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
}) {
  return (
    <div className="border border-[#DCD3C0] rounded-md p-4 bg-white flex items-start gap-3">
      <div className="rounded-md bg-wine/10 text-wine p-2 shrink-0">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-ink/60 mb-1">{label}</p>
        <p className="text-2xl font-serif text-ink">{value}</p>
        {sub && <p className="text-xs text-ink/50 mt-1">{sub}</p>}
      </div>
    </div>
  )
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-block px-4 py-2 rounded-md bg-wine text-linen text-sm font-medium hover:bg-wine/90 transition"
    >
      {label}
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const role = await getStaffRole()

  const { data: staffProfile } = await supabase
    .from('staff')
    .select('user_name, user_surname')
    .eq('id', user?.id ?? '')
    .single()

  const greetName = staffProfile?.user_name ?? user?.email ?? ''

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-xl text-ink mb-1">Dobro došli, {greetName}</h1>
        <div className="h-[3px] w-14 rounded-full bg-[repeating-linear-gradient(45deg,#B08D3F_0_5px,#7A1F2B_5px_10px)]" />
      </div>

      {role === 'admin' && <AdminSection />}
      {role === 'rukovodilac' && <RukovodilacSection />}
      {role === 'garderober' && <GarderoberSection />}

      {(role === 'rukovodilac' || role === 'admin') && <RehearsalWarnings />}
      {(role === 'garderober' || role === 'admin') && <AssignmentWarnings />}

      <BirthdaysSection />
    </div>
  )
}

async function AdminSection() {
  const supabase = await createClient()

  const [membersCount, ensemblesCount, staffCount, itemsCount] = await Promise.all([
    supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'aktivan'),
    supabase.from('ensembles').select('*', { count: 'exact', head: true }),
    supabase.from('staff').select('*', { count: 'exact', head: true }),
    supabase.from('costume_items').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Layers} label="Ansambli" value={ensemblesCount.count ?? 0} />
        <StatCard icon={Users} label="Aktivni članovi" value={membersCount.count ?? 0} />
        <StatCard icon={UserCog} label="Zaposleni" value={staffCount.count ?? 0} />
        <StatCard icon={Shirt} label="Scenski kostimi" value={itemsCount.count ?? 0} />
      </div>
      <div className="flex gap-3">
        <QuickAction href="/members" label="Novi član" />
        <QuickAction href="/statistics" label="Statistika" />
      </div>
    </div>
  )
}

async function RukovodilacSection() {
  const supabase = await createClient()
  const now = new Date()
  const from = startOfMonth(now).toISOString()
  const to = endOfMonth(now).toISOString()

  const [{ data: monthRehearsals }, { data: nextRehearsal }] = await Promise.all([
    supabase
      .from('rehearsals')
      .select('id, ensembles(ensemble_name)')
      .gte('rehearsal_datetime', from)
      .lte('rehearsal_datetime', to),
    supabase
      .from('rehearsals')
      .select('rehearsal_datetime, rehearsal_location, ensembles(ensemble_name)')
      .gte('rehearsal_datetime', now.toISOString())
      .order('rehearsal_datetime', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const rIds = (monthRehearsals ?? []).map((r) => r.id)
  let avgAttendance = 0

  if (rIds.length > 0) {
    const { data: attendanceRows } = await supabase
      .from('attendance')
      .select('rehearsal_id, attendance_status')
      .in('rehearsal_id', rIds)

    const heldIds = new Set((attendanceRows ?? []).map((a) => a.rehearsal_id))
    const present = (attendanceRows ?? []).filter((a) => a.attendance_status === 'prisutan').length
    avgAttendance = heldIds.size > 0 ? present / heldIds.size : 0
  }

  const next = nextRehearsal as any

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Calendar} label="Broj proba ovog meseca" value={monthRehearsals?.length ?? 0} />
        <StatCard icon={TrendingUp} label="Prosečan dolazak" value={avgAttendance.toFixed(1)} sub="po probi, ovaj mesec" />
        <StatCard
          icon={Clock}
          label="Sledeća proba"
          value={next ? format(new Date(next.rehearsal_datetime), 'd.M. HH:mm') : '—'}
          sub={next?.ensembles?.ensemble_name ?? undefined}
        />
      </div>
      <div className="flex gap-3">
        <QuickAction href="/rehearsals" label="Zakaži probu" />
        <QuickAction href="/statistics" label="Statistika" />
      </div>
    </div>
  )
}

async function GarderoberSection() {
  const supabase = await createClient()

  const [assignedCount, availableCount, onRepairCount] = await Promise.all([
    supabase.from('costume_items').select('*', { count: 'exact', head: true }).eq('status', 'zaduzeno'),
    supabase.from('costume_items').select('*', { count: 'exact', head: true }).eq('status', 'dostupno'),
    supabase.from('costume_items').select('*', { count: 'exact', head: true }).eq('status', 'na_popravci'),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={PackageCheck} label="Trenutno zaduženo" value={assignedCount.count ?? 0} />
        <StatCard icon={PackageOpen} label="Dostupno u fundusu" value={availableCount.count ?? 0} />
        <StatCard icon={PackageOpen} label="Na popravci" value={onRepairCount.count ?? 0} />
      </div>
      <div className="flex gap-3">
        <QuickAction href="/assignments" label="Novo zaduženje" />
        <QuickAction href="/wardrobe" label="Fundus" />
      </div>
    </div>
  )
}

async function RehearsalWarnings() {
  const supabase = await createClient()
  const now = new Date()
  const from = subDays(now, 30).toISOString()

  const { data: pastRehearsals } = await supabase
    .from('rehearsals')
    .select('id, rehearsal_datetime, ensembles(ensemble_name)')
    .lt('rehearsal_datetime', now.toISOString())
    .gte('rehearsal_datetime', from)
    .order('rehearsal_datetime', { ascending: false })

  const ids = (pastRehearsals ?? []).map((r) => r.id)
  let missingIds = new Set(ids)

  if (ids.length > 0) {
    const { data: attendanceRows } = await supabase
      .from('attendance')
      .select('rehearsal_id')
      .in('rehearsal_id', ids)

    const withAttendance = new Set((attendanceRows ?? []).map((a) => a.rehearsal_id))
    missingIds = new Set(ids.filter((id) => !withAttendance.has(id)))
  }

  const missing = (pastRehearsals ?? []).filter((r) => missingIds.has(r.id)) as any[]

  if (missing.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-gold" />
        <h3 className="text-sm font-medium text-ink/70">Probe bez evidentiranog prisustva</h3>
      </div>
      <div className="flex flex-col gap-2">
        {missing.map((r) => (
          <div
            key={r.id}
            className="border border-gold/40 bg-gold/5 rounded-md p-3 flex items-center justify-between text-sm"
          >
            <span className="text-ink">{r.ensembles?.ensemble_name ?? '—'}</span>
            <span className="text-ink/60">{format(new Date(r.rehearsal_datetime), 'd.M.yyyy. HH:mm')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

async function AssignmentWarnings() {
  const supabase = await createClient()

  const { data: assignments } = await supabase
    .from('resource_assignments')
    .select('id, borrow_date, costume_items(costume_item_name), members(member_name, member_surname)')
    .eq('status', 'zaduženo')

  const overdue = (assignments ?? []).filter(
    (a: any) => differenceInDays(new Date(), new Date(a.borrow_date)) > 60
  ) as any[]

  if (overdue.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={16} className="text-gold" />
        <h3 className="text-sm font-medium text-ink/70">Zaduženja duža od 60 dana</h3>
      </div>
      <div className="flex flex-col gap-2">
        {overdue.map((a) => (
          <div
            key={a.id}
            className="border border-gold/40 bg-gold/5 rounded-md p-3 flex items-center justify-between text-sm"
          >
            <div>
              <span className="text-ink">{a.costume_items?.costume_item_name ?? '—'}</span>
              <span className="text-ink/50"> — {a.members?.member_name} {a.members?.member_surname}</span>
            </div>
            <span className="text-ink/60">
              {differenceInDays(new Date(), new Date(a.borrow_date))} dana
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

async function BirthdaysSection() {
  const supabase = await createClient()
  const currentMonth = format(new Date(), 'MM')

  const { data: members } = await supabase
    .from('members')
    .select('id, member_name, member_surname, date_of_birth')
    .eq('status', 'aktivan')
    .not('date_of_birth', 'is', null)

  const birthdays = (members ?? [])
    .filter((m) => m.date_of_birth?.slice(5, 7) === currentMonth)
    .sort((a, b) => a.date_of_birth!.slice(8, 10).localeCompare(b.date_of_birth!.slice(8, 10)))

  if (birthdays.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Cake size={16} className="text-wine" />
        <h3 className="text-sm font-medium text-ink/70">Rođendani ovog meseca</h3>
      </div>
      <div className="flex flex-col gap-2">
        {birthdays.map((m) => (
          <div
            key={m.id}
            className="border border-[#DCD3C0] rounded-md p-3 flex items-center justify-between text-sm"
          >
            <span className="text-ink">{m.member_name} {m.member_surname}</span>
            <span className="text-ink/60">{m.date_of_birth!.slice(8, 10)}.{m.date_of_birth!.slice(5, 7)}.</span>
          </div>
        ))}
      </div>
    </div>
  )
}