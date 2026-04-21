// Store de autenticação — gerencia sessão, perfil e vínculo do casal
import { create } from 'zustand'
import { Usuario, Casal } from '../types'
import * as authService from '../services/authService'

type AuthState = {
  usuario: Usuario | null
  casal: Casal | null
  carregando: boolean
  erro: string | null

  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  buscarPerfil: () => Promise<void>
  vincularConjuge: (email: string) => Promise<void>
  limparErro: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  casal: null,
  carregando: false,
  erro: null,

  login: async (email, senha) => {
    set({ carregando: true, erro: null })
    try {
      const usuario = await authService.login(email, senha)
      set({ usuario, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  register: async (nome, email, senha) => {
    set({ carregando: true, erro: null })
    try {
      const usuario = await authService.register(nome, email, senha)
      set({ usuario, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  logout: async () => {
    set({ carregando: true })
    try {
      await authService.logout()
      set({ usuario: null, casal: null, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  buscarPerfil: async () => {
    set({ carregando: true })
    try {
      const { usuario, casal } = await authService.buscarPerfil()
      set({ usuario, casal, carregando: false })
    } catch (error: any) {
      // "Usuário não autenticado" é estado normal (app abrindo sem sessão), não um erro
      const semSessao = error.message === 'Usuário não autenticado'
      set({ erro: semSessao ? null : error.message, carregando: false })
    }
  },

  vincularConjuge: async (email) => {
    set({ carregando: true, erro: null })
    try {
      const casal = await authService.vincularConjuge(email)
      set({ casal, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  limparErro: () => set({ erro: null }),
}))
