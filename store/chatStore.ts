// Store de chat — gerencia mensagens entre os parceiros
import { create } from 'zustand'
import { Mensagem } from '../types'
import * as chatService from '../services/chatService'

type ChatState = {
  mensagens: Mensagem[]
  carregando: boolean
  erro: string | null

  buscarMensagens: (casalId: string) => Promise<void>
  enviarMensagem: (casalId: string, usuarioId: string, conteudo: string) => Promise<void>
  adicionarMensagemLocal: (mensagem: Mensagem) => void
  limparErro: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  mensagens: [],
  carregando: false,
  erro: null,

  buscarMensagens: async (casalId) => {
    set({ carregando: true, erro: null })
    try {
      const mensagens = await chatService.buscarMensagens(casalId)
      set({ mensagens, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  enviarMensagem: async (casalId, usuarioId, conteudo) => {
    try {
      const mensagem = await chatService.enviarMensagem(casalId, usuarioId, conteudo)
      set(state => ({ mensagens: [...state.mensagens, mensagem] }))
    } catch (error: any) {
      set({ erro: error.message })
    }
  },

  adicionarMensagemLocal: (mensagem) => {
    set(state => ({ mensagens: [...state.mensagens, mensagem] }))
  },

  limparErro: () => set({ erro: null }),
}))
