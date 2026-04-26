import api from '../config/api'
import { Usuario, Familia } from '../types'

export const login = async (email: string, senha: string): Promise<Usuario> => {
  const data = await api.post('/auth/login', { email, password: senha })
  await api.saveToken(data.token)
  return data.user
}

export const register = async (
  nome: string,
  email: string,
  senha: string
): Promise<Usuario> => {
  const data = await api.post('/auth/register', { nome, email, password: senha })
  await api.saveToken(data.token)
  return data.user
}

export const logout = async (): Promise<void> => {
  await api.delete('/auth/logout')
  await api.removeToken()
}

export const buscarPerfil = async (): Promise<{
  usuario: Usuario | null
  familia: Familia | null
}> => {
  const token = await api.getToken()
  if (!token) return { usuario: null, familia: null }

  try {
    const data = await api.get('/perfil')
    const familiaData = await api.get('/familias/atual').catch(() => null)
    return {
      usuario: data.user,
      familia: familiaData?.familia || null,
    }
  } catch {
    return { usuario: null, familia: null }
  }
}

export const convidarMembro = async (email: string, familiaId: string): Promise<void> => {
  await api.post(`/familias/${familiaId}/convidar`, { email })
}
