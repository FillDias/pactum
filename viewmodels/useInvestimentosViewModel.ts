import { useState, useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import { usePortfolioStore } from '../store/portfolioStore'
import { formatarMoeda } from '../utils/formatters'
import { colors } from '../constants/colors'
import type { Portfolio, PortfolioSummary } from '../types'

export interface InvestimentosViewModel {
  modalVisivel: boolean
  abrirModal: () => void
  fecharModal: () => void
  nome: string
  setNome: (v: string) => void
  descricao: string
  setDescricao: (v: string) => void
  moeda: string
  setMoeda: (v: string) => void
  portfolios: Portfolio[]
  summaries: Record<string, PortfolioSummary>
  totalPatrimonio: number
  totalPL: number
  carregando: boolean
  erro: string | null
  coreConectado: boolean
  buscarPortfolios: () => void
  handleCriar: () => Promise<void>
  handleDeletar: (id: string, nome: string) => void
  plColor: (v: number) => string
  formatarMoeda: typeof formatarMoeda
}

export function useInvestimentosViewModel(): InvestimentosViewModel {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [moeda, setMoeda] = useState('BRL')

  const { portfolios, summaries, carregando, erro, coreConectado, buscarPortfolios, criarPortfolio, deletarPortfolio, limparErro } =
    usePortfolioStore()

  const totalPatrimonio = useMemo(
    () => portfolios.reduce((acc, p) => acc + (summaries[p.id]?.totalMarketValue ?? 0), 0),
    [portfolios, summaries]
  )

  const totalPL = useMemo(
    () => portfolios.reduce((acc, p) => acc + (summaries[p.id]?.totalPl ?? 0), 0),
    [portfolios, summaries]
  )

  const abrirModal = useCallback(() => setModalVisivel(true), [])

  const fecharModal = useCallback(() => {
    setModalVisivel(false)
    setNome('')
    setDescricao('')
    setMoeda('BRL')
  }, [])

  const handleCriar = useCallback(async () => {
    if (!nome.trim()) {
      Alert.alert('Atencao', 'Informe um nome para a carteira')
      return
    }
    await criarPortfolio({ name: nome.trim(), description: descricao.trim() || undefined, currency: moeda })
    fecharModal()
  }, [nome, descricao, moeda, criarPortfolio, fecharModal])

  const handleDeletar = useCallback((id: string, portfolioNome: string) => {
    Alert.alert('Remover carteira', `Deseja remover "${portfolioNome}" e todas as suas transacoes?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => deletarPortfolio(id) },
    ])
  }, [deletarPortfolio])

  const plColor = useCallback(
    (v: number) => (v >= 0 ? colors.status.positive : colors.status.negative),
    []
  )

  return {
    modalVisivel, abrirModal, fecharModal,
    nome, setNome,
    descricao, setDescricao,
    moeda, setMoeda,
    portfolios, summaries,
    totalPatrimonio, totalPL,
    carregando, erro, coreConectado,
    buscarPortfolios,
    handleCriar, handleDeletar, plColor,
    formatarMoeda,
  }
}
