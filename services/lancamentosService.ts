// Serviço de lançamentos — CRUD de receitas e despesas via Supabase
import { supabase } from '../config/supabase'
import { Lancamento } from '../types'

// Busca lançamentos do casal por mês e ano
export const buscarLancamentos = async (
  casalId: string,
  mes: number,
  ano: number
): Promise<Lancamento[]> => {
  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .eq('casal_id', casalId)
    .eq('mes', mes)
    .eq('ano', ano)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Adiciona novo lançamento e envia mensagem automática no chat
export const adicionarLancamento = async (
  lancamento: Omit<Lancamento, 'id' | 'created_at'>
): Promise<Lancamento> => {
  const { data, error } = await supabase
    .from('lancamentos')
    .insert(lancamento)
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Mensagem automática no chat informando o lançamento ao casal
  await supabase.from('mensagens').insert({
    casal_id: lancamento.casal_id,
    usuario_id: lancamento.usuario_id,
    conteudo: `lançou ${lancamento.tipo === 'despesa' ? '💸' : '💰'} ${lancamento.descricao} de R$ ${lancamento.valor.toFixed(2).replace('.', ',')}`,
    tipo: 'sistema',
  })

  return data
}

// Edita um lançamento existente
export const editarLancamento = async (
  id: string,
  dados: Partial<Lancamento>
): Promise<Lancamento> => {
  const { data, error } = await supabase
    .from('lancamentos')
    .update(dados)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Remove um lançamento
export const removerLancamento = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('lancamentos')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
