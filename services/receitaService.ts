import api from '../config/api'
import { Receita } from '../types'

const mapToReceita = (l: any): Receita => ({
  id: l.id,
  user_id: l.user_id,
  familia_id: l.familia_id,
  descricao: l.descricao,
  valor: parseFloat(l.valor),
  tipo: (l.categoria as Receita['tipo']) || 'outro',
  recorrente: l.recorrente ?? false,
  mes: l.mes,
  ano: l.ano,
  created_at: l.created_at,
})

export const buscarReceitas = async (mes: number, ano: number): Promise<Receita[]> => {
  const data = await api.get(`/lancamentos?tipo=receita&mes=${mes}&ano=${ano}`)
  return (data.lancamentos || [])
    .filter((l: any) => l.tipo === 'receita')
    .map(mapToReceita)
}

export const adicionarReceita = async (
  payload: Omit<Receita, 'id' | 'user_id' | 'familia_id' | 'created_at'>
): Promise<Receita> => {
  const data = await api.post('/lancamentos', {
    descricao: payload.descricao,
    valor: payload.valor,
    tipo: 'receita',
    categoria: payload.tipo,
    recorrente: payload.recorrente,
    mes: payload.mes,
    ano: payload.ano,
  })
  return mapToReceita(data.lancamento)
}

export const editarReceita = async (
  id: string,
  payload: Partial<Omit<Receita, 'id' | 'user_id' | 'familia_id' | 'created_at'>>
): Promise<Receita> => {
  const body: Record<string, any> = { ...payload }
  if (payload.tipo) {
    body.categoria = payload.tipo
    body.tipo = 'receita'
  }
  const data = await api.patch(`/lancamentos/${id}`, body)
  return mapToReceita(data.lancamento)
}

export const removerReceita = async (id: string): Promise<void> => {
  await api.delete(`/lancamentos/${id}`)
}
