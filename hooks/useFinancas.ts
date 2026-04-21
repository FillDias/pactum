// Hook para carregar lançamentos automaticamente ao mudar mês/casal
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useFinancasStore } from '../store/financasStore'

export const useFinancas = () => {
  const { casal } = useAuthStore()
  const store = useFinancasStore()

  useEffect(() => {
    if (casal?.id) store.buscarLancamentos(casal.id)
  }, [casal?.id, store.mesSelecionado, store.anoSelecionado])

  return store
}
