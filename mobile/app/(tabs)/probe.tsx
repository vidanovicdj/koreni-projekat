import { useEffect, useMemo, useState } from 'react'
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  format,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { supabase } from '../../lib/supabase'

const DAY_LABELS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']
const MONTH_LABELS = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]

const ATTENDANCE_LABELS: Record<string, string> = {
  prisutan: 'Prisutan',
  odsutan: 'Odsutan',
  opravdano_odsutan: 'Opravdano odsutan',
}
const ATTENDANCE_COLORS: Record<string, string> = {
  prisutan: '#3B4A34',
  odsutan: '#7A1F2B',
  opravdano_odsutan: '#B08D3F',
}

type Rehearsal = {
  id: string
  rehearsal_datetime: string
  rehearsal_location: string | null
}

export default function ProbeScreen() {
  const [loading, setLoading] = useState(true)
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [cursor, setCursor] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('ensemble_id')
        .eq('id', user.id)
        .single()

      if (!member?.ensemble_id) {
        setLoading(false)
        return
      }

      const { data: rehearsalsData } = await supabase
        .from('rehearsals')
        .select('id, rehearsal_datetime, rehearsal_location')
        .eq('ensemble_id', member.ensemble_id)

      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('rehearsal_id, attendance_status')
        .eq('member_id', user.id)

      const map: Record<string, string> = {}
      ;(attendanceData ?? []).forEach((a) => {
        map[a.rehearsal_id] = a.attendance_status
      })

      setRehearsals((rehearsalsData ?? []) as Rehearsal[])
      setAttendance(map)
      setLoading(false)
    }

    load()
  }, [])

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [cursor])

  function rehearsalsOnDay(day: Date) {
    return rehearsals.filter((r) => isSameDay(new Date(r.rehearsal_datetime), day))
  }

  const selectedRehearsals = selectedDay ? rehearsalsOnDay(selectedDay) : []

  if (loading) {
    return (
      <View className="flex-1 bg-linen items-center justify-center">
        <ActivityIndicator color="#7A1F2B" />
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-linen" contentContainerStyle={{ padding: 20, paddingTop: 70 }}>
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => setCursor((c) => subMonths(c, 1))}>
          <ChevronLeft color="#231A15" size={20} />
        </Pressable>
        <Text className="text-ink text-base" style={{ fontFamily: 'Fraunces_500Medium' }}>
          {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
        </Text>
        <Pressable onPress={() => setCursor((c) => addMonths(c, 1))}>
          <ChevronRight color="#231A15" size={20} />
        </Pressable>
      </View>

      <View className="flex-row mb-1">
        {DAY_LABELS.map((d) => (
          <Text key={d} className="flex-1 text-center text-xs" style={{ color: '#8a8378' }}>{d}</Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor)
          const dayRehearsals = rehearsalsOnDay(day)
          const selected = selectedDay && isSameDay(day, selectedDay)

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => setSelectedDay(day)}
              style={{ width: `${100 / 7}%`, padding: 2 }}
            >
              <View
                className="rounded-md border items-center justify-center py-1.5"
                style={{
                  borderColor: selected ? '#7A1F2B' : '#DCD3C0',
                  backgroundColor: selected ? 'rgba(122,31,43,0.08)' : 'white',
                  minHeight: 44,
                }}
              >
                <Text
                  className="text-xs"
                  style={{
                    color: inMonth ? '#231A15' : '#c2bcae',
                    fontWeight: isToday(day) ? '700' : '400',
                  }}
                >
                  {day.getDate()}
                </Text>
                {dayRehearsals.length > 0 && (
                  <View className="h-1 w-1 rounded-full mt-1" style={{ backgroundColor: '#7A1F2B' }} />
                )}
              </View>
            </Pressable>
          )
        })}
      </View>

      <Text className="text-ink text-sm mt-6 mb-3" style={{ fontFamily: 'Fraunces_500Medium' }}>
        {selectedDay ? format(selectedDay, 'd.M.yyyy.') : 'Izaberi dan'}
      </Text>

      {selectedRehearsals.length === 0 ? (
        <Text className="text-sm" style={{ color: '#8a8378' }}>Nema zakazanih proba.</Text>
      ) : (
        <View className="gap-2">
          {selectedRehearsals.map((r) => {
            const status = attendance[r.id]
            return (
              <View key={r.id} className="bg-white border rounded-md p-3" style={{ borderColor: '#DCD3C0' }}>
                <Text className="text-ink text-sm">
                  {format(new Date(r.rehearsal_datetime), 'HH:mm')}
                  {r.rehearsal_location ? ` — ${r.rehearsal_location}` : ''}
                </Text>
                {status && (
                  <Text className="text-xs mt-1" style={{ color: ATTENDANCE_COLORS[status] }}>
                    {ATTENDANCE_LABELS[status]}
                  </Text>
                )}
              </View>
            )
          })}
        </View>
      )}
    </ScrollView>
  )
}