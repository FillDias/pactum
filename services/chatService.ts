import api from '../config/api'
import { Mensagem } from '../types'

const mapMensagem = (m: any): Mensagem => ({ ...m })

export const buscarMensagens = async (): Promise<Mensagem[]> => {
  const data = await api.get('/mensagens')
  return data.mensagens.map(mapMensagem)
}

export const enviarMensagem = async (conteudo: string): Promise<Mensagem> => {
  const data = await api.post('/mensagens', { conteudo })
  return mapMensagem(data.mensagem)
}

export const assinarMensagens = (
  onNovaMensagem: (mensagem: Mensagem) => void
) => {
  const interval = setInterval(async () => {
    try {
      const data = await api.get('/mensagens')
      if (data.mensagens?.length) {
        onNovaMensagem(mapMensagem(data.mensagens[data.mensagens.length - 1]))
      }
    } catch {}
  }, 3000)

  return { unsubscribe: () => clearInterval(interval) }
}
