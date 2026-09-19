import { View, Text, Pressable } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../../lib/supabase'

export default function ProfilScreen() {
  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <View className="flex-1 bg-linen items-center justify-center gap-4">
      <Text className="text-ink" style={{ fontFamily: 'Fraunces_500Medium', fontSize: 20 }}>Profil</Text>
      <Pressable onPress={handleLogout} className="px-4 py-2 rounded-md" style={{ backgroundColor: '#7A1F2B' }}>
        <Text className="text-linen text-sm">Odjavi se</Text>
      </Pressable>
    </View>
  )
}