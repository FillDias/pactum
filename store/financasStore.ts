// Store de finanças — gerencia lançamentos e saldo do casal
import { create } from 'zustand'
import { Lancamento } from '../types'
import * as lancamentosService from '../services/lancamentosService'
import { calcularSaldo, filtrarPorUsuario } from '../utils/calculators'
import { getMesAtual, getAnoAtual } from '../utils/formatters'

type FinancasState = {
  lancamentos: Lancamento[]
  carregando: boolean
  erro: string | null
  mesSelecionado: number
  anoSelecionado: number

  saldoFamiliar: () => number
  saldoPorUsuario: (usuarioId: string) => number
  lancamentosPorUsuario: (usuarioId: string) => Lancamento[]

  buscarLancamentos: (casalId: string) => Promise<void>
  adicionarLancamento: (lancamento: Omit<Lancamento, 'id' | 'created_at'>) => Promise<void>
  editarLancamento: (id: string, dados: Partial<Lancamento>) => Promise<void>
  removerLancamento: (id: string) => Promise<void>
  setMesSelecionado: (mes: number, ano: number) => void
  limparErro: () => void
}

export const useFinancasStore = create<FinancasState>((set, get) => ({
  lancamentos: [],
  carregando: false,
  erro: null,
  mesSelecionado: getMesAtual(),
  anoSelecionado: getAnoAtual(),

  saldoFamiliar: () => calcularSaldo(get().lancamentos),

  saldoPorUsuario: (usuarioId) =>
    calcularSaldo(filtrarPorUsuario(get().lancamentos, usuarioId)),

  lancamentosPorUsuario: (usuarioId) =>
    filtrarPorUsuario(get().lancamentos, usuarioId),

  buscarLancamentos: async (casalId) => {
    set({ carregando: true, erro: null })
    try {
      const { mesSelecionado, anoSelecionado } = get()
      const lancamentos = await lancamentosService.buscarLancamentos(
        casalId,
        mesSelecionado,
        anoSelecionado
      )
      set({ lancamentos, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  adicionarLancamento: async (lancamento) => {
    set({ carregando: true, erro: null })
    try {
      const novo = await lancamentosService.adicionarLancamento(lancamento)
      set(state => ({
        lancamentos: [novo, ...state.lancamentos],
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  editarLancamento: async (id, dados) => {
    set({ carregando: true, erro: null })
    try {
      const atualizado = await lancamentosService.editarLancamento(id, dados)
      set(state => ({
        lancamentos: state.lancamentos.map(l => l.id === id ? atualizado : l),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  removerLancamento: async (id) => {
    set({ carregando: true, erro: null })
    try {
      await lancamentosService.removerLancamento(id)
      set(state => ({
        lancamentos: state.lancamentos.filter(l => l.id !== id),
        carregando: false,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  setMesSelecionado: (mes, ano) => set({ mesSelecionado: mes, anoSelecionado: ano }),

  limparErro: () => set({ erro: null }),
}))
