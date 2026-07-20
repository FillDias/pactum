import { useEffect } from 'react'
import { useMetasStore } from '../store/metasStore'

export const useMetas = () => {
  const store = useMetasStore()

  useEffect(() => {
    store.buscarMetas()
  }, [])

  return store
}
