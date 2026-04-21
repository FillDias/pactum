// Tipos globais do app Pactum
// Define todas as entidades usadas nas camadas de store, service e tela

export type Usuario = {
  id: string
  nome: string
  email: string
  casal_id: string | null
  avatar_url?: string
}

export type Casal = {
  id: string
  nome: string
  usuario1_id: string
  usuario2_id: string
  created_at: string
}

export type Lancamento = {
  id: string
  casal_id: string
  usuario_id: string
  descricao: string
  valor: number
  tipo: 'despesa' | 'receita'
  categoria: string
  vencimento: number  // dia do mês: 5, 20 ou 30
  mes: number
  ano: number
  recorrente: boolean
  created_at: string
}

export type Mensagem = {
  id: string
  casal_id: string
  usuario_id: string
  conteudo: string
  tipo: 'texto' | 'sistema'
  created_at: string
}

export type Meta = {
  id: string
  casal_id: string
  titulo: string
  valor_alvo: number
  valor_atual: number
  prazo: string
  created_at: string
}

export type Categoria = {
  id: string
  nome: string
  icone: string
  cor: string
}
