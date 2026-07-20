import { renderHook, act } from '@testing-library/react-native'
import { useCartoesViewModel } from './useCartoesViewModel'
import { useCartaoStore } from '../store/cartaoStore'
import { OPERADORA_OUTRA } from '../constants/categories'
import type { Cartao } from '../types'

jest.mock('../services/cartaoService', () => ({
  buscarCartoes: jest.fn(),
  adicionarCartao: jest.fn(),
  editarCartao: jest.fn(),
  removerCartao: jest.fn(),
  buscarComprometidoFuturo: jest.fn(),
}))

import * as cartaoService from '../services/cartaoService'

const cartao = (overrides: Partial<Cartao>): Cartao => ({
  id: '1',
  user_id: 'u1',
  familia_id: null,
  apelido: null,
  operadora: 'Inter',
  limite: null,
  created_at: new Date().toISOString(),
  ...overrides,
})

beforeEach(() => {
  jest.clearAllMocks()
  useCartaoStore.setState({ cartoes: [], comprometidoFuturo: 0, erro: null, carregando: false })
})

it('salva um cartao com operadora da lista pre-definida', async () => {
  const novo = cartao({ id: '9', operadora: 'Nubank' })
  ;(cartaoService.adicionarCartao as jest.Mock).mockResolvedValue(novo)

  const { result } = await renderHook(() => useCartoesViewModel())

  await act(() => {
    result.current.setOperadoraSelecionada('Nubank')
  })
  await act(async () => {
    await result.current.handleSalvar()
  })

  expect(cartaoService.adicionarCartao).toHaveBeenCalledWith(
    expect.objectContaining({ operadora: 'Nubank' })
  )
  expect(useCartaoStore.getState().cartoes.some(c => c.id === '9')).toBe(true)
})

it('ao selecionar Outra, usa o texto customizado como operadora', async () => {
  const novo = cartao({ id: '9', operadora: 'Cartao da Padaria' })
  ;(cartaoService.adicionarCartao as jest.Mock).mockResolvedValue(novo)

  const { result } = await renderHook(() => useCartoesViewModel())

  await act(() => {
    result.current.setOperadoraSelecionada(OPERADORA_OUTRA)
    result.current.setOperadoraCustomizada('Cartao da Padaria')
  })
  await act(async () => {
    await result.current.handleSalvar()
  })

  expect(cartaoService.adicionarCartao).toHaveBeenCalledWith(
    expect.objectContaining({ operadora: 'Cartao da Padaria' })
  )
})

it('nao salva sem operadora definida', async () => {
  const { result } = await renderHook(() => useCartoesViewModel())

  await act(async () => {
    await result.current.handleSalvar()
  })

  expect(cartaoService.adicionarCartao).not.toHaveBeenCalled()
})
