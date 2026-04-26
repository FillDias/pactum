import { create } from 'zustand'
import { Receita } from '../types'
import * as receitaService from '../services/receitaService'

type ReceitaState = {
  receitas: Receita[]
  carregando: boolean
  erro: string | null

  buscarReceitas: (mes: number, ano: number) => Promise<void>
  adicionarReceita: (
    payload: Omit<Receita, 'id' | 'user_id' | 'familia_id' | 'created_at'>
  ) => Promise<void>
  editarReceita: (
    id: string,
    payload: Partial<Omit<Receita, 'id' | 'user_id' | 'familia_id' | 'created_at'>>
  ) => Promise<void>
  removerReceita: (id: string) => Promise<void>
  limparErro: () => void
}

export const useReceitaStore = create<ReceitaState>((set) => ({
  receitas: [],
  carregando: false,
  erro: null,

  buscarReceitas: async (mes, ano) => {
    set({ carregando: true, erro: null })
    try {
      const receitas = await receitaService.buscarReceitas(mes, ano)
      set({ receitas, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  adicionarReceita: async (payload) => {
    set({ carregando: true, erro: null })
    try {
      const nova = await receitaService.adicionarReceita(payload)
      set((s) => ({ receitas: [...s.receitas, nova], carregando: false }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  editarReceita: async (id, payload) => {
    set({ carregando: true, erro: null })
    try {
      const atualizada = await receitaService.editarReceita(id, payload)
      set((s) => ({
        receitas: s.receitas.map((r) => (r.id === id ? atualizada : r)),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  removerReceita: async (id) => {
    set({ carregando: true, erro: null })
    try {
      await receitaService.removerReceita(id)
      set((s) => ({
        receitas: s.receitas.filter((r) => r.id !== id),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  limparErro: () => set({ erro: null }),
}))
