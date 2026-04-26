import { create } from 'zustand'
import { Investimento } from '../types'
import * as investimentoService from '../services/investimentoService'

type InvestimentoState = {
  investimentos: Investimento[]
  patrimonio_total: number
  rendimento_mensal: number
  carregando: boolean
  erro: string | null

  buscarInvestimentos: () => Promise<void>
  adicionarInvestimento: (
    payload: Omit<Investimento, 'id' | 'user_id' | 'rendimento_mensal_estimado' | 'created_at'>
  ) => Promise<void>
  editarInvestimento: (
    id: string,
    payload: Partial<Omit<Investimento, 'id' | 'user_id' | 'rendimento_mensal_estimado' | 'created_at'>>
  ) => Promise<void>
  removerInvestimento: (id: string) => Promise<void>
  limparErro: () => void
}

export const useInvestimentoStore = create<InvestimentoState>((set) => ({
  investimentos: [],
  patrimonio_total: 0,
  rendimento_mensal: 0,
  carregando: false,
  erro: null,

  buscarInvestimentos: async () => {
    set({ carregando: true, erro: null })
    try {
      const { investimentos, patrimonio_total, rendimento_mensal } =
        await investimentoService.buscarInvestimentos()
      set({ investimentos, patrimonio_total, rendimento_mensal, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  adicionarInvestimento: async (payload) => {
    set({ carregando: true, erro: null })
    try {
      const novo = await investimentoService.adicionarInvestimento(payload)
      set((s) => ({ investimentos: [...s.investimentos, novo], carregando: false }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  editarInvestimento: async (id, payload) => {
    set({ carregando: true, erro: null })
    try {
      const atualizado = await investimentoService.editarInvestimento(id, payload)
      set((s) => ({
        investimentos: s.investimentos.map((i) => (i.id === id ? atualizado : i)),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  removerInvestimento: async (id) => {
    set({ carregando: true, erro: null })
    try {
      await investimentoService.removerInvestimento(id)
      set((s) => ({
        investimentos: s.investimentos.filter((i) => i.id !== id),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  limparErro: () => set({ erro: null }),
}))
