import { renderHook, act } from '@testing-library/react-native'
import { useCompraCartaoViewModel } from './useCompraCartaoViewModel'
import { useFinancasStore } from '../store/financasStore'
import { useSaldoStore } from '../store/saldoStore'
import { useCartaoStore } from '../store/cartaoStore'
import { useCompraCartaoStore } from '../store/compraCartaoStore'
import type { Lancamento, CompraCartao } from '../types'

jest.mock('../services/lancamentosService', () => ({
  buscarLancamentos: jest.fn(),
  adicionarLancamento: jest.fn(),
  editarLancamento: jest.fn(),
  removerLancamento: jest.fn(),
}))
jest.mock('../services/saldoService', () => ({ buscarSaldo: jest.fn() }))
jest.mock('../services/cartaoService', () => ({
  buscarCartoes: jest.fn(),
  adicionarCartao: jest.fn(),
  editarCartao: jest.fn(),
  removerCartao: jest.fn(),
  buscarComprometidoFuturo: jest.fn(),
}))
jest.mock('../services/compraCartaoService', () => ({
  buscarComprasCartao: jest.fn(),
  adicionarCompraCartao: jest.fn(),
  editarCompraCartao: jest.fn(),
  cancelarCompraCartao: jest.fn(),
}))

import * as lancamentosService from '../services/lancamentosService'
import * as saldoService from '../services/saldoService'
import * as cartaoService from '../services/cartaoService'
import * as compraCartaoService from '../services/compraCartaoService'

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
  compra_cartao_id: null,
  numero_parcela: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

const compra = (overrides: Partial<CompraCartao>): CompraCartao => ({
  id: overrides.id ?? 'c1',
  user_id: 'u1',
  familia_id: null,
  cartao_id: 'cartao-1',
  descricao: 'Notebook',
  valor_total: 900,
  numero_parcelas: 3,
  mes_referencia: 7,
  ano_referencia: 2026,
  cancelada_em: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  useFinancasStore.setState({
    lancamentos: [], erro: null, carregando: false,
    mesSelecionado: 7, anoSelecionado: 2026, escopo: 'eu',
  })
  useSaldoStore.setState({ saldo: null, erro: null, carregando: false })
  useCartaoStore.setState({ cartoes: [], comprometidoFuturo: 0, erro: null, carregando: false })
  useCompraCartaoStore.setState({ comprasCartao: [], erro: null, carregando: false })
})

it('agrupa o total do mes por cartao, cruzando Lancamento com CompraCartao via compra_cartao_id', async () => {
  useCompraCartaoStore.setState({
    comprasCartao: [
      compra({ id: 'c1', cartao_id: 'inter' }),
      compra({ id: 'c2', cartao_id: 'sicredi' }),
    ],
  })
  useFinancasStore.setState({
    lancamentos: [
      lancamento({ id: 'l1', categoria: 'Cartao', valor: 500, compra_cartao_id: 'c1', numero_parcela: 1 }),
      lancamento({ id: 'l2', categoria: 'Cartao', valor: 600, compra_cartao_id: 'c2', numero_parcela: 1 }),
      lancamento({ id: 'l3', categoria: 'Moradia', valor: 1200 }),
    ],
  })

  const { result } = await renderHook(() => useCompraCartaoViewModel())

  expect(result.current.totalPorCartao).toEqual({ inter: 500, sicredi: 600 })
  expect(result.current.totalGeralNoMes).toBe(1100)
})

it('ao salvar uma compra, recarrega lancamentos, saldo e comprometido futuro', async () => {
  const nova = compra({ id: 'c9', cartao_id: 'inter' })
  ;(compraCartaoService.adicionarCompraCartao as jest.Mock).mockResolvedValue(nova)
  ;(lancamentosService.buscarLancamentos as jest.Mock).mockResolvedValue([])
  ;(saldoService.buscarSaldo as jest.Mock).mockResolvedValue({ saldo: 0, total_receitas: 0, total_gastos: 0 })
  ;(cartaoService.buscarComprometidoFuturo as jest.Mock).mockResolvedValue(600)

  const { result } = await renderHook(() => useCompraCartaoViewModel())

  await act(() => {
    result.current.setCartaoId('inter')
    result.current.setDescricao('Notebook')
    result.current.setValor('900')
    result.current.setNumeroParcelas(3)
  })

  await act(async () => {
    await result.current.handleSalvar()
  })

  expect(compraCartaoService.adicionarCompraCartao).toHaveBeenCalledWith(
    expect.objectContaining({ cartao_id: 'inter', valor_total: 900, numero_parcelas: 3 })
  )
  expect(useCompraCartaoStore.getState().comprasCartao.some(c => c.id === 'c9')).toBe(true)
  expect(lancamentosService.buscarLancamentos).toHaveBeenCalled()
  expect(saldoService.buscarSaldo).toHaveBeenCalled()
  expect(cartaoService.buscarComprometidoFuturo).toHaveBeenCalled()
})

it('nao salva sem cartao, descricao ou valor', async () => {
  const { result } = await renderHook(() => useCompraCartaoViewModel())

  await act(async () => {
    await result.current.handleSalvar()
  })

  expect(compraCartaoService.adicionarCompraCartao).not.toHaveBeenCalled()
})
