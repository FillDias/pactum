import { create } from 'zustand'
import { Usuario, Familia } from '../types'
import * as authService from '../services/authService'
import * as familiaService from '../services/familiaService'

type AuthState = {
  usuario: Usuario | null
  familia: Familia | null
  carregando: boolean
  erro: string | null

  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  buscarPerfil: () => Promise<void>
  criarFamilia: (nome: string) => Promise<void>
  convidarMembro: (email: string) => Promise<void>
  limparErro: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  familia: null,
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
      set({ usuario: null, familia: null, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  buscarPerfil: async () => {
    set({ carregando: true })
    try {
      const { usuario, familia } = await authService.buscarPerfil()
      set({ usuario, familia, carregando: false })
    } catch {
      set({ carregando: false })
    }
  },

  criarFamilia: async (nome) => {
    set({ carregando: true, erro: null })
    try {
      const familia = await familiaService.criarFamilia(nome)
      set({ familia, carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  convidarMembro: async (email) => {
    const { familia } = get()
    if (!familia) throw new Error('Sem família ativa')
    set({ carregando: true, erro: null })
    try {
      await authService.convidarMembro(email, familia.id)
      set({ carregando: false })
    } catch (error: any) {
      set({ erro: error.message, carregando: false })
    }
  },

  limparErro: () => set({ erro: null }),
}))
