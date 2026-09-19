import "../global.css"
import { useFonts, Fraunces_500Medium } from '@expo-google-fonts/fraunces'
import { WorkSans_400Regular, WorkSans_500Medium } from '@expo-google-fonts/work-sans'
import { Stack } from 'expo-router'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_500Medium,
    WorkSans_400Regular,
    WorkSans_500Medium,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return <Stack screenOptions={{ headerShown: false }} />
}