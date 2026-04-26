import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { usuario, familia, buscarPerfil, carregando } = useAuthStore()

  useEffect(() => {
    buscarPerfil()
  }, [])

  return { usuario, familia, carregando }
}
