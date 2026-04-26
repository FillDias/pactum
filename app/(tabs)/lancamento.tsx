import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native'
import { useFinancasStore } from '../../store/financasStore'
import { useSaldoStore } from '../../store/saldoStore'
import { CATEGORIAS, VENCIMENTOS } from '../../constants/categories'
import { colors } from '../../constants/colors'

export default function Lancamento() {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [categoria, setCategoria] = useState(CATEGORIAS[0].nome)
  const [vencimento, setVencimento] = useState(5)
  const [recorrente, setRecorrente] = useState(false)

  const { adicionarLancamento, carregando, mesSelecionado, anoSelecionado } =
    useFinancasStore()
  const { buscarSaldo } = useSaldoStore()

  const handleSalvar = async () => {
    if (!descricao || !valor) {
      Alert.alert('Atencao', 'Preencha descricao e valor')
      return
    }
    await adicionarLancamento({
      user_id: '',
      familia_id: null,
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      tipo: 'despesa',
      categoria,
      vencimento,
      mes: mesSelecionado,
      ano: anoSelecionado,
      recorrente,
    })

    const erroAtual = useFinancasStore.getState().erro
    if (erroAtual) {
      Alert.alert('Erro', erroAtual)
      return
    }

    setDescricao('')
    setValor('')
    setCategoria(CATEGORIAS[0].nome)
    setVencimento(5)
    setRecorrente(false)
    buscarSaldo(mesSelecionado, anoSelecionado)
    Alert.alert('Sucesso', 'Lancamento adicionado!')
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
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 24 }}>
          <Text style={{
            fontSize: 11,
            color: colors.text.tertiary,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
            Novo
          </Text>
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: colors.text.primary,
            marginTop: 4,
          }}>
            Lancamento
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 16 }}>

          {/* Tipo */}
          <View style={{
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{
              fontSize: 11,
              color: colors.text.tertiary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Tipo
            </Text>
            <View style={{
              backgroundColor: colors.status.negative + '22',
              borderRadius: 10,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.status.negative + '44',
            }}>
              <Text style={{
                color: colors.status.negative,
                fontWeight: '600',
                fontSize: 14,
              }}>
                Despesa
              </Text>
            </View>
          </View>

          {/* Detalhes */}
          <View style={{
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{
              fontSize: 11,
              color: colors.text.tertiary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Detalhes
            </Text>
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
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{
              fontSize: 11,
              color: colors.text.tertiary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Categoria
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
          </View>

          {/* Vencimento */}
          <View style={{
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{
              fontSize: 11,
              color: colors.text.tertiary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Vencimento
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
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
          </View>

          {/* Recorrente */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.bg.card,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: colors.bg.border,
            }}
            onPress={() => setRecorrente(!recorrente)}
          >
            <View>
              <Text style={{
                color: colors.text.primary,
                fontSize: 14,
                fontWeight: '500',
              }}>
                Recorrente
              </Text>
              <Text style={{
                color: colors.text.tertiary,
                fontSize: 12,
                marginTop: 2,
              }}>
                Repete todo mes
              </Text>
            </View>
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

          {/* Botao salvar */}
          <TouchableOpacity
            style={{
              backgroundColor: colors.accent.main,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 32,
            }}
            onPress={handleSalvar}
            disabled={carregando}
          >
            {carregando ? (
              <ActivityIndicator color={colors.text.inverse} />
            ) : (
              <Text style={{
                color: colors.text.inverse,
                fontWeight: '700',
                fontSize: 15,
                letterSpacing: 0.5,
              }}>
                Salvar lancamento
              </Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  )
}
