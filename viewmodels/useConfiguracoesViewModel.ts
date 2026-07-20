import { useState, useCallback } from 'react'
import { Clipboard } from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useAuthStore } from '../store/authStore'
import { showAlert, showConfirm } from '../utils/alert'
import type { Usuario, Familia } from '../types'

export type ModalModo = 'criar_familia' | 'entrar_familia' | null

export interface ConfiguracoesViewModel {
  usuario: Usuario | null
  familia: Familia | null
  carregando: boolean
  erro: string | null
  ehDono: boolean
  modalModo: ModalModo
  nomeFamilia: string
  setNomeFamilia: (v: string) => void
  codigoInput: string
  setCodigoInput: (v: string) => void
  abrirModal: (modo: ModalModo) => void
  fecharModal: () => void
  handleCriarFamilia: () => Promise<void>
  handleEntrarFamilia: () => Promise<void>
  handleCopiarCodigo: () => void
  handleLogout: () => void
}

export function useConfiguracoesViewModel(): ConfiguracoesViewModel {
  const { usuario, familia, logout, criarFamilia, entrarFamilia, atualizarFamilia, carregando, erro, limparErro } = useAuthStore()
  const [modalModo, setModalModo] = useState<ModalModo>(null)
  const [nomeFamilia, setNomeFamilia] = useState('')
  const [codigoInput, setCodigoInput] = useState('')

  useFocusEffect(
    useCallback(() => {
      atualizarFamilia()
    }, [atualizarFamilia])
  )

  const ehDono = familia?.codigo_convite != null

  const abrirModal = useCallback((modo: ModalModo) => {
    limparErro()
    setModalModo(modo)
  }, [limparErro])

  const fecharModal = useCallback(() => {
    setModalModo(null)
    setNomeFamilia('')
    setCodigoInput('')
  }, [])

  const handleCriarFamilia = useCallback(async () => {
    if (!nomeFamilia.trim()) {
      showAlert('Atencao', 'Digite o nome da familia')
      return
    }
    await criarFamilia(nomeFamilia.trim())
    if (!useAuthStore.getState().erro) {
      fecharModal()
      showAlert('Sucesso', 'Familia criada!')
    }
  }, [nomeFamilia, criarFamilia, fecharModal])

  const handleEntrarFamilia = useCallback(async () => {
    if (!codigoInput.trim()) {
      showAlert('Atencao', 'Digite o codigo de convite')
      return
    }
    await entrarFamilia(codigoInput.trim().toUpperCase())
    if (!useAuthStore.getState().erro) {
      fecharModal()
      showAlert('Sucesso', 'Voce entrou na familia!')
    }
  }, [codigoInput, entrarFamilia, fecharModal])

  const handleCopiarCodigo = useCallback(() => {
    if (familia?.codigo_convite) {
      Clipboard.setString(familia.codigo_convite)
      showAlert('Copiado', 'Codigo copiado para a area de transferencia')
    }
  }, [familia?.codigo_convite])

  const handleLogout = useCallback(() => {
    showConfirm('Sair', 'Deseja realmente sair?', logout, 'Sair', true)
  }, [logout])

  return {
    usuario,
    familia,
    carregando,
    erro,
    ehDono,
    modalModo,
    nomeFamilia, setNomeFamilia,
    codigoInput, setCodigoInput,
    abrirModal, fecharModal,
    handleCriarFamilia, handleEntrarFamilia,
    handleCopiarCodigo, handleLogout,
  }
}
