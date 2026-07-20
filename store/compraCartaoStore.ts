import { create } from 'zustand'
import { CompraCartao } from '../types'
import * as compraCartaoService from '../services/compraCartaoService'

type CompraCartaoState = {
  comprasCartao: CompraCartao[]
  carregando: boolean
  erro: string | null

  buscarComprasCartao: (escopo?: 'eu' | 'familia') => Promise<void>
  adicionarCompraCartao: (
    compra: Omit<CompraCartao, 'id' | 'user_id' | 'familia_id' | 'cancelada_em' | 'created_at'>
  ) => Promise<void>
  editarCompraCartao: (
    id: string,
    dados: Partial<Pick<CompraCartao, 'descricao' | 'valor_total' | 'numero_parcelas'>>
  ) => Promise<void>
  cancelarCompraCartao: (id: string) => Promise<void>
  limparErro: () => void
}

export const useCompraCartaoStore = create<CompraCartaoState>((set) => ({
  comprasCartao: [],
  carregando: false,
  erro: null,

  buscarComprasCartao: async (escopo) => {
    set({ carregando: true, erro: null })
    try {
      const comprasCartao = await compraCartaoService.buscarComprasCartao(escopo)
      set({ comprasCartao, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  adicionarCompraCartao: async (compra) => {
    set({ carregando: true, erro: null })
    try {
      const nova = await compraCartaoService.adicionarCompraCartao(compra)
      set(state => ({
        comprasCartao: [nova, ...state.comprasCartao],
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  editarCompraCartao: async (id, dados) => {
    set({ carregando: true, erro: null })
    try {
      const atualizada = await compraCartaoService.editarCompraCartao(id, dados)
      set(state => ({
        comprasCartao: state.comprasCartao.map(c => c.id === id ? atualizada : c),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  cancelarCompraCartao: async (id) => {
    set({ carregando: true, erro: null })
    try {
      const cancelada = await compraCartaoService.cancelarCompraCartao(id)
      set(state => ({
        comprasCartao: state.comprasCartao.map(c => c.id === id ? cancelada : c),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  limparErro: () => set({ erro: null }),
}))
