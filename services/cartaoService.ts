import api from '../config/api'
import { Cartao } from '../types'

export const buscarCartoes = async (escopo?: 'eu' | 'familia'): Promise<Cartao[]> => {
  const params = new URLSearchParams()
  if (escopo) params.set('escopo', escopo)
  const query = params.toString()
  const data = await api.get(`/cartoes${query ? `?${query}` : ''}`)
  return data.cartoes
}

export const adicionarCartao = async (
  cartao: Omit<Cartao, 'id' | 'user_id' | 'familia_id' | 'created_at'>
): Promise<Cartao> => {
  const data = await api.post('/cartoes', cartao)
  return data.cartao
}

export const editarCartao = async (id: string, dados: Partial<Cartao>): Promise<Cartao> => {
  const data = await api.patch(`/cartoes/${id}`, dados)
  return data.cartao
}

export const removerCartao = async (id: string): Promise<void> => {
  await api.delete(`/cartoes/${id}`)
}

export const buscarComprometidoFuturo = async (
  mes: number,
  ano: number,
  escopo?: 'eu' | 'familia'
): Promise<number> => {
  const params = new URLSearchParams({ mes: String(mes), ano: String(ano) })
  if (escopo) params.set('escopo', escopo)
  const data = await api.get(`/cartoes/comprometido_futuro?${params.toString()}`)
  return data.comprometido_futuro
}
