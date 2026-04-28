import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useFinancasStore } from '../../store/financasStore'
import { useSaldoStore } from '../../store/saldoStore'
import { CATEGORIAS, VENCIMENTOS } from '../../constants/categories'
import { colors } from '../../constants/colors'
import { formatarMoeda, formatarMesAno } from '../../utils/formatters'

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

export default function DetalhesLancamento() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { lancamentos, removerLancamento, editarLancamento, carregando, mesSelecionado, anoSelecionado } =
    useFinancasStore()
  const { buscarSaldo } = useSaldoStore()

  const lancamento = lancamentos.find(l => l.id === id)

  const [modalVisivel, setModalVisivel] = useState(false)
  const [descricao, setDescricao] = useState(lancamento?.descricao ?? '')
  const [valor, setValor] = useState(String(lancamento?.valor ?? ''))
  const [categoria, setCategoria] = useState(lancamento?.categoria ?? CATEGORIAS[0].nome)
  const [vencimento, setVencimento] = useState(lancamento?.vencimento ?? 5)
  const [recorrente, setRecorrente] = useState(lancamento?.recorrente ?? false)

  if (!lancamento) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.bg.primary,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
          Lancamento nao encontrado.
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent.main, fontSize: 14 }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isDespesa = lancamento.tipo === 'despesa'
  const tipoColor = isDespesa ? colors.status.negative : colors.status.positive
  const dataCriacao = new Date(lancamento.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const handleDeletar = () => {
    Alert.alert('Deletar lancamento', 'Esta acao nao pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: async () => {
          await removerLancamento(lancamento.id)
          buscarSaldo(mesSelecionado, anoSelecionado)
          router.back()
        },
      },
    ])
  }

  const handleSalvarEdicao = async () => {
    if (!descricao || !valor) {
      Alert.alert('Atencao', 'Preencha descricao e valor')
      return
    }
    await editarLancamento(lancamento.id, {
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      categoria,
      vencimento,
      recorrente,
    })
    setModalVisivel(false)
    buscarSaldo(mesSelecionado, anoSelecionado)
  }

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

  const labelSmall = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 16,
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.bg.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}
        >
          <Feather name="arrow-left" size={18} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontSize: 16,
          fontWeight: '600',
          color: colors.text.primary,
        }}>
          Detalhes
        </Text>

        <TouchableOpacity
          onPress={handleDeletar}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.status.negative + '22',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: colors.status.negative + '44',
          }}
        >
          <Feather name="trash-2" size={18} color={colors.status.negative} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

        {/* Card principal com valor */}
        <View style={{
          backgroundColor: colors.bg.card,
          borderRadius: 20,
          padding: 28,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: colors.bg.border,
          marginBottom: 16,
        }}>
          <View style={{
            backgroundColor: tipoColor + '22',
            paddingHorizontal: 14,
            paddingVertical: 4,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: tipoColor + '44',
            marginBottom: 16,
          }}>
            <Text style={{ color: tipoColor, fontSize: 12, fontWeight: '600' }}>
              {isDespesa ? 'Despesa' : 'Receita'}
            </Text>
          </View>

          <Text style={{
            fontSize: 40,
            fontWeight: '700',
            color: tipoColor,
            letterSpacing: -1,
          }}>
            {isDespesa ? '-' : '+'}{formatarMoeda(lancamento.valor)}
          </Text>

          <Text style={{
            fontSize: 18,
            color: colors.text.primary,
            fontWeight: '500',
            marginTop: 12,
            textAlign: 'center',
          }}>
            {lancamento.descricao}
          </Text>
        </View>

        {/* Informacoes */}
        <View style={{
          backgroundColor: colors.bg.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.bg.border,
          marginBottom: 16,
          overflow: 'hidden',
        }}>
          {[
            { label: 'Categoria', valor: lancamento.categoria },
            { label: 'Vencimento', valor: lancamento.vencimento ? `Dia ${lancamento.vencimento}` : '—' },
            { label: 'Mes / Ano', valor: `${MESES[(lancamento.mes ?? 1) - 1]} / ${lancamento.ano}` },
            { label: 'Recorrente', valor: lancamento.recorrente ? 'Sim' : 'Nao' },
            { label: 'Criado em', valor: dataCriacao },
          ].map((item, i) => (
            <View
              key={item.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 18,
                paddingVertical: 14,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.bg.border,
              }}
            >
              <Text style={labelSmall}>{item.label}</Text>
              <Text style={{
                color: colors.text.primary,
                fontSize: 14,
                fontWeight: '500',
              }}>
                {item.valor}
              </Text>
            </View>
          ))}
        </View>

        {/* Botao editar */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.accent.main,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: 'center',
          }}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={{
            color: colors.text.inverse,
            fontWeight: '700',
            fontSize: 15,
            letterSpacing: 0.5,
          }}>
            Editar lancamento
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal de edicao */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.75)',
        }}>
          <ScrollView style={{
            backgroundColor: colors.bg.secondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <View style={{ padding: 24 }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 20,
              }}>
                Editar lancamento
              </Text>

              <TextInput
                style={inputStyle}
                placeholder="Descricao"
                placeholderTextColor={colors.text.tertiary}
                value={descricao}
                onChangeText={setDescricao}
              />

              <TextInput
                style={inputStyle}
                placeholder="Valor ex: 830,00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                value={valor}
                onChangeText={setValor}
              />

              <Text style={{ ...labelSmall, marginBottom: 10 }}>Categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORIAS.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: categoria === cat.nome
                          ? colors.accent.main
                          : colors.bg.input,
                        borderWidth: 1,
                        borderColor: categoria === cat.nome
                          ? colors.accent.main
                          : colors.bg.border,
                      }}
                      onPress={() => setCategoria(cat.nome)}
                    >
                      <Text style={{
                        color: categoria === cat.nome
                          ? colors.text.inverse
                          : colors.text.secondary,
                        fontSize: 13,
                        fontWeight: '500',
                      }}>
                        {cat.icone} {cat.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={{ ...labelSmall, marginBottom: 10 }}>Vencimento</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                {VENCIMENTOS.map((dia) => (
                  <TouchableOpacity
                    key={dia}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: vencimento === dia
                        ? colors.accent.main
                        : colors.bg.input,
                      borderWidth: 1,
                      borderColor: vencimento === dia
                        ? colors.accent.main
                        : colors.bg.border,
                    }}
                    onPress={() => setVencimento(dia)}
                  >
                    <Text style={{
                      color: vencimento === dia
                        ? colors.text.inverse
                        : colors.text.secondary,
                      fontWeight: '600',
                      fontSize: 13,
                    }}>
                      Dia {dia}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.bg.input,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: colors.bg.border,
                }}
                onPress={() => setRecorrente(!recorrente)}
              >
                <Text style={{ color: colors.text.primary, fontSize: 14 }}>Recorrente</Text>
                <View style={{
                  width: 44,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: recorrente ? colors.accent.main : colors.bg.border,
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                }}>
                  <View style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: '#fff',
                    alignSelf: recorrente ? 'flex-end' : 'flex-start',
                  }} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent.main,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
                onPress={handleSalvarEdicao}
                disabled={carregando}
              >
                {carregando ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <Text style={{
                    color: colors.text.inverse,
                    fontWeight: '700',
                    fontSize: 15,
                  }}>
                    Salvar alteracoes
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
