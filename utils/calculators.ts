// Funções utilitárias de cálculo financeiro do app
import { Lancamento } from '../types'

// Calcula saldo do mês: soma receitas e subtrai despesas
export const calcularSaldo = (lancamentos: Lancamento[]): number => {
  return lancamentos.reduce((acc, l) => {
    return l.tipo === 'receita' ? acc + l.valor : acc - l.valor
  }, 0)
}

// Filtra lançamentos de um único usuário dentro de uma lista do casal
export const filtrarPorUsuario = (
  lancamentos: Lancamento[],
  usuarioId: string
): Lancamento[] => {
  return lancamentos.filter(l => l.usuario_id === usuarioId)
}

// Calcula o progresso de uma meta em porcentagem (0–100)
export const calcularProgressoMeta = (
  valorAtual: number,
  valorAlvo: number
): number => {
  if (valorAlvo === 0) return 0
  return Math.min((valorAtual / valorAlvo) * 100, 100)
}
