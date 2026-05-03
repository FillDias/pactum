import { create } from 'zustand'
import { Portfolio, PortfolioSummary } from '../types'
import * as portfolioService from '../services/portfolioService'

type PortfolioState = {
  portfolios: Portfolio[]
  summaries: Record<string, PortfolioSummary>
  carregando: boolean
  carregandoPosicoes: boolean
  erro: string | null
  coreConectado: boolean

  conectarCore: (email: string, senha: string) => Promise<void>
  buscarPortfolios: () => Promise<void>
  criarPortfolio: (data: { name: string; description?: string; currency?: string }) => Promise<void>
  deletarPortfolio: (id: string) => Promise<void>
  buscarPosicoes: (portfolioId: string) => Promise<void>
  limparErro: () => void
}

export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  portfolios: [],
  summaries: {},
  carregando: false,
  carregandoPosicoes: false,
  erro: null,
  coreConectado: false,

  conectarCore: async (email, senha) => {
    try {
      await portfolioService.loginCoreApi(email, senha)
      set({ coreConectado: true, erro: null })
    } catch (err: any) {
      set({ erro: err.message, coreConectado: false })
    }
  },

  buscarPortfolios: async () => {
    set({ carregando: true, erro: null })
    try {
      const portfolios = await portfolioService.listarPortfolios()
      set({ portfolios, carregando: false, coreConectado: true })
    } catch (err: any) {
      set({ carregando: false, erro: err.message, coreConectado: false })
    }
  },

  criarPortfolio: async (data) => {
    set({ carregando: true, erro: null })
    try {
      const novo = await portfolioService.criarPortfolio(data)
      set(s => ({ portfolios: [...s.portfolios, novo], carregando: false }))
    } catch (err: any) {
      set({ carregando: false, erro: err.message })
    }
  },

  deletarPortfolio: async (id) => {
    try {
      await portfolioService.deletarPortfolio(id)
      set(s => ({
        portfolios: s.portfolios.filter(p => p.id !== id),
        summaries: Object.fromEntries(
          Object.entries(s.summaries).filter(([k]) => k !== id)
        ),
      }))
    } catch (err: any) {
      set({ erro: err.message })
    }
  },

  buscarPosicoes: async (portfolioId) => {
    set({ carregandoPosicoes: true, erro: null })
    try {
      const summary = await portfolioService.buscarPosicoes(portfolioId)
      set(s => ({
        summaries: { ...s.summaries, [portfolioId]: summary },
        carregandoPosicoes: false,
      }))
    } catch (err: any) {
      set({ carregandoPosicoes: false, erro: err.message })
    }
  },

  limparErro: () => set({ erro: null }),
}))
