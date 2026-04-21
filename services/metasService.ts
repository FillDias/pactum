// Serviço de metas — CRUD de metas financeiras do casal via Supabase
import { supabase } from '../config/supabase'
import { Meta } from '../types'

// Busca metas do casal
export const buscarMetas = async (casalId: string): Promise<Meta[]> => {
  const { data, error } = await supabase
    .from('metas')
    .select('*')
    .eq('casal_id', casalId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

// Adiciona nova meta
export const adicionarMeta = async (
  meta: Omit<Meta, 'id' | 'created_at'>
): Promise<Meta> => {
  const { data, error } = await supabase
    .from('metas')
    .insert(meta)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Atualiza valor atual de progresso de uma meta
export const atualizarProgressoMeta = async (
  id: string,
  valorAtual: number
): Promise<Meta> => {
  const { data, error } = await supabase
    .from('metas')
    .update({ valor_atual: valorAtual })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Remove uma meta
export const removerMeta = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('metas')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
