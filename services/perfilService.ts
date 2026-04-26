import api from '../config/api'
import { Usuario } from '../types'

export const buscarPerfilPorId = async (id: string): Promise<Usuario> => {
  const data = await api.get('/perfil')
  return data.user
}

export const atualizarPerfil = async (
  id: string,
  dados: Partial<Usuario>
): Promise<Usuario> => {
  const data = await api.patch('/perfil', dados)
  return data.user
}
