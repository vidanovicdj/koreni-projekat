import { useState } from 'react'
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError('Pogrešan email ili lozinka')
      return
    }
    router.replace('/(tabs)/dashboard')
  }

  return (
    <View className="flex-1 bg-linen items-center justify-center px-6">
      <View className="bg-ink rounded-xl px-8 py-10 w-full max-w-sm items-center gap-4">
        <View className="h-1 w-28 rounded-full" style={{ backgroundColor: '#B08D3F' }} />
        <Text className="text-2xl text-linen" style={{ fontFamily: 'Fraunces_500Medium' }}>
          CNKN "Koreni"
        </Text>
        <View className="w-full gap-3 mt-2">
          <TextInput
            placeholder="ime@udruzenje.rs"
            placeholderTextColor="#8a8378"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            className="h-11 rounded-md border px-3 text-sm bg-linen text-ink"
            style={{ borderColor: '#B08D3F' }}
          />
          <TextInput
            placeholder="lozinka"
            placeholderTextColor="#8a8378"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            className="h-11 rounded-md border px-3 text-sm bg-linen text-ink"
            style={{ borderColor: '#B08D3F' }}
          />
          {error && <Text className="text-sm text-red-300">{error}</Text>}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="h-11 rounded-md items-center justify-center mt-1"
            style={{ backgroundColor: '#7A1F2B' }}
          >
            {loading ? (
              <ActivityIndicator color="#F6F1E4" />
            ) : (
              <Text className="text-linen text-sm font-medium">Prijavi se</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  )
}