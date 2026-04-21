// Hook para verificar e manter sessão ativa
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { usuario, casal, buscarPerfil, carregando } = useAuthStore()

  useEffect(() => {
    buscarPerfil()
  }, [])

  return { usuario, casal, carregando }
}
