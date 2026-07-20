// Categorias de lançamentos disponíveis no Pactum
// Cada categoria tem ícone emoji e cor para exibição visual

export const CATEGORIAS = [
  { id: '1', nome: 'Transporte', icone: '🚗', cor: '#F59E0B' },
  { id: '2', nome: 'Alimentação', icone: '🍔', cor: '#10B981' },
  { id: '3', nome: 'Moradia', icone: '🏠', cor: '#3B82F6' },
  { id: '4', nome: 'Saúde', icone: '💊', cor: '#EF4444' },
  { id: '5', nome: 'Educação', icone: '📚', cor: '#8B5CF6' },
  { id: '6', nome: 'Lazer', icone: '🎮', cor: '#EC4899' },
  { id: '7', nome: 'Investimento', icone: '📈', cor: '#06B6D4' },
  { id: '8', nome: 'Cartao', icone: '💳', cor: '#E67E22' },
  { id: '9', nome: 'Outros', icone: '📦', cor: '#6B7280' },
]

export const CATEGORIAS_RECEITA = [
  { id: 'r1', nome: 'Salario',      icone: '💼', cor: '#10B981' },
  { id: 'r2', nome: 'Freela',       icone: '💻', cor: '#3B82F6' },
  { id: 'r3', nome: 'Bonus',        icone: '🎁', cor: '#F59E0B' },
  { id: 'r4', nome: 'Investimento', icone: '📈', cor: '#06B6D4' },
  { id: 'r5', nome: 'Outros',       icone: '💰', cor: '#6B7280' },
]

// Dias de vencimento disponíveis para lançamentos recorrentes
export const VENCIMENTOS = [5, 20, 30]

// Operadoras de cartão de crédito pré-definidas. "Outra" libera um campo de texto livre.
export const OPERADORAS_CARTAO = [
  'Inter', 'Sicredi', 'Sicoob', 'Itaú', 'Santander', '99Pay', 'BTG', 'RecargaPay',
]
export const OPERADORA_OUTRA = 'Outra'

// Quantidade de parcelas permitida para uma compra no cartão (1x até 48x)
export const PARCELAS_CARTAO = Array.from({ length: 48 }, (_, i) => i + 1)
