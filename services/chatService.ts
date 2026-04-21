// Serviço de chat — mensagens em tempo real via Supabase Realtime
import { supabase } from '../config/supabase'
import { Mensagem } from '../types'

// Busca mensagens do casal ordenadas cronologicamente
export const buscarMensagens = async (
  casalId: string
): Promise<Mensagem[]> => {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .eq('casal_id', casalId)
    .order('created_at', { ascending: true })
    .limit(100)

  if (error) throw new Error(error.message)
  return data
}

// Envia nova mensagem de texto
export const enviarMensagem = async (
  casalId: string,
  usuarioId: string,
  conteudo: string
): Promise<Mensagem> => {
  const { data, error } = await supabase
    .from('mensagens')
    .insert({
      casal_id: casalId,
      usuario_id: usuarioId,
      conteudo,
      tipo: 'texto',
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Assina mensagens em tempo real — retorna o canal para ser cancelado no unmount
export const assinarMensagens = (
  casalId: string,
  onNovaMensagem: (mensagem: Mensagem) => void
) => {
  return supabase
    .channel(`mensagens:${casalId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'mensagens',
        filter: `casal_id=eq.${casalId}`,
      },
      (payload) => onNovaMensagem(payload.new as Mensagem)
    )
    .subscribe()
}
