import api from '../config/api'
import { Investimento } from '../types'

const mapInvestimento = (i: any): Investimento => ({
  ...i,
  valor_investido: parseFloat(i.valor_investido),
  rendimento_mensal_estimado: parseFloat(i.rendimento_mensal_estimado ?? '0'),
  rentabilidade_percentual: i.rentabilidade_percentual != null
    ? parseFloat(i.rentabilidade_percentual)
    : null,
})

export const buscarInvestimentos = async (): Promise<{
  investimentos: Investimento[]
  patrimonio_total: number
  rendimento_mensal: number
}> => {
  const data = await api.get('/investimentos')
  return {
    investimentos: (data.investimentos || []).map(mapInvestimento),
    patrimonio_total: parseFloat(data.patrimonio_total ?? '0'),
    rendimento_mensal: parseFloat(data.rendimento_mensal ?? '0'),
  }
}

export const adicionarInvestimento = async (
  payload: Omit<Investimento, 'id' | 'user_id' | 'rendimento_mensal_estimado' | 'created_at'>
): Promise<Investimento> => {
  const data = await api.post('/investimentos', payload)
  return mapInvestimento(data.investimento)
}

export const editarInvestimento = async (
  id: string,
  payload: Partial<Omit<Investimento, 'id' | 'user_id' | 'rendimento_mensal_estimado' | 'created_at'>>
): Promise<Investimento> => {
  const data = await api.patch(`/investimentos/${id}`, payload)
  return mapInvestimento(data.investimento)
}

export const removerInvestimento = async (id: string): Promise<void> => {
  await api.delete(`/investimentos/${id}`)
}
