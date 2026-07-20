import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { useCartaoStore } from '../store/cartaoStore'
import { OPERADORA_OUTRA } from '../constants/categories'
import { formatarMoeda } from '../utils/formatters'
import type { Cartao } from '../types'

export interface CartoesViewModel {
  modalVisivel: boolean
  abrirModal: () => void
  fecharModal: () => void
  apelido: string
  setApelido: (v: string) => void
  operadoraSelecionada: string
  setOperadoraSelecionada: (v: string) => void
  operadoraCustomizada: string
  setOperadoraCustomizada: (v: string) => void
  limite: string
  setLimite: (v: string) => void
  cartoes: Cartao[]
  carregando: boolean
  buscarCartoes: () => void
  handleSalvar: () => Promise<void>
  handleRemover: (id: string) => void
  formatarMoeda: typeof formatarMoeda
}

export function useCartoesViewModel(): CartoesViewModel {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [apelido, setApelido] = useState('')
  const [operadoraSelecionada, setOperadoraSelecionada] = useState('')
  const [operadoraCustomizada, setOperadoraCustomizada] = useState('')
  const [limite, setLimite] = useState('')

  const { cartoes, carregando, buscarCartoes, adicionarCartao, removerCartao } = useCartaoStore()

  const resetForm = () => {
    setApelido('')
    setOperadoraSelecionada('')
    setOperadoraCustomizada('')
    setLimite('')
  }

  const abrirModal = useCallback(() => setModalVisivel(true), [])

  const fecharModal = useCallback(() => {
    setModalVisivel(false)
    resetForm()
  }, [])

  const handleSalvar = useCallback(async () => {
    const operadora = operadoraSelecionada === OPERADORA_OUTRA ? operadoraCustomizada : operadoraSelecionada
    if (!operadora.trim()) {
      Alert.alert('Atencao', 'Selecione ou informe a operadora')
      return
    }

    await adicionarCartao({
      apelido: apelido.trim() || null,
      operadora: operadora.trim(),
      limite: limite ? parseFloat(limite.replace(',', '.')) : null,
    })

    if (useCartaoStore.getState().erro) {
      Alert.alert('Erro', useCartaoStore.getState().erro ?? 'Erro desconhecido')
      return
    }

    resetForm()
    setModalVisivel(false)
  }, [apelido, operadoraSelecionada, operadoraCustomizada, limite, adicionarCartao])

  const handleRemover = useCallback((id: string) => {
    Alert.alert('Remover', 'Deseja remover este cartao?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerCartao(id) },
    ])
  }, [removerCartao])

  return {
    modalVisivel, abrirModal, fecharModal,
    apelido, setApelido,
    operadoraSelecionada, setOperadoraSelecionada,
    operadoraCustomizada, setOperadoraCustomizada,
    limite, setLimite,
    cartoes, carregando, buscarCartoes,
    handleSalvar, handleRemover,
    formatarMoeda,
  }
}
