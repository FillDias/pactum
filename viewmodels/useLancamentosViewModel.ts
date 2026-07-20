import { useState, useCallback, useMemo } from 'react'
import { Alert } from 'react-native'
import { useFinancasStore } from '../store/financasStore'
import { useSaldoStore } from '../store/saldoStore'
import { useAuthStore } from '../store/authStore'
import { CATEGORIAS, CATEGORIAS_RECEITA } from '../constants/categories'
import { filtrarPorTipo, somarValores } from '../utils/calculators'
import { formatarMoeda } from '../utils/formatters'
import { colors } from '../constants/colors'
import type { Lancamento } from '../types'

export interface LancamentosViewModel {
  tipo: 'despesa' | 'receita'
  setTipo: (t: 'despesa' | 'receita') => void
  descricao: string
  setDescricao: (v: string) => void
  valor: string
  setValor: (v: string) => void
  categoria: string
  setCategoria: (v: string) => void
  categoriaReceita: string
  setCategoriaReceita: (v: string) => void
  vencimento: number
  setVencimento: (v: number) => void
  recorrente: boolean
  setRecorrente: (v: boolean) => void
  lancamentos: Lancamento[]
  despesas: Lancamento[]
  receitas: Lancamento[]
  totalDespesas: number
  totalReceitas: number
  carregando: boolean
  mesSelecionado: number
  anoSelecionado: number
  setMesSelecionado: (mes: number, ano: number) => void
  escopo: 'eu' | 'familia'
  setEscopo: (e: 'eu' | 'familia') => void
  temFamilia: boolean
  cats: typeof CATEGORIAS
  tipoColor: string
  handleSalvar: () => Promise<void>
  handleRemover: (id: string, descricao: string) => void
  buscarLancamentos: () => void
  formatarMoeda: typeof formatarMoeda
}

export function useLancamentosViewModel(): LancamentosViewModel {
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0].nome)
  const [categoriaReceita, setCategoriaReceita] = useState(CATEGORIAS_RECEITA[0].nome)
  const [vencimento, setVencimento] = useState(5)
  const [recorrente, setRecorrente] = useState(false)

  const { familia } = useAuthStore()
  const {
    lancamentos, adicionarLancamento, removerLancamento, buscarLancamentos,
    carregando, mesSelecionado, anoSelecionado, setMesSelecionado, escopo, setEscopo,
  } = useFinancasStore()
  const { buscarSaldo } = useSaldoStore()

  const despesas = useMemo(() => filtrarPorTipo(lancamentos, 'despesa'), [lancamentos])
  const receitas = useMemo(() => filtrarPorTipo(lancamentos, 'receita'), [lancamentos])
  const totalDespesas = useMemo(() => somarValores(despesas), [despesas])
  const totalReceitas = useMemo(() => somarValores(receitas), [receitas])
  const cats = tipo === 'despesa' ? CATEGORIAS : CATEGORIAS_RECEITA
  const tipoColor = tipo === 'despesa' ? colors.status.negative : colors.status.positive

  const handleSalvar = useCallback(async () => {
    if (!descricao.trim() || !valor) {
      Alert.alert('Atencao', 'Preencha descricao e valor')
      return
    }
    const catSelecionada = tipo === 'despesa' ? categoria : categoriaReceita
    await adicionarLancamento({
      user_id: '',
      familia_id: null,
      descricao: descricao.trim(),
      valor: parseFloat(valor.replace(',', '.')),
      tipo,
      categoria: catSelecionada,
      vencimento,
      mes: mesSelecionado,
      ano: anoSelecionado,
      recorrente,
    })

    if (useFinancasStore.getState().erro) {
      Alert.alert('Erro', useFinancasStore.getState().erro ?? 'Erro desconhecido')
      return
    }

    setDescricao('')
    setValor('')
    buscarSaldo(mesSelecionado, anoSelecionado, escopo)
  }, [descricao, valor, tipo, categoria, categoriaReceita, vencimento, mesSelecionado,
      anoSelecionado, recorrente, adicionarLancamento, buscarSaldo, escopo])

  const handleRemover = useCallback((id: string, descricaoItem: string) => {
    Alert.alert('Remover', `Remover "${descricaoItem}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerLancamento(id) },
    ])
  }, [removerLancamento])

  return {
    tipo, setTipo,
    descricao, setDescricao,
    valor, setValor,
    categoria, setCategoria,
    categoriaReceita, setCategoriaReceita,
    vencimento, setVencimento,
    recorrente, setRecorrente,
    lancamentos, despesas, receitas,
    totalDespesas, totalReceitas,
    carregando, mesSelecionado, anoSelecionado, setMesSelecionado,
    escopo, setEscopo,
    temFamilia: !!familia,
    cats, tipoColor,
    handleSalvar, handleRemover, buscarLancamentos,
    formatarMoeda,
  }
}
