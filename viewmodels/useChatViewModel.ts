import { useState, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import { useChatStore } from '../store/chatStore'
import * as chatService from '../services/chatService'
import type { Mensagem } from '../types'

export interface ChatViewModel {
  mensagem: string
  setMensagem: (v: string) => void
  mensagens: Mensagem[]
  usuarioId: string | undefined
  buscarMensagens: () => void
  marcarComoLidas: () => void
  setupSubscription: () => () => void
  handleEnviar: (scrollToEnd?: () => void) => Promise<void>
}

export function useChatViewModel(): ChatViewModel {
  const [mensagem, setMensagem] = useState('')
  const { usuario } = useAuthStore()
  const { mensagens, buscarMensagens, marcarComoLidas, enviarMensagem, adicionarMensagemLocal } = useChatStore()

  const setupSubscription = useCallback(() => {
    const subscription = chatService.assinarMensagens((novaMensagem) => {
      if (novaMensagem.user_id !== usuario?.id) {
        adicionarMensagemLocal(novaMensagem)
      }
    })
    return () => { subscription.unsubscribe() }
  }, [usuario?.id, adicionarMensagemLocal])

  const handleEnviar = useCallback(async (scrollToEnd?: () => void) => {
    if (!mensagem.trim()) return
    const texto = mensagem
    setMensagem('')
    await enviarMensagem(texto)
    scrollToEnd?.()
  }, [mensagem, enviarMensagem])

  return {
    mensagem, setMensagem,
    mensagens,
    usuarioId: usuario?.id,
    buscarMensagens, marcarComoLidas,
    setupSubscription,
    handleEnviar,
  }
}
