import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Camera } from 'lucide-react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'
import { Bell } from 'lucide-react-native'

const STATUS_LABELS: Record<string, string> = {
  aktivan: 'Aktivan',
  neaktivan: 'Neaktivan',
  suspendovan: 'Suspendovan',
}
const DISCOUNT_LABELS: Record<number, string> = {
  0: 'Bez popusta',
  50: '50% popusta',
  100: '100% popusta',
}
const GENDER_LABELS: Record<string, string> = {
  musko: 'Muško',
  zensko: 'Žensko',
}

type MemberData = {
  member_name: string
  member_surname: string
  date_of_birth: string | null
  place_of_birth: string | null
  citizen_id: string | null
  residence: string | null
  passport_no: string | null
  profession: string | null
  phone_number: string | null
  admission_date: string
  status: string
  category: number
  gender: string | null
  avatar_url: string | null
  ensembles: { ensemble_name: string } | null
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b" style={{ borderColor: '#DCD3C0' }}>
      <Text className="text-sm" style={{ color: '#8a8378' }}>{label}</Text>
      <Text className="text-sm text-ink">{value || '—'}</Text>
    </View>
  )
}

export default function ProfilScreen() {
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [member, setMember] = useState<MemberData | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    if (!userId) return
    supabase
      .from('notifications')
      .select('*')
      .eq('member_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setNotifications(data ?? []))
  }, [userId])

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const { data } = await supabase
      .from('members')
      .select('*, ensembles(ensemble_name)')
      .eq('id', user.id)
      .single()

    setMember(data as unknown as MemberData)
    setLoading(false)
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      Alert.alert('Potrebna dozvola', 'Dozvoli pristup galeriji da bi postavila profilnu sliku.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      aspect: [1, 1],
      allowsEditing: true,
    })

    if (result.canceled || !userId) return

    setUploading(true)

    const asset = result.assets[0]
    const response = await fetch(asset.uri)
    const arrayBuffer = await response.arrayBuffer()
    const path = `${userId}/avatar.jpg`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: true })

    if (uploadError) {
      Alert.alert('Greška', 'Slika nije mogla da se sačuva.')
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithCacheBust = `${publicUrlData.publicUrl}?t=${Date.now()}`

    await supabase.from('members').update({ avatar_url: urlWithCacheBust }).eq('id', userId)

    setMember((prev) => (prev ? { ...prev, avatar_url: urlWithCacheBust } : prev))
    setUploading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <View className="flex-1 bg-linen items-center justify-center">
        <ActivityIndicator color="#7A1F2B" />
      </View>
    )
  }

  if (!member) {
    return (
      <View className="flex-1 bg-linen items-center justify-center px-6">
        <Text className="text-ink text-center">Nije pronađen profil člana.</Text>
      </View>
    )
  }

  return (
    <ScrollView className="flex-1 bg-linen" contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
      <View className="items-center mb-6">
        <Pressable onPress={handlePickImage} disabled={uploading}>
          <View
            className="rounded-full items-center justify-center overflow-hidden"
            style={{ width: 96, height: 96, backgroundColor: '#231A15' }}
          >
            {uploading ? (
              <ActivityIndicator color="#F6F1E4" />
            ) : member.avatar_url ? (
              <Image source={{ uri: member.avatar_url }} style={{ width: 96, height: 96 }} />
            ) : (
              <Text className="text-linen text-2xl" style={{ fontFamily: 'Fraunces_500Medium' }}>
                {member.member_name[0]}{member.member_surname[0]}
              </Text>
            )}
          </View>
          <View
            className="absolute bottom-0 right-0 rounded-full items-center justify-center"
            style={{ width: 28, height: 28, backgroundColor: '#7A1F2B' }}
          >
            <Camera color="#F6F1E4" size={14} />
          </View>
        </Pressable>
        <Text className="text-ink text-lg mt-3" style={{ fontFamily: 'Fraunces_500Medium' }}>
          {member.member_name} {member.member_surname}
        </Text>
      </View>

      <View className="bg-white border rounded-md p-4 mb-6" style={{ borderColor: '#DCD3C0' }}>
        <InfoRow label="Datum rođenja" value={member.date_of_birth ?? ''} />
        <InfoRow label="Mesto rođenja" value={member.place_of_birth ?? ''} />
        <InfoRow label="Pol" value={member.gender ? GENDER_LABELS[member.gender] : ''} />
        <InfoRow label="JMBG" value={member.citizen_id ?? ''} />
        <InfoRow label="Broj pasoša" value={member.passport_no ?? ''} />
        <InfoRow label="Prebivalište" value={member.residence ?? ''} />
        <InfoRow label="Profesija" value={member.profession ?? ''} />
        <InfoRow label="Telefon" value={member.phone_number ?? ''} />
        <InfoRow label="Datum prijema" value={member.admission_date} />
        <InfoRow label="Status" value={STATUS_LABELS[member.status] ?? member.status} />
        <InfoRow label="Popust na članarinu" value={DISCOUNT_LABELS[member.category] ?? ''} />
        <InfoRow label="Grupa" value={member.ensembles?.ensemble_name ?? ''} />
      </View>

      {notifications.length > 0 && (
        <View className="w-full mb-6">
          <Text className="text-ink text-sm mb-3" style={{ fontFamily: 'Fraunces_500Medium' }}>
            Notifikacije
          </Text>
          <View className="gap-2">
            {notifications.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => markAsRead(n.id)}
                className="bg-white border rounded-md p-3 flex-row gap-2"
                style={{ borderColor: n.is_read ? '#DCD3C0' : '#B08D3F' }}
              >
                <Bell color={n.is_read ? '#8a8378' : '#7A1F2B'} size={16} />
                <View className="flex-1">
                  <Text className="text-ink text-sm">{n.notification_subject}</Text>
                  {n.notification_text && (
                    <Text className="text-xs mt-0.5" style={{ color: '#8a8378' }}>{n.notification_text}</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Pressable
        onPress={handleLogout}
        className="h-11 rounded-md items-center justify-center"
        style={{ backgroundColor: '#7A1F2B' }}
      >
        <Text className="text-linen text-sm font-medium">Odjavi se</Text>
      </Pressable>
    </ScrollView>
  )
}