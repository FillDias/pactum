import { renderHook, act } from '@testing-library/react-native'
import { useReceitasViewModel } from './useReceitasViewModel'
import { useFinancasStore } from '../store/financasStore'
import { useSaldoStore } from '../store/saldoStore'
import type { Lancamento } from '../types'

jest.mock('../services/lancamentosService', () => ({
  buscarLancamentos: jest.fn(),
  adicionarLancamento: jest.fn(),
  editarLancamento: jest.fn(),
  removerLancamento: jest.fn(),
}))
jest.mock('../services/saldoService', () => ({
  buscarSaldo: jest.fn(),
}))

import * as lancamentosService from '../services/lancamentosService'
import * as saldoService from '../services/saldoService'

const lancamento = (overrides: Partial<Lancamento>): Lancamento => ({
  id: overrides.id ?? '1',
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

beforeEach(() => {
  jest.clearAllMocks()
  useFinancasStore.setState({
    lancamentos: [],
    erro: null,
    carregando: false,
    mesSelecionado: 7,
    anoSelecionado: 2026,
    escopo: 'eu',
  })
  useSaldoStore.setState({ saldo: null, erro: null, carregando: false })
})

it('receitas e totalReceitas refletem lancamentos tipo=receita ja existentes, mesmo os criados pela tela de Lancamento', async () => {
  useFinancasStore.setState({
    lancamentos: [
      lancamento({ id: '1', tipo: 'receita', valor: 3000, categoria: 'Salario' }),
      lancamento({ id: '2', tipo: 'despesa', valor: 1200, categoria: 'Moradia' }),
    ],
  })

  const { result } = await renderHook(() => useReceitasViewModel())

  expect(result.current.receitas).toHaveLength(1)
  expect(result.current.receitas[0].id).toBe('1')
  expect(result.current.totalReceitas).toBe(3000)
})

it('ao salvar uma receita, ela entra no financasStore compartilhado e o saldo e recarregado', async () => {
  const novaReceita = lancamento({ id: '9', tipo: 'receita', valor: 5000, categoria: 'Salario', recorrente: true })
  ;(lancamentosService.adicionarLancamento as jest.Mock).mockResolvedValue(novaReceita)
  ;(saldoService.buscarSaldo as jest.Mock).mockResolvedValue({
    saldo: 5000, total_receitas: 5000, total_gastos: 0,
  })

  const { result } = await renderHook(() => useReceitasViewModel())

  await act(() => {
    result.current.setDescricao('Salario')
    result.current.setValor('5000')
  })

  await act(async () => {
    await result.current.handleSalvar()
  })

  expect(lancamentosService.adicionarLancamento).toHaveBeenCalledWith(
    expect.objectContaining({ tipo: 'receita', valor: 5000, categoria: 'Salario' })
  )
  expect(useFinancasStore.getState().lancamentos.some(l => l.id === '9')).toBe(true)
  expect(saldoService.buscarSaldo).toHaveBeenCalledWith(7, 2026, 'eu')
  expect(useSaldoStore.getState().saldo?.saldo).toBe(5000)
})

it('nao salva nem recarrega o saldo quando descricao ou valor estao vazios', async () => {
  const { result } = await renderHook(() => useReceitasViewModel())

  await act(async () => {
    await result.current.handleSalvar()
  })

  expect(lancamentosService.adicionarLancamento).not.toHaveBeenCalled()
  expect(saldoService.buscarSaldo).not.toHaveBeenCalled()
})
