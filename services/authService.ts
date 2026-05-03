import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../config/api'
import coreApi from '../config/coreApi'
import { Usuario, Familia } from '../types'

export const EMAIL_KEY = 'pactum_email'

const loginCore = async (email: string, pactumToken: string, name?: string) => {
  try {
    const res = await coreApi.post('/auth/sync', { email, pactum_token: pactumToken, name })
    if (res.data?.token) await coreApi.saveCoreToken(res.data.token)
  } catch {
    /* non-blocking */
  }
}

export const login = async (email: string, senha: string): Promise<Usuario> => {
  const data = await api.post('/auth/login', { email, password: senha })
  await api.saveToken(data.token)
  if (data.refresh_token) await api.saveRefreshToken(data.refresh_token)
  await AsyncStorage.setItem(EMAIL_KEY, email)
  await loginCore(email, data.token, data.user?.nome)
  return data.user
}

export const register = async (
  nome: string,
  email: string,
  senha: string
): Promise<Usuario> => {
  const data = await api.post('/auth/register', { nome, email, password: senha })
  await api.saveToken(data.token)
  if (data.refresh_token) await api.saveRefreshToken(data.refresh_token)
  await AsyncStorage.setItem(EMAIL_KEY, email)
  await loginCore(email, data.token, nome)
  return data.user
}

export const logout = async (): Promise<void> => {
  await Promise.all([
    api.delete('/auth/logout').catch(() => {}),
    coreApi.delete('/auth/logout').catch(() => {}),
  ])
  await Promise.all([
    api.removeToken(),
    coreApi.removeCoreToken(),
    AsyncStorage.removeItem(EMAIL_KEY),
  ])
}

export const buscarPerfil = async (): Promise<{
  usuario: Usuario | null
  familia: Familia | null
}> => {
  const token = await api.getToken()
  if (!token) return { usuario: null, familia: null }

  try {
    const [data, familiaData] = await Promise.all([
      api.get('/perfil'),
      api.get('/familias/atual').catch(() => null),
    ])
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
