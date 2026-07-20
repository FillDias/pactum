import { useCallback, useMemo, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFinancasStore } from '../store/financasStore'
import { useSaldoStore } from '../store/saldoStore'
import { usePortfolioStore } from '../store/portfolioStore'
import { useChatStore } from '../store/chatStore'
import { formatarMoeda } from '../utils/formatters'
import { colors } from '../constants/colors'
import type { Lancamento, Mensagem, Portfolio, PortfolioSummary } from '../types'

const DIAS_AVISO = 30

function diasParaVencer(maturityDate: string): number {
  const venc = new Date(maturityDate)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export type AlertaVencimento = {
  ticker: string
  nome: string
  dias: number
  portfolioNome: string
  marketValue: number
}

export interface DashboardViewModel {
  nomeUsuario: string | undefined
  temFamilia: boolean
  saldoValor: number
  saldoPositivo: boolean
  saldoColor: string
  totalReceitas: number
  totalGastos: number
  escopoHome: 'eu' | 'familia'
  setEscopoHome: (escopo: 'eu' | 'familia') => void
  totalInvestido: number
  totalPl: number
  patrimonioTotal: number
  portfolios: Portfolio[]
  summaries: Record<string, PortfolioSummary>
  alertasVencimento: AlertaVencimento[]
  atividadeRecente: Mensagem[]
  lancamentos: Lancamento[]
  mesSelecionado: number
  anoSelecionado: number
  setMesSelecionado: (mes: number, ano: number) => void
  carregarDados: () => void
  handleDeletar: (id: string) => Promise<void>
  formatarMoeda: typeof formatarMoeda
}

export function useDashboardViewModel(): DashboardViewModel {
  const { usuario, familia, atualizarFamilia } = useAuthStore()
  const {
    lancamentos, mesSelecionado, anoSelecionado, setMesSelecionado,
    buscarLancamentos, removerLancamento,
  } = useFinancasStore()
  const { saldo, buscarSaldo } = useSaldoStore()
  const { portfolios, summaries, buscarPortfolios, buscarPosicoes } = usePortfolioStore()
  const { mensagens, buscarMensagens } = useChatStore()

  const [escopoHome, setEscopoHomeLocal] = useState<'eu' | 'familia'>('familia')

  const carregarPortfolios = useCallback(async () => {
    await buscarPortfolios()
    const ids = usePortfolioStore.getState().portfolios.map(p => p.id)
    await Promise.all(ids.map(id => buscarPosicoes(id)))
  }, [buscarPortfolios, buscarPosicoes])

  const carregarDados = useCallback(() => {
    atualizarFamilia()
    buscarLancamentos()
    buscarSaldo(mesSelecionado, anoSelecionado, familia ? escopoHome : undefined)
    buscarMensagens()
    carregarPortfolios()
  }, [mesSelecionado, anoSelecionado, escopoHome, familia,
      atualizarFamilia, buscarLancamentos, buscarSaldo, buscarMensagens, carregarPortfolios])

  const setEscopoHome = useCallback((escopo: 'eu' | 'familia') => {
    setEscopoHomeLocal(escopo)
    buscarSaldo(mesSelecionado, anoSelecionado, escopo)
  }, [mesSelecionado, anoSelecionado, buscarSaldo])

  const handleDeletar = useCallback(async (id: string) => {
    await removerLancamento(id)
    buscarSaldo(mesSelecionado, anoSelecionado, familia ? escopoHome : undefined)
  }, [removerLancamento, buscarSaldo, mesSelecionado, anoSelecionado, familia, escopoHome])

  const saldoValor = saldo?.saldo ?? 0
  const saldoPositivo = saldoValor >= 0

  const totalInvestido = useMemo(
    () => Object.values(summaries).reduce((s, p) => s + p.totalMarketValue, 0),
    [summaries]
  )

  const totalPl = useMemo(
    () => Object.values(summaries).reduce((s, p) => s + p.totalPl, 0),
    [summaries]
  )

  const alertasVencimento = useMemo<AlertaVencimento[]>(() => {
    const alertas: AlertaVencimento[] = []
    portfolios.forEach(p => {
      const s = summaries[p.id]
      if (!s) return
      s.positions.forEach(pos => {
        if (!pos.maturityDate) return
        const dias = diasParaVencer(pos.maturityDate)
        if (dias >= 0 && dias <= DIAS_AVISO) {
          alertas.push({
            ticker: pos.ticker,
            nome: pos.name,
            dias,
            portfolioNome: p.name,
            marketValue: pos.marketValue,
          })
        }
      })
    })
    return alertas.sort((a, b) => a.dias - b.dias)
  }, [portfolios, summaries])

  const atividadeRecente = useMemo(
    () => mensagens.filter(m => m.tipo === 'sistema').slice(-4).reverse(),
    [mensagens]
  )

  return {
    nomeUsuario: usuario?.nome,
    temFamilia: !!familia,
    saldoValor,
    saldoPositivo,
    saldoColor: saldoPositivo ? colors.status.positive : colors.status.negative,
    totalReceitas: saldo?.total_receitas ?? 0,
    totalGastos: saldo?.total_gastos ?? 0,
    escopoHome,
    setEscopoHome,
    totalInvestido,
    totalPl,
    patrimonioTotal: saldoValor + totalInvestido,
    portfolios,
    summaries,
    alertasVencimento,
    atividadeRecente,
    lancamentos,
    mesSelecionado,
    anoSelecionado,
    setMesSelecionado,
    carregarDados,
    handleDeletar,
    formatarMoeda,
  }
}
