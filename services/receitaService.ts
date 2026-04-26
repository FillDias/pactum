import api from '../config/api'
import { Receita } from '../types'

const mapReceita = (r: any): Receita => ({
  ...r,
  valor: parseFloat(r.valor),
})

export const buscarReceitas = async (mes: number, ano: number): Promise<Receita[]> => {
  const data = await api.get(`/receitas?mes=${mes}&ano=${ano}`)
  return (data.receitas || []).map(mapReceita)
}

export const adicionarReceita = async (
  payload: Omit<Receita, 'id' | 'user_id' | 'familia_id' | 'created_at'>
): Promise<Receita> => {
  const data = await api.post('/receitas', payload)
  return mapReceita(data.receita)
}

export const editarReceita = async (
  id: string,
  payload: Partial<Omit<Receita, 'id' | 'user_id' | 'familia_id' | 'created_at'>>
): Promise<Receita> => {
  const data = await api.patch(`/receitas/${id}`, payload)
  return mapReceita(data.receita)
}

export const removerReceita = async (id: string): Promise<void> => {
  await api.delete(`/receitas/${id}`)
}
