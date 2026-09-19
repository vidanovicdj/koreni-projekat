import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator } from 'react-native'
import { format } from 'date-fns'
import { Shirt } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'

type AssignmentRow = {
  id: string
  borrow_date: string
  return_date: string | null
  status: string
  costume_item_name: string
}

export default function KostimiScreen() {
  const [loading, setLoading] = useState(true)
  const [rows, setRows] = useState<AssignmentRow[]>([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('resource_assignments')
        .select('id, borrow_date, return_date, status, costume_items(costume_item_name)')
        .eq('member_id', user.id)
        .order('borrow_date', { ascending: false })

      setRows(
        (data ?? []).map((row: any) => ({
          id: row.id,
          borrow_date: row.borrow_date,
          return_date: row.return_date,
          status: row.status,
          costume_item_name: row.costume_items?.costume_item_name ?? '—',
        }))
      )
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

  const active = rows.filter((r) => r.status === 'zaduzeno')
  const history = rows.filter((r) => r.status === 'vraceno')

  return (
    <ScrollView className="flex-1 bg-linen" contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
      <Text className="text-ink text-xl mb-1" style={{ fontFamily: 'Fraunces_500Medium' }}>
        Nošnja
      </Text>
      <View className="h-[3px] w-14 rounded-full mb-6" style={{ backgroundColor: '#B08D3F' }} />

      <Text className="text-ink text-sm mb-3" style={{ fontFamily: 'Fraunces_500Medium' }}>
        Trenutno zaduženo
      </Text>

      {active.length === 0 ? (
        <View className="bg-white border rounded-md p-4 mb-6" style={{ borderColor: '#DCD3C0' }}>
          <Text className="text-sm" style={{ color: '#8a8378' }}>Trenutno nemaš zaduženu nošnju.</Text>
        </View>
      ) : (
        <View className="gap-2 mb-6">
          {active.map((r) => (
            <View key={r.id} className="bg-white border rounded-md p-3 flex-row items-center gap-3" style={{ borderColor: '#DCD3C0' }}>
              <View className="rounded-md p-2" style={{ backgroundColor: 'rgba(122,31,43,0.1)' }}>
                <Shirt color="#7A1F2B" size={16} />
              </View>
              <View className="flex-1">
                <Text className="text-ink text-sm">{r.costume_item_name}</Text>
                <Text className="text-xs mt-0.5" style={{ color: '#8a8378' }}>
                  Zaduženo {format(new Date(r.borrow_date), 'd.M.yyyy.')}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text className="text-ink text-sm mb-3" style={{ fontFamily: 'Fraunces_500Medium' }}>
        Istorija
      </Text>

      {history.length === 0 ? (
        <Text className="text-sm" style={{ color: '#8a8378' }}>Nema prethodnih zaduženja.</Text>
      ) : (
        <View className="gap-2">
          {history.map((r) => (
            <View key={r.id} className="flex-row justify-between">
              <Text className="text-xs" style={{ color: '#8a8378' }}>{r.costume_item_name}</Text>
              <Text className="text-xs" style={{ color: '#8a8378' }}>
                {format(new Date(r.borrow_date), 'd.M.yyyy.')} — {format(new Date(r.return_date!), 'd.M.yyyy.')}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}