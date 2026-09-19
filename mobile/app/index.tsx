import { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { supabase } from '../lib/supabase'

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-linen">
        <ActivityIndicator color="#7A1F2B" />
      </View>
    )
  }

  return hasSession ? <Redirect href="/(tabs)/dashboard" /> : <Redirect href="/login" />
}