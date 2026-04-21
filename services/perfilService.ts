// Serviço de perfil — leitura e atualização de dados do usuário via Supabase
import { supabase } from '../config/supabase'
import { Usuario } from '../types'

// Busca perfil por ID
export const buscarPerfilPorId = async (id: string): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

// Atualiza dados do perfil do usuário
export const atualizarPerfil = async (
  id: string,
  dados: Partial<Usuario>
): Promise<Usuario> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(dados)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
