import { create } from 'zustand'
import { Saldo } from '../types'
import * as saldoService from '../services/saldoService'

type SaldoState = {
  saldo: Saldo | null
  carregando: boolean
  erro: string | null

  buscarSaldo: (mes: number, ano: number) => Promise<void>
  limparErro: () => void
}

export const useSaldoStore = create<SaldoState>((set) => ({
  saldo: null,
  carregando: false,
  erro: null,

  buscarSaldo: async (mes, ano) => {
    set({ carregando: true, erro: null })
    try {
      const saldo = await saldoService.buscarSaldo(mes, ano)
      set({ saldo, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  limparErro: () => set({ erro: null }),
}))
