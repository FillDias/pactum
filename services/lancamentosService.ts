import api from '../config/api'
import { Lancamento } from '../types'

const mapLancamento = (l: any): Lancamento => ({
  ...l,
  valor: parseFloat(l.valor),
})

export const buscarLancamentos = async (
  mes: number,
  ano: number
): Promise<Lancamento[]> => {
  const data = await api.get(`/lancamentos?mes=${mes}&ano=${ano}`)
  return data.lancamentos.map(mapLancamento)
}

export const adicionarLancamento = async (
  lancamento: Omit<Lancamento, 'id' | 'created_at'>
): Promise<Lancamento> => {
  const data = await api.post('/lancamentos', lancamento)
  return mapLancamento(data.lancamento)
}

export const editarLancamento = async (
  id: string,
  dados: Partial<Lancamento>
): Promise<Lancamento> => {
  const data = await api.patch(`/lancamentos/${id}`, dados)
  return mapLancamento(data.lancamento)
}

export const removerLancamento = async (id: string): Promise<void> => {
  await api.delete(`/lancamentos/${id}`)
}
