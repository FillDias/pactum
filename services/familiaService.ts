import api from '../config/api'
import { Familia } from '../types'

export const buscarFamiliaAtual = async (): Promise<Familia | null> => {
  try {
    const data = await api.get('/familias/atual')
    return data.familia || null
  } catch {
    return null
  }
}

export const criarFamilia = async (nome: string): Promise<Familia> => {
  const data = await api.post('/familias', { nome })
  return data.familia
}

export const convidarMembro = async (familiaId: string, email: string): Promise<void> => {
  await api.post(`/familias/${familiaId}/convidar`, { email })
}
