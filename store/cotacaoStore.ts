import { create } from 'zustand'
import { Cotacao } from '../types'
import * as brapiService from '../services/brapiService'

type CotacaoState = {
  cotacoes: Record<string, Cotacao>
  cdiAtual: number
  carregando: boolean
  erro: string | null
  buscarCotacoes: (tickers: string[]) => Promise<void>
  buscarCDI: () => Promise<void>
}

export const useCotacaoStore = create<CotacaoState>((set) => ({
  cotacoes: {},
  cdiAtual: 0,
  carregando: false,
  erro: null,

  buscarCotacoes: async (tickers) => {
    if (tickers.length === 0) return
    set({ carregando: true, erro: null })
    try {
      const resultado = await brapiService.buscarCotacao(tickers)
      if (!resultado) {
        set({ carregando: false })
        return
      }
      const map: Record<string, Cotacao> = {}
      for (const c of resultado) {
        map[c.symbol] = c
      }
      set({ cotacoes: map, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  buscarCDI: async () => {
    try {
      const cdi = await brapiService.buscarCDI()
      if (cdi !== null) set({ cdiAtual: cdi })
    } catch {
      // silent
    }
  },
}))
