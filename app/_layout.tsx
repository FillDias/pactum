// Layout raiz — verifica sessão e exibe loading durante inicialização
import { useEffect, useState } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { useAuthStore } from '../store/authStore'
import Loading from '../components/ui/Loading'
import '../global.css'

export default function RootLayout() {
  const { usuario, buscarPerfil, carregando } = useAuthStore()
  const segments = useSegments()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    buscarPerfil().finally(() => setVerificando(false))
  }, [])

  useEffect(() => {
    if (verificando) return
    const emAuth = segments[0] === '(auth)'
    if (!usuario && !emAuth) {
      router.replace('/(auth)/login')
    } else if (usuario && emAuth) {
      router.replace('/(tabs)')
    }
  }, [usuario, segments, verificando])

  if (verificando) return <Loading mensagem="Iniciando Pactum..." />

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  )
}
