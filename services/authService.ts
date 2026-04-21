// Serviço de autenticação — login, logout, registro e vínculo de casal via Supabase
import { supabase } from '../config/supabase'
import { Usuario, Casal } from '../types'

// Realiza login com email e senha
export const login = async (
  email: string,
  senha: string
): Promise<Usuario> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  })
  if (error) throw new Error(error.message)

  const { data: perfil, error: perfilError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  if (perfilError) throw new Error(perfilError.message)
  return perfil
}

// Cria novo usuário e perfil
export const register = async (
  nome: string,
  email: string,
  senha: string
): Promise<Usuario> => {
  const emailNormalizado = email.trim().toLowerCase()

  const { data, error } = await supabase.auth.signUp({
    email: emailNormalizado,
    password: senha,
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Erro ao criar usuário')

  const { data: perfil, error: perfilError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      nome,
      email: emailNormalizado,
    })
    .select()
    .single()

  if (perfilError) throw new Error(perfilError.message)
  return perfil
}

// Realiza logout
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

// Busca perfil e casal do usuário logado
export const buscarPerfil = async (): Promise<{
  usuario: Usuario
  casal: Casal | null
}> => {
  const { data: session } = await supabase.auth.getSession()
  if (!session.session) throw new Error('Usuário não autenticado')

  const { data: usuario, error: userError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.session.user.id)
    .single()

  if (userError) throw new Error(userError.message)

  // PGRST116 (0 rows) significa casal ainda não vinculado — não é erro
  const { data: casal } = await supabase
    .from('casais')
    .select('*')
    .or(`usuario1_id.eq.${usuario.id},usuario2_id.eq.${usuario.id}`)
    .single()

  return { usuario, casal: casal || null }
}

// Vincula dois usuários como casal
export const vincularConjuge = async (
  emailConjuge: string
): Promise<Casal> => {
  const { data: session } = await supabase.auth.getSession()
  console.log('[VINCULAR] userId logado:', session.session?.user.id)
  console.log('[VINCULAR] email buscado:', emailConjuge)
  if (!session.session) throw new Error('Usuário não autenticado')

  // ilike para busca case-insensitive (evita falha por capitalização do email)
  const { data: conjuge, error: conjugeError } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', emailConjuge.trim())
    .single()

  console.log('[VINCULAR] cônjuge encontrado:', JSON.stringify(conjuge))
  console.log('[VINCULAR] erro busca cônjuge:', JSON.stringify(conjugeError))

  if (conjugeError) throw new Error('Cônjuge não encontrado')

  // Cria o casal
  const { data: casal, error: casalError } = await supabase
    .from('casais')
    .insert({
      usuario1_id: session.session.user.id,
      usuario2_id: conjuge.id,
    })
    .select()
    .single()

  console.log('[VINCULAR] casal criado:', JSON.stringify(casal))
  console.log('[VINCULAR] erro criar casal:', JSON.stringify(casalError))

  if (casalError) throw new Error(casalError.message)

  // Atualiza casal_id nos dois perfis
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ casal_id: casal.id })
    .in('id', [session.session.user.id, conjuge.id])

  console.log('[VINCULAR] erro update profiles:', JSON.stringify(updateError))

  return casal
}
