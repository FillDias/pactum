import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native'
import { useReceitaStore } from '../../store/receitaStore'
import { useFinancasStore } from '../../store/financasStore'
import { formatarMoeda } from '../../utils/formatters'
import { Receita } from '../../types'
import { colors } from '../../constants/colors'

const TIPOS_RECEITA = [
  { valor: 'salario', label: 'Salario' },
  { valor: 'freela', label: 'Freela' },
  { valor: 'bonus', label: 'Bonus' },
  { valor: 'investimento', label: 'Investimento' },
  { valor: 'outro', label: 'Outro' },
]

export default function Receitas() {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState<Receita['tipo']>('salario')
  const [recorrente, setRecorrente] = useState(true)

  const {
    receitas,
    carregando,
    buscarReceitas,
    adicionarReceita,
    removerReceita,
  } = useReceitaStore()

  const { mesSelecionado, anoSelecionado } = useFinancasStore()

  useEffect(() => {
    buscarReceitas(mesSelecionado, anoSelecionado)
  }, [mesSelecionado, anoSelecionado])

  const totalReceitas = receitas.reduce((acc, r) => acc + r.valor, 0)

  const handleSalvar = async () => {
    if (!descricao || !valor) {
      Alert.alert('Atencao', 'Preencha descricao e valor')
      return
    }
    await adicionarReceita({
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      tipo,
      recorrente,
      mes: mesSelecionado,
      ano: anoSelecionado,
    })
    setDescricao('')
    setValor('')
    setTipo('salario')
    setRecorrente(true)
    setModalVisivel(false)
  }

  const handleRemover = (id: string) => {
    Alert.alert('Remover', 'Deseja remover esta receita?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => removerReceita(id),
      },
    ])
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24 }}>
        <Text style={{
          fontSize: 11,
          color: colors.text.tertiary,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          Entradas
        </Text>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginTop: 4,
        }}>
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: colors.text.primary,
          }}>
            Receitas
          </Text>
          <Text style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.status.positive,
          }}>
            {formatarMoeda(totalReceitas)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {carregando ? (
          <ActivityIndicator
            color={colors.accent.main}
            style={{ marginTop: 32 }}
          />
        ) : receitas.length === 0 ? (
          <View style={{
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
              Nenhuma receita este mes.
            </Text>
            <Text style={{
              color: colors.text.tertiary,
              fontSize: 12,
              marginTop: 4,
            }}>
              Toque em + para adicionar.
            </Text>
          </View>
        ) : (
          receitas.map((receita) => (
            <TouchableOpacity
              key={receita.id}
              onLongPress={() => handleRemover(receita.id)}
              style={{
                backgroundColor: colors.bg.card,
                borderRadius: 14,
                padding: 16,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.bg.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: colors.text.primary,
                  fontSize: 14,
                  fontWeight: '500',
                }}>
                  {receita.descricao}
                </Text>
                <Text style={{
                  color: colors.text.tertiary,
                  fontSize: 12,
                  marginTop: 3,
                }}>
                  {TIPOS_RECEITA.find(t => t.valor === receita.tipo)?.label}
                  {receita.recorrente ? ' · Recorrente' : ''}
                </Text>
              </View>
              <Text style={{
                color: colors.status.positive,
                fontWeight: '700',
                fontSize: 15,
              }}>
                + {formatarMoeda(receita.valor)}
              </Text>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botao adicionar */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          backgroundColor: colors.accent.main,
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={{
          color: colors.text.inverse,
          fontSize: 28,
          lineHeight: 32,
          fontWeight: '300',
        }}>
          +
        </Text>
      </TouchableOpacity>

      {/* Modal nova receita */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.7)',
        }}>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            borderTopWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{
              color: colors.text.primary,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 20,
            }}>
              Nova receita
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="Descricao ex: Salario"
              placeholderTextColor={colors.text.tertiary}
              value={descricao}
              onChangeText={setDescricao}
            />

            <TextInput
              style={inputStyle}
              placeholder="Valor ex: 3000,00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
              value={valor}
              onChangeText={setValor}
            />

            <Text style={{
              fontSize: 11,
              color: colors.text.tertiary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}>
              Tipo
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {TIPOS_RECEITA.map((t) => (
                  <TouchableOpacity
                    key={t.valor}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: tipo === t.valor
                        ? colors.status.positive
                        : colors.bg.input,
                      borderWidth: 1,
                      borderColor: tipo === t.valor
                        ? colors.status.positive
                        : colors.bg.border,
                    }}
                    onPress={() => setTipo(t.valor as Receita['tipo'])}
                  >
                    <Text style={{
                      color: tipo === t.valor ? '#fff' : colors.text.secondary,
                      fontSize: 13,
                    }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: colors.bg.input,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.bg.border,
              }}
              onPress={() => setRecorrente(!recorrente)}
            >
              <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                Recorrente todo mes
              </Text>
              <View style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: recorrente
                  ? colors.status.positive
                  : colors.bg.border,
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
                backgroundColor: colors.status.positive,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12,
              }}
              onPress={handleSalvar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  Salvar receita
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={() => setModalVisivel(false)}
            >
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
