import { calcularSaldo, filtrarPorTipo, somarValores } from './calculators'
import { Lancamento } from '../types'

const lancamento = (overrides: Partial<Lancamento>): Lancamento => ({
  id: overrides.id ?? Math.random().toString(),
  user_id: 'u1',
  familia_id: null,
  descricao: 'teste',
  valor: 0,
  tipo: 'despesa',
  categoria: 'Outros',
  vencimento: 5,
  mes: 7,
  ano: 2026,
  recorrente: false,
  created_at: new Date().toISOString(),
  ...overrides,
})

describe('filtrarPorTipo', () => {
  it('retorna apenas lancamentos do tipo receita', () => {
    const lancamentos = [
      lancamento({ tipo: 'receita', valor: 3000, categoria: 'Salario' }),
      lancamento({ tipo: 'despesa', valor: 200, categoria: 'Transporte' }),
      lancamento({ tipo: 'receita', valor: 500, categoria: 'Freela' }),
    ]

    const receitas = filtrarPorTipo(lancamentos, 'receita')

    expect(receitas).toHaveLength(2)
    expect(receitas.every(l => l.tipo === 'receita')).toBe(true)
  })

  it('retorna array vazio quando nao ha lancamentos do tipo pedido', () => {
    const lancamentos = [lancamento({ tipo: 'despesa' })]

    expect(filtrarPorTipo(lancamentos, 'receita')).toEqual([])
  })
})

describe('somarValores', () => {
  it('soma o valor de uma lista de lancamentos', () => {
    const lancamentos = [
      lancamento({ valor: 3000 }),
      lancamento({ valor: 500 }),
      lancamento({ valor: 250.5 }),
    ]

    expect(somarValores(lancamentos)).toBe(3750.5)
  })

  it('retorna 0 para lista vazia', () => {
    expect(somarValores([])).toBe(0)
  })
})

describe('calcularSaldo com receitas vindas de qualquer fluxo de lancamento', () => {
  it('soma receitas e subtrai despesas independente da origem/categoria', () => {
    const lancamentos = [
      lancamento({ tipo: 'receita', valor: 3000, categoria: 'Salario' }),
      lancamento({ tipo: 'receita', valor: 800, categoria: 'Freela' }),
      lancamento({ tipo: 'despesa', valor: 1200, categoria: 'Moradia' }),
    ]

    expect(calcularSaldo(lancamentos)).toBe(2600)
  })

  it('inclui uma receita lancada com a mesma forma usada para despesas (unificacao Lancamento/Receita)', () => {
    const lancamentos = [
      lancamento({ tipo: 'despesa', valor: 100 }),
      lancamento({ tipo: 'receita', valor: 5000, categoria: 'Salario' }),
    ]

    expect(calcularSaldo(lancamentos)).toBe(4900)
  })
})
