import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { Calendar, TrendingUp, Shirt } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'

type Stats = {
  memberName: string
  gender: 'musko' | 'zensko' | null
  nextRehearsal: { datetime: string; location: string | null; ensembleName: string } | null
  attendanceRate: number
  currentItems: { name: string }[]
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ color: string; size: number }>
  label: string
  value: string
  sub?: string
}) {
  return (
    <View className="flex-1 bg-white border rounded-md p-4 flex-row gap-3" style={{ borderColor: '#DCD3C0' }}>
      <View className="rounded-md p-2" style={{ backgroundColor: 'rgba(122,31,43,0.1)' }}>
        <Icon color="#7A1F2B" size={18} />
      </View>
      <View className="flex-1">
        <Text className="text-xs" style={{ color: '#8a8378' }}>{label}</Text>
        <Text className="text-ink text-xl mt-0.5" style={{ fontFamily: 'Fraunces_500Medium' }}>{value}</Text>
        {sub && <Text className="text-xs mt-0.5" style={{ color: '#8a8378' }}>{sub}</Text>}
      </View>
    </View>
  )
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('member_name, ensemble_id, gender')
        .eq('id', user.id)
        .single()

      if (!member) {
        setLoading(false)
        return
      }

      const now = new Date()

      const { data: nextRehearsal } = await supabase
        .from('rehearsals')
        .select('rehearsal_datetime, rehearsal_location, ensembles(ensemble_name)')
        .eq('ensemble_id', member.ensemble_id)
        .gte('rehearsal_datetime', now.toISOString())
        .order('rehearsal_datetime', { ascending: true })
        .limit(1)
        .maybeSingle()

      const { data: attendanceRows } = await supabase
        .from('attendance')
        .select('attendance_status')
        .eq('member_id', user.id)

      const total = attendanceRows?.length ?? 0
      const present = attendanceRows?.filter((a) => a.attendance_status === 'prisutan').length ?? 0
      const rate = total > 0 ? Math.round((present / total) * 100) : 0

      const { data: assignments } = await supabase
        .from('resource_assignments')
        .select('costume_items(costume_item_name)')
        .eq('member_id', user.id)
        .eq('status', 'zaduzeno')

      const currentItems = (assignments ?? []).map((a: any) => ({
        name: a.costume_items?.costume_item_name ?? '—',
      }))

      const next = nextRehearsal as any

      setStats({
        memberName: member.member_name,
        gender: member.gender,
        nextRehearsal: next
          ? {
              datetime: next.rehearsal_datetime,
              location: next.rehearsal_location,
              ensembleName: next.ensembles?.ensemble_name ?? '',
            }
          : null,
        attendanceRate: rate,
        currentItems,
      })
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 bg-linen items-center justify-center">
        <ActivityIndicator color="#7A1F2B" />
      </View>
    )
  }

  if (!stats) {
    return (
      <View className="flex-1 bg-linen items-center justify-center px-6">
        <Text className="text-ink text-center">Nije pronađen profil člana za ovaj nalog.</Text>
      </View>
    )
  }

  const nextDate = stats.nextRehearsal
    ? new Date(stats.nextRehearsal.datetime).toLocaleDateString('sr-RS', {
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

  return (
    <ScrollView className="flex-1 bg-linen" contentContainerStyle={{ padding: 24, paddingTop: 64 }}>
      <Text className="text-ink text-xl mb-1" style={{ fontFamily: 'Fraunces_500Medium' }}>
        {stats.gender === 'zensko' ? 'Dobro došla' : 'Dobro došao'}, {stats.memberName}
      </Text>
      <View className="h-[3px] w-14 rounded-full mb-6" style={{ backgroundColor: '#B08D3F' }} />

      <View className="gap-3">
        <StatCard
          icon={Calendar}
          label="Sledeća proba"
          value={nextDate}
          sub={stats.nextRehearsal ? `${stats.nextRehearsal.ensembleName}${stats.nextRehearsal.location ? ' — ' + stats.nextRehearsal.location : ''}` : 'Nema zakazanih proba'}
        />
        <StatCard
          icon={TrendingUp}
          label="Procenat prisustva"
          value={`${stats.attendanceRate}%`}
          sub="ukupno, sve evidentirane probe"
        />
      </View>

      <Text className="text-ink text-sm mt-8 mb-3" style={{ fontFamily: 'Fraunces_500Medium' }}>
        Trenutno zadužena nošnja
      </Text>

      {stats.currentItems.length === 0 ? (
        <View className="bg-white border rounded-md p-4" style={{ borderColor: '#DCD3C0' }}>
          <Text className="text-sm" style={{ color: '#8a8378' }}>Trenutno nemaš zaduženu nošnju.</Text>
        </View>
      ) : (
        <View className="gap-2">
          {stats.currentItems.map((item, i) => (
            <View key={i} className="bg-white border rounded-md p-3 flex-row items-center gap-3" style={{ borderColor: '#DCD3C0' }}>
              <Shirt color="#7A1F2B" size={16} />
              <Text className="text-ink text-sm">{item.name}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}