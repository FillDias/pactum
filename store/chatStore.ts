import { create } from 'zustand'
import { Mensagem } from '../types'
import * as chatService from '../services/chatService'

type ChatState = {
  mensagens: Mensagem[]
  carregando: boolean
  erro: string | null
  naoLidas: number

  buscarMensagens: () => Promise<void>
  marcarComoLidas: () => void
  enviarMensagem: (conteudo: string) => Promise<void>
  adicionarMensagemLocal: (mensagem: Mensagem) => void
  limparErro: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  mensagens: [],
  carregando: false,
  erro: null,
  naoLidas: 0,

  buscarMensagens: async () => {
    set({ carregando: true, erro: null })
    try {
      const mensagens = await chatService.buscarMensagens()
      const anterior = get().mensagens.length
      const novas = mensagens.length > anterior ? mensagens.length - anterior : 0
      set(state => ({
        mensagens,
        carregando: false,
        naoLidas: state.naoLidas + novas,
      }))
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  marcarComoLidas: () => set({ naoLidas: 0 }),

  enviarMensagem: async (conteudo) => {
    try {
      const mensagem = await chatService.enviarMensagem(conteudo)
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
