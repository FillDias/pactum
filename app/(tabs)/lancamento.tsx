import { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { useFinancasStore } from '../../store/financasStore'
import { useSaldoStore } from '../../store/saldoStore'
import { CATEGORIAS, VENCIMENTOS } from '../../constants/categories'
import { colors } from '../../constants/colors'
import { formatarMoeda } from '../../utils/formatters'
import { useResponsive } from '../../hooks/useResponsive'

const CATEGORIAS_RECEITA = [
  { id: 'r1', nome: 'Salario',      icone: '💰' },
  { id: 'r2', nome: 'Freela',       icone: '💻' },
  { id: 'r3', nome: 'Bonus',        icone: '🎁' },
  { id: 'r4', nome: 'Investimento', icone: '📈' },
  { id: 'r5', nome: 'Outros',       icone: '📦' },
]

export default function Lancamento() {
  const { isDesktop } = useResponsive()

  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa')
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0].nome)
  const [categoriaReceita, setCategoriaReceita] = useState(CATEGORIAS_RECEITA[0].nome)
  const [vencimento, setVencimento] = useState(5)
  const [recorrente, setRecorrente] = useState(false)

  const {
    lancamentos,
    adicionarLancamento,
    removerLancamento,
    buscarLancamentos,
    carregando,
    mesSelecionado,
    anoSelecionado,
  } = useFinancasStore()
  const { buscarSaldo } = useSaldoStore()

  useFocusEffect(
    useCallback(() => {
      buscarLancamentos()
    }, [mesSelecionado, anoSelecionado])
  )

  const despesas = useMemo(() => lancamentos.filter(l => l.tipo === 'despesa'), [lancamentos])
  const receitas = useMemo(() => lancamentos.filter(l => l.tipo === 'receita'), [lancamentos])

  const totalDespesas = useMemo(() => despesas.reduce((s, l) => s + l.valor, 0), [despesas])
  const totalReceitas = useMemo(() => receitas.reduce((s, l) => s + l.valor, 0), [receitas])

  const handleSalvar = async () => {
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
    buscarSaldo(mesSelecionado, anoSelecionado)
  }

  const handleRemover = (id: string, descricaoItem: string) => {
    Alert.alert('Remover', `Remover "${descricaoItem}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerLancamento(id) },
    ])
  }

  const cats = tipo === 'despesa' ? CATEGORIAS : CATEGORIAS_RECEITA

  const inputStyle = {
    backgroundColor: colors.bg.input,
    borderWidth: 1,
    borderColor: colors.bg.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 12,
  }

  const sectionLabel = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  }

  const tipoColor = tipo === 'despesa' ? colors.status.negative : colors.status.positive

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={isDesktop ? { alignSelf: 'center', width: '100%', maxWidth: 600 } : undefined}>

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 20 }}>
            <Text style={sectionLabel}>Financas</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, marginTop: 4 }}>
              Lancamentos
            </Text>
          </View>

          {/* Resumo */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{
                flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14,
                borderWidth: 1, borderColor: colors.bg.border,
              }}>
                <Text style={sectionLabel}>Receitas</Text>
                <Text style={{ color: colors.status.positive, fontSize: 16, fontWeight: '700' }}>
                  {formatarMoeda(totalReceitas)}
                </Text>
              </View>
              <View style={{
                flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14,
                borderWidth: 1, borderColor: colors.bg.border,
              }}>
                <Text style={sectionLabel}>Despesas</Text>
                <Text style={{ color: colors.status.negative, fontSize: 16, fontWeight: '700' }}>
                  {formatarMoeda(totalDespesas)}
                </Text>
              </View>
            </View>
          </View>

          {/* Formulario */}
          <View style={{ paddingHorizontal: 20, gap: 14 }}>

            {/* Toggle tipo */}
            <View style={{
              backgroundColor: colors.bg.card, borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: colors.bg.border,
            }}>
              <Text style={sectionLabel}>Tipo</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['despesa', 'receita'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                      backgroundColor: tipo === t
                        ? (t === 'despesa' ? colors.status.negative : colors.status.positive) + '22'
                        : colors.bg.input,
                      borderWidth: 1,
                      borderColor: tipo === t
                        ? (t === 'despesa' ? colors.status.negative : colors.status.positive)
                        : colors.bg.border,
                    }}
                    onPress={() => setTipo(t)}
                  >
                    <Text style={{
                      color: tipo === t
                        ? (t === 'despesa' ? colors.status.negative : colors.status.positive)
                        : colors.text.secondary,
                      fontWeight: '700',
                      fontSize: 13,
                      textTransform: 'capitalize',
                    }}>
                      {t === 'despesa' ? '↓ Despesa' : '↑ Receita'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Detalhes */}
            <View style={{
              backgroundColor: colors.bg.card, borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: colors.bg.border,
            }}>
              <Text style={sectionLabel}>Detalhes</Text>
              <TextInput
                style={inputStyle}
                placeholder="Descricao"
                placeholderTextColor={colors.text.tertiary}
                value={descricao}
                onChangeText={setDescricao}
              />
              <TextInput
                style={{ ...inputStyle, marginBottom: 0 }}
                placeholder="Valor ex: 830,00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                value={valor}
                onChangeText={setValor}
              />
            </View>

            {/* Categoria */}
            <View style={{
              backgroundColor: colors.bg.card, borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: colors.bg.border,
            }}>
              <Text style={sectionLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {cats.map(cat => {
                    const selecionada = tipo === 'despesa' ? categoria === cat.nome : categoriaReceita === cat.nome
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: selecionada ? tipoColor + '22' : colors.bg.input,
                          borderWidth: 1,
                          borderColor: selecionada ? tipoColor : colors.bg.border,
                        }}
                        onPress={() => tipo === 'despesa' ? setCategoria(cat.nome) : setCategoriaReceita(cat.nome)}
                      >
                        <Text style={{
                          color: selecionada ? tipoColor : colors.text.secondary,
                          fontSize: 13,
                          fontWeight: selecionada ? '600' : '400',
                        }}>
                          {cat.icone} {cat.nome}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Vencimento (apenas despesa) */}
            {tipo === 'despesa' && (
              <View style={{
                backgroundColor: colors.bg.card, borderRadius: 16, padding: 16,
                borderWidth: 1, borderColor: colors.bg.border,
              }}>
                <Text style={sectionLabel}>Vencimento</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {VENCIMENTOS.map(dia => (
                    <TouchableOpacity
                      key={dia}
                      style={{
                        flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                        backgroundColor: vencimento === dia ? colors.accent.main : colors.bg.input,
                        borderWidth: 1,
                        borderColor: vencimento === dia ? colors.accent.main : colors.bg.border,
                      }}
                      onPress={() => setVencimento(dia)}
                    >
                      <Text style={{
                        color: vencimento === dia ? '#fff' : colors.text.secondary,
                        fontWeight: '600', fontSize: 13,
                      }}>
                        Dia {dia}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Recorrente */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.card, borderRadius: 16, padding: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                borderWidth: 1, borderColor: colors.bg.border,
              }}
              onPress={() => setRecorrente(!recorrente)}
            >
              <View>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                  Recorrente
                </Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>
                  Repete todo mes
                </Text>
              </View>
              <View style={{
                width: 44, height: 24, borderRadius: 12,
                backgroundColor: recorrente ? colors.accent.main : colors.bg.border,
                justifyContent: 'center', paddingHorizontal: 3,
              }}>
                <View style={{
                  width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff',
                  alignSelf: recorrente ? 'flex-end' : 'flex-start',
                }} />
              </View>
            </TouchableOpacity>

            {/* Botao salvar */}
            <TouchableOpacity
              style={{
                backgroundColor: tipoColor,
                borderRadius: 14, paddingVertical: 16, alignItems: 'center',
              }}
              onPress={handleSalvar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 }}>
                  {tipo === 'despesa' ? 'Registrar despesa' : 'Registrar receita'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Lista recente */}
            {lancamentos.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ ...sectionLabel, marginBottom: 12 }}>
                  Lancamentos do mes ({lancamentos.length})
                </Text>
                {lancamentos.map(l => (
                  <TouchableOpacity
                    key={l.id}
                    onLongPress={() => handleRemover(l.id, l.descricao)}
                    style={{
                      backgroundColor: colors.bg.card,
                      borderRadius: 12, padding: 14, marginBottom: 8,
                      borderWidth: 1, borderColor: colors.bg.border,
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                    }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: (l.tipo === 'despesa' ? colors.status.negative : colors.status.positive) + '18',
                    }}>
                      <Text style={{ fontSize: 16 }}>
                        {[...CATEGORIAS, ...CATEGORIAS_RECEITA].find(c => c.nome === l.categoria)?.icone ?? '📦'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                        {l.descricao}
                      </Text>
                      <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 1 }}>
                        {l.categoria}  ·  Dia {l.vencimento}
                        {l.recorrente ? '  ·  Recorrente' : ''}
                      </Text>
                    </View>
                    <Text style={{
                      color: l.tipo === 'despesa' ? colors.status.negative : colors.status.positive,
                      fontWeight: '700', fontSize: 14,
                    }}>
                      {l.tipo === 'despesa' ? '-' : '+'}{formatarMoeda(l.valor)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ height: 60 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
