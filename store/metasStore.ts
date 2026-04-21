// Store de metas — gerencia metas financeiras do casal
import { create } from 'zustand'
import { Meta } from '../types'
import * as metasService from '../services/metasService'
import { calcularProgressoMeta } from '../utils/calculators'

type MetasState = {
  metas: Meta[]
  carregando: boolean
  erro: string | null

  progressoDaMeta: (meta: Meta) => number
  buscarMetas: (casalId: string) => Promise<void>
  adicionarMeta: (meta: Omit<Meta, 'id' | 'created_at'>) => Promise<void>
  atualizarProgressoMeta: (id: string, valorAtual: number) => Promise<void>
  removerMeta: (id: string) => Promise<void>
  limparErro: () => void
}

export const useMetasStore = create<MetasState>((set, get) => ({
  metas: [],
  carregando: false,
  erro: null,

  progressoDaMeta: (meta) =>
    calcularProgressoMeta(meta.valor_atual, meta.valor_alvo),

  buscarMetas: async (casalId) => {
    set({ carregando: true, erro: null })
    try {
      const metas = await metasService.buscarMetas(casalId)
      set({ metas, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  adicionarMeta: async (meta) => {
    set({ carregando: true, erro: null })
    try {
      const nova = await metasService.adicionarMeta(meta)
      set(state => ({
        metas: [...state.metas, nova],
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  atualizarProgressoMeta: async (id, valorAtual) => {
    set({ carregando: true, erro: null })
    try {
      const atualizada = await metasService.atualizarProgressoMeta(id, valorAtual)
      set(state => ({
        metas: state.metas.map(m => m.id === id ? atualizada : m),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  removerMeta: async (id) => {
    set({ carregando: true, erro: null })
    try {
      await metasService.removerMeta(id)
      set(state => ({
        metas: state.metas.filter(m => m.id !== id),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  limparErro: () => set({ erro: null }),
}))
