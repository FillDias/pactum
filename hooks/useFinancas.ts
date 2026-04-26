import { useEffect } from 'react'
import { useFinancasStore } from '../store/financasStore'

export const useFinancas = () => {
  const store = useFinancasStore()

  useEffect(() => {
    store.buscarLancamentos()
  }, [store.mesSelecionado, store.anoSelecionado])

  return store
}
