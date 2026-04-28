export type Usuario = {
  id: string
  nome: string
  email: string
  familia_id: string | null
  avatar_url?: string
}

export type FamiliaMembro = {
  id: string
  familia_id: string
  user_id: string
  papel: 'dono' | 'membro'
  usuario?: Usuario
}

export type Familia = {
  id: string
  nome: string
  criador_id: string
  membros: FamiliaMembro[]
  created_at: string
}

export type Lancamento = {
  id: string
  user_id: string
  familia_id: string | null
  descricao: string
  valor: number
  tipo: 'despesa' | 'receita'
  categoria: string
  vencimento: number
  mes: number
  ano: number
  recorrente: boolean
  created_at: string
}

export type Mensagem = {
  id: string
  user_id: string
  familia_id: string | null
  conteudo: string
  tipo: 'texto' | 'sistema'
  created_at: string
}

export type Receita = {
  id: string
  user_id: string
  familia_id: string | null
  descricao: string
  valor: number
  tipo: 'salario' | 'freela' | 'bonus' | 'investimento' | 'outro'
  recorrente: boolean
  mes: number
  ano: number
  created_at: string
}

export type Investimento = {
  id: string
  user_id: string
  nome: string
  tipo: string
  valor_investido: number
  quantidade: number | null
  rentabilidade_tipo: 'cdi' | 'selic' | 'prefixado' | 'variavel' | null
  rentabilidade_percentual: number | null
  data_inicio: string
  vencimento: string | null
  rendimento_mensal_estimado: number
  created_at: string
}

export type Saldo = {
  saldo: number
  total_receitas: number
  total_gastos: number
  positivo?: boolean
  mes?: number
  ano?: number
}

export type Meta = {
  id: string
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

export type Cotacao = {
  symbol: string
  shortName: string
  preco: number
  variacao: number
  variacaoPercent: number
}

export type InvestimentoComCotacao = Investimento & {
  cotacao?: Cotacao
  rendimentoReal?: number
}

// --- Pactum Core ---

export type Portfolio = {
  id: string
  name: string
  description: string | null
  currency: string
  created_at: string
  updated_at: string
}

export type PortfolioTransaction = {
  id: string
  security_id: string
  ticker: string
  transaction_type: 'BUY' | 'SELL'
  quantity: number
  price: number
  date: string
  broker: string | null
  created_at: string
}

export type Position = {
  ticker: string
  name: string
  securityType: string
  quantity: number
  averagePrice: number
  currentPrice: number
  costBasis: number
  marketValue: number
  pl: number
  plPercent: number
  priceSource: 'brapi' | 'last_transaction'
  maturityDate?: string | null
  annualRate?: number | null
  indexType?: string | null
}

export type PortfolioSummary = {
  portfolioId: string
  portfolioName: string
  currency: string
  totalCost: number
  totalMarketValue: number
  totalPl: number
  totalPlPercent: number
  positions: Position[]
}

export type Security = {
  id: string
  ticker: string
  name: string
  security_type: string
  annual_rate: number | null
  index_type: string | null
  maturity_date: string | null
  currency: string | null
}
