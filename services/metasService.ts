import api from '../config/api'
import { Meta } from '../types'

export const buscarMetas = async (): Promise<Meta[]> => {
  const data = await api.get('/metas')
  return data.metas
}

export const adicionarMeta = async (
  meta: Omit<Meta, 'id' | 'created_at'>
): Promise<Meta> => {
  const data = await api.post('/metas', meta)
  return data.meta
}

export const atualizarProgressoMeta = async (
  id: string,
  valorAtual: number
): Promise<Meta> => {
  const data = await api.patch(`/metas/${id}`, { valor_atual: valorAtual })
  return data.meta
}

export const removerMeta = async (id: string): Promise<void> => {
  await api.delete(`/metas/${id}`)
}
