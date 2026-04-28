import { create } from 'zustand'
import { buscarCDI } from '../services/brapiService'

type CotacaoState = {
  cdiAtual: number
  buscarCDI: () => Promise<void>
}

export const useCotacaoStore = create<CotacaoState>((set) => ({
  cdiAtual: 0,

  buscarCDI: async () => {
    try {
      const cdi = await buscarCDI()
      if (cdi !== null) set({ cdiAtual: cdi })
    } catch {
      /* silent */
    }
  },
}))
