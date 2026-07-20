import { useEffect } from 'react'
import { useChatStore } from '../store/chatStore'

export const useChat = () => {
  const store = useChatStore()

  useEffect(() => {
    store.buscarMensagens()
    store.marcarComoLidas()
  }, [])

  return store
}
