import { useState, useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import { useFinancasStore } from '../store/financasStore'
import { useSaldoStore } from '../store/saldoStore'
import { filtrarPorTipo, somarValores } from '../utils/calculators'
import { formatarMoeda } from '../utils/formatters'
import { CATEGORIAS_RECEITA, VENCIMENTOS } from '../constants/categories'
import type { Lancamento } from '../types'

export interface ReceitasViewModel {
  modalVisivel: boolean
  abrirModal: () => void
  fecharModal: () => void
  descricao: string
  setDescricao: (v: string) => void
  valor: string
  setValor: (v: string) => void
  categoria: string
  setCategoria: (v: string) => void
  recorrente: boolean
  setRecorrente: (v: boolean) => void
  receitas: Lancamento[]
  totalReceitas: number
  carregando: boolean
  mesSelecionado: number
  anoSelecionado: number
  buscarLancamentos: () => void
  handleSalvar: () => Promise<void>
  handleRemover: (id: string) => void
  formatarMoeda: typeof formatarMoeda
}

export function useReceitasViewModel(): ReceitasViewModel {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS_RECEITA[0].nome)
  const [recorrente, setRecorrente] = useState(true)

  const {
    lancamentos, carregando, mesSelecionado, anoSelecionado, escopo,
    buscarLancamentos, adicionarLancamento, removerLancamento,
  } = useFinancasStore()
  const { buscarSaldo } = useSaldoStore()

  const receitas = useMemo(() => filtrarPorTipo(lancamentos, 'receita'), [lancamentos])
  const totalReceitas = useMemo(() => somarValores(receitas), [receitas])

  const resetForm = () => {
    setDescricao('')
    setValor('')
    setCategoria(CATEGORIAS_RECEITA[0].nome)
    setRecorrente(true)
  }

  const abrirModal = useCallback(() => setModalVisivel(true), [])

  const fecharModal = useCallback(() => {
    setModalVisivel(false)
    resetForm()
  }, [])

  const handleSalvar = useCallback(async () => {
    if (!descricao || !valor) {
      Alert.alert('Atencao', 'Preencha descricao e valor')
      return
    }
    await adicionarLancamento({
      user_id: '',
      familia_id: null,
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      tipo: 'receita',
      categoria,
      vencimento: VENCIMENTOS[0],
      recorrente,
      mes: mesSelecionado,
      ano: anoSelecionado,
    })

    if (useFinancasStore.getState().erro) {
      Alert.alert('Erro', useFinancasStore.getState().erro ?? 'Erro desconhecido')
      return
    }

    resetForm()
    setModalVisivel(false)
    buscarSaldo(mesSelecionado, anoSelecionado, escopo)
  }, [descricao, valor, categoria, recorrente, mesSelecionado, anoSelecionado,
      escopo, adicionarLancamento, buscarSaldo])

  const handleRemover = useCallback((id: string) => {
    Alert.alert('Remover', 'Deseja remover esta receita?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerLancamento(id) },
    ])
  }, [removerLancamento])

  return {
    modalVisivel, abrirModal, fecharModal,
    descricao, setDescricao,
    valor, setValor,
    categoria, setCategoria,
    recorrente, setRecorrente,
    receitas, totalReceitas, carregando,
    mesSelecionado, anoSelecionado, buscarLancamentos,
    handleSalvar, handleRemover,
    formatarMoeda,
  }
}
