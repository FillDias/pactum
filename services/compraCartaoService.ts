import api from '../config/api'
import { CompraCartao } from '../types'

export const buscarComprasCartao = async (escopo?: 'eu' | 'familia'): Promise<CompraCartao[]> => {
  const params = new URLSearchParams()
  if (escopo) params.set('escopo', escopo)
  const query = params.toString()
  const data = await api.get(`/compras_cartao${query ? `?${query}` : ''}`)
  return data.compras_cartao
}

export const adicionarCompraCartao = async (
  compra: Omit<CompraCartao, 'id' | 'user_id' | 'familia_id' | 'cancelada_em' | 'created_at'>
): Promise<CompraCartao> => {
  const data = await api.post('/compras_cartao', compra)
  return data.compra_cartao
}

export const editarCompraCartao = async (
  id: string,
  dados: Partial<Pick<CompraCartao, 'descricao' | 'valor_total' | 'numero_parcelas'>>
): Promise<CompraCartao> => {
  const data = await api.patch(`/compras_cartao/${id}`, dados)
  return data.compra_cartao
}

export const cancelarCompraCartao = async (id: string): Promise<CompraCartao> => {
  const data = await api.post(`/compras_cartao/${id}/cancelar`, {})
  return data.compra_cartao
}
