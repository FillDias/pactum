import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { Stack, router, useSegments } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useAuthStore } from '../store/authStore'
import Loading from '../components/ui/Loading'
import '../global.css'

export default function RootLayout() {
  const { usuario, buscarPerfil } = useAuthStore()
  const segments = useSegments()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    buscarPerfil().finally(() => setVerificando(false))
  }, [])

  useEffect(() => {
    if (verificando) return
    const emAuth    = segments[0] === '(auth)'
    const emLanding = segments[0] === 'landing'

    if (!usuario && !emAuth && !emLanding) {
      if (Platform.OS === 'web') {
        router.replace('/landing')
      } else {
        router.replace('/(auth)/login')
      }
    } else if (usuario && (emAuth || emLanding)) {
      router.replace('/(tabs)')
    }
  }, [usuario, segments, verificando])

  if (verificando) return <Loading mensagem="Iniciando Pactum..." />

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="landing" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SafeAreaProvider>
  )
}
