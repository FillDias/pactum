import { create } from 'zustand'
import { Cartao } from '../types'
import * as cartaoService from '../services/cartaoService'

type CartaoState = {
  cartoes: Cartao[]
  comprometidoFuturo: number
  carregando: boolean
  erro: string | null

  buscarCartoes: (escopo?: 'eu' | 'familia') => Promise<void>
  adicionarCartao: (cartao: Omit<Cartao, 'id' | 'user_id' | 'familia_id' | 'created_at'>) => Promise<void>
  editarCartao: (id: string, dados: Partial<Cartao>) => Promise<void>
  removerCartao: (id: string) => Promise<void>
  buscarComprometidoFuturo: (mes: number, ano: number, escopo?: 'eu' | 'familia') => Promise<void>
  limparErro: () => void
}

export const useCartaoStore = create<CartaoState>((set) => ({
  cartoes: [],
  comprometidoFuturo: 0,
  carregando: false,
  erro: null,

  buscarCartoes: async (escopo) => {
    set({ carregando: true, erro: null })
    try {
      const cartoes = await cartaoService.buscarCartoes(escopo)
      set({ cartoes, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  adicionarCartao: async (cartao) => {
    set({ carregando: true, erro: null })
    try {
      const novo = await cartaoService.adicionarCartao(cartao)
      set(state => ({
        cartoes: [novo, ...state.cartoes],
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  editarCartao: async (id, dados) => {
    set({ carregando: true, erro: null })
    try {
      const atualizado = await cartaoService.editarCartao(id, dados)
      set(state => ({
        cartoes: state.cartoes.map(c => c.id === id ? atualizado : c),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  removerCartao: async (id) => {
    set({ carregando: true, erro: null })
    try {
      await cartaoService.removerCartao(id)
      set(state => ({
        cartoes: state.cartoes.filter(c => c.id !== id),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  buscarComprometidoFuturo: async (mes, ano, escopo) => {
    try {
      const comprometidoFuturo = await cartaoService.buscarComprometidoFuturo(mes, ano, escopo)
      set({ comprometidoFuturo })
    } catch (error: any) {
      set({ erro: error.message })
    }
  },

  limparErro: () => set({ erro: null }),
}))
