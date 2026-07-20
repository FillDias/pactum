import { useState, useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import { useFinancasStore } from '../store/financasStore'
import { useSaldoStore } from '../store/saldoStore'
import { useCartaoStore } from '../store/cartaoStore'
import { useCompraCartaoStore } from '../store/compraCartaoStore'
import { somarValores } from '../utils/calculators'
import { formatarMoeda } from '../utils/formatters'
import type { Cartao, CompraCartao } from '../types'

export interface CompraCartaoViewModel {
  modalVisivel: boolean
  abrirModal: (cartaoIdInicial?: string) => void
  fecharModal: () => void
  cartaoId: string
  setCartaoId: (v: string) => void
  descricao: string
  setDescricao: (v: string) => void
  valor: string
  setValor: (v: string) => void
  numeroParcelas: number
  setNumeroParcelas: (v: number) => void
  mesReferencia: number
  setMesReferencia: (v: number) => void
  anoReferencia: number
  setAnoReferencia: (v: number) => void
  cartoes: Cartao[]
  comprasCartao: CompraCartao[]
  totalPorCartao: Record<string, number>
  totalGeralNoMes: number
  comprometidoFuturo: number
  carregando: boolean
  mesSelecionado: number
  anoSelecionado: number
  buscarDados: () => void
  handleSalvar: () => Promise<void>
  handleCancelar: (id: string) => void
  handleExcluir: (id: string) => void
  formatarMoeda: typeof formatarMoeda
}

export function useCompraCartaoViewModel(): CompraCartaoViewModel {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [cartaoId, setCartaoId] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [numeroParcelas, setNumeroParcelas] = useState(1)

  const { lancamentos, mesSelecionado, anoSelecionado, escopo, buscarLancamentos } = useFinancasStore()
  const [mesReferencia, setMesReferencia] = useState(mesSelecionado)
  const [anoReferencia, setAnoReferencia] = useState(anoSelecionado)
  const { buscarSaldo } = useSaldoStore()
  const { cartoes, comprometidoFuturo, buscarCartoes, buscarComprometidoFuturo } = useCartaoStore()
  const { comprasCartao, carregando, buscarComprasCartao, adicionarCompraCartao, cancelarCompraCartao, excluirCompraCartao } = useCompraCartaoStore()

  const parcelasDoMes = useMemo(
    () => lancamentos.filter(l => l.tipo === 'despesa' && l.categoria === 'Cartao'),
    [lancamentos]
  )

  const totalPorCartao = useMemo(() => {
    const totais: Record<string, number> = {}
    parcelasDoMes.forEach(l => {
      const compra = comprasCartao.find(c => c.id === l.compra_cartao_id)
      if (!compra) return
      totais[compra.cartao_id] = (totais[compra.cartao_id] ?? 0) + l.valor
    })
    return totais
  }, [parcelasDoMes, comprasCartao])

  const totalGeralNoMes = useMemo(() => somarValores(parcelasDoMes), [parcelasDoMes])

  const resetForm = () => {
    setCartaoId('')
    setDescricao('')
    setValor('')
    setNumeroParcelas(1)
    setMesReferencia(mesSelecionado)
    setAnoReferencia(anoSelecionado)
  }

  const abrirModal = useCallback((cartaoIdInicial?: string) => {
    if (cartaoIdInicial) setCartaoId(cartaoIdInicial)
    setModalVisivel(true)
  }, [])

  const fecharModal = useCallback(() => {
    setModalVisivel(false)
    resetForm()
  }, [mesSelecionado, anoSelecionado])

  const buscarDados = useCallback(() => {
    buscarCartoes()
    buscarComprasCartao()
    buscarComprometidoFuturo(mesSelecionado, anoSelecionado, escopo)
  }, [buscarCartoes, buscarComprasCartao, buscarComprometidoFuturo, mesSelecionado, anoSelecionado, escopo])

  const handleSalvar = useCallback(async () => {
    if (!cartaoId || !descricao || !valor) {
      Alert.alert('Atencao', 'Selecione o cartao e preencha descricao e valor')
      return
    }

    await adicionarCompraCartao({
      cartao_id: cartaoId,
      descricao,
      valor_total: parseFloat(valor.replace(',', '.')),
      numero_parcelas: numeroParcelas,
      mes_referencia: mesReferencia,
      ano_referencia: anoReferencia,
    })

    if (useCompraCartaoStore.getState().erro) {
      Alert.alert('Erro', useCompraCartaoStore.getState().erro ?? 'Erro desconhecido')
      return
    }

    resetForm()
    setModalVisivel(false)
    buscarLancamentos()
    buscarSaldo(mesSelecionado, anoSelecionado, escopo)
    buscarComprometidoFuturo(mesSelecionado, anoSelecionado, escopo)
  }, [cartaoId, descricao, valor, numeroParcelas, mesReferencia, anoReferencia,
      mesSelecionado, anoSelecionado, escopo,
      adicionarCompraCartao, buscarLancamentos, buscarSaldo, buscarComprometidoFuturo])

  const handleCancelar = useCallback((id: string) => {
    Alert.alert(
      'Cancelar parcelamento',
      'As parcelas ja lancadas continuam valendo. Nenhuma parcela futura sera lancada. Deseja continuar?',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Cancelar parcelamento', style: 'destructive', onPress: () => cancelarCompraCartao(id) },
      ]
    )
  }, [cancelarCompraCartao])

  const handleExcluir = useCallback((id: string) => {
    Alert.alert(
      'Excluir compra',
      'Isso remove a compra e todas as parcelas lancadas. Nao da para desfazer.',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluirCompraCartao(id) },
      ]
    )
  }, [excluirCompraCartao])

  return {
    modalVisivel, abrirModal, fecharModal,
    cartaoId, setCartaoId,
    descricao, setDescricao,
    valor, setValor,
    numeroParcelas, setNumeroParcelas,
    mesReferencia, setMesReferencia,
    anoReferencia, setAnoReferencia,
    cartoes, comprasCartao,
    totalPorCartao, totalGeralNoMes, comprometidoFuturo,
    carregando, mesSelecionado, anoSelecionado,
    buscarDados,
    handleSalvar, handleCancelar, handleExcluir,
    formatarMoeda,
  }
}
