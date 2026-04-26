import { useEffect, useMemo, useState } from 'react'
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
  Dimensions,
} from 'react-native'
import { PieChart } from 'react-native-chart-kit'
import { useInvestimentoStore } from '../../store/investimentoStore'
import { useCotacaoStore } from '../../store/cotacaoStore'
import { formatarMoeda } from '../../utils/formatters'
import { Investimento } from '../../types'
import { colors } from '../../constants/colors'

const { width: screenWidth } = Dimensions.get('window')

const TIPOS_INVESTIMENTO = [
  { valor: 'cdb', label: 'CDB' },
  { valor: 'lci', label: 'LCI' },
  { valor: 'lca', label: 'LCA' },
  { valor: 'tesouro_selic', label: 'Tesouro Selic' },
  { valor: 'tesouro_prefixado', label: 'Tesouro Prefixado' },
  { valor: 'acoes', label: 'Acoes' },
  { valor: 'fii', label: 'FII' },
  { valor: 'etf', label: 'ETF' },
  { valor: 'bdr', label: 'BDR' },
  { valor: 'cripto', label: 'Cripto' },
  { valor: 'outro', label: 'Outro' },
]

const RENTABILIDADE_TIPOS = [
  { valor: 'cdi', label: 'CDI' },
  { valor: 'selic', label: 'Selic' },
  { valor: 'prefixado', label: 'Prefixado' },
  { valor: 'variavel', label: 'Variavel' },
]

const TIPOS_RENDA_FIXA = ['cdb', 'lci', 'lca', 'tesouro_selic', 'tesouro_prefixado']
const TIPOS_BRAPI = ['acoes', 'fii', 'etf', 'bdr']

const PIE_CATEGORIAS: Array<{ label: string; tipos: string[]; cor: string }> = [
  { label: 'Renda Fixa', tipos: TIPOS_RENDA_FIXA, cor: '#C8BFA8' },
  { label: 'FIIs', tipos: ['fii'], cor: '#3D9E6E' },
  { label: 'Acoes BR', tipos: ['acoes'], cor: '#4A90D9' },
  { label: 'Internacional', tipos: ['etf', 'bdr'], cor: '#9B59B6' },
  { label: 'Cripto', tipos: ['cripto'], cor: '#F39C12' },
]

function calcRendimentoReal(inv: Investimento, cdi: number): number {
  const pct = inv.rentabilidade_percentual
  if (!pct) return inv.rendimento_mensal_estimado
  if (inv.rentabilidade_tipo === 'cdi' || inv.rentabilidade_tipo === 'selic') {
    return inv.valor_investido * (cdi / 100) * (pct / 100) / 12
  }
  if (inv.rentabilidade_tipo === 'prefixado') {
    return inv.valor_investido * (pct / 100) / 12
  }
  return inv.rendimento_mensal_estimado
}

export default function Investimentos() {
  const [modalVisivel, setModalVisivel] = useState(false)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('cdb')
  const [valorInvestido, setValorInvestido] = useState('')
  const [rentabilidadeTipo, setRentabilidadeTipo] = useState('cdi')
  const [rentabilidadePercentual, setRentabilidadePercentual] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [vencimento, setVencimento] = useState('')

  const {
    investimentos,
    patrimonio_total,
    rendimento_mensal,
    carregando,
    buscarInvestimentos,
    adicionarInvestimento,
    removerInvestimento,
  } = useInvestimentoStore()

  const { cotacoes, cdiAtual, buscarCotacoes, buscarCDI } = useCotacaoStore()

  useEffect(() => {
    buscarInvestimentos()
    buscarCDI()
  }, [])

  useEffect(() => {
    const tickers = investimentos
      .filter(i => TIPOS_BRAPI.includes(i.tipo))
      .map(i => i.nome.toUpperCase().trim())
      .filter(Boolean)
    if (tickers.length > 0) buscarCotacoes(tickers)
  }, [investimentos])

  const rendaFixa = useMemo(
    () => investimentos.filter(i => TIPOS_RENDA_FIXA.includes(i.tipo)),
    [investimentos]
  )

  const rendaVariavel = useMemo(
    () => investimentos.filter(i => !TIPOS_RENDA_FIXA.includes(i.tipo)),
    [investimentos]
  )

  const variacaoCarteira = useMemo(() => {
    const comCot = rendaVariavel.filter(i => cotacoes[i.nome.toUpperCase().trim()])
    if (comCot.length === 0) return null
    const totalRV = comCot.reduce((s, i) => s + i.valor_investido, 0)
    if (totalRV === 0) return null
    const pond = comCot.reduce((s, i) => {
      const cot = cotacoes[i.nome.toUpperCase().trim()]
      return s + (cot?.variacaoPercent ?? 0) * i.valor_investido
    }, 0)
    return pond / totalRV
  }, [rendaVariavel, cotacoes])

  const pieData = useMemo(() => {
    return PIE_CATEGORIAS
      .map(cat => {
        const total = investimentos
          .filter(i => cat.tipos.includes(i.tipo))
          .reduce((s, i) => s + i.valor_investido, 0)
        return {
          name: cat.label,
          population: Math.round(total),
          color: cat.cor,
          legendFontColor: colors.text.secondary,
          legendFontSize: 11,
        }
      })
      .filter(d => d.population > 0)
  }, [investimentos])

  const handleSalvar = async () => {
    if (!nome || !valorInvestido) {
      Alert.alert('Atencao', 'Preencha nome e valor investido')
      return
    }
    await adicionarInvestimento({
      nome,
      tipo,
      valor_investido: parseFloat(valorInvestido.replace(',', '.')),
      quantidade: null,
      rentabilidade_tipo: rentabilidadeTipo as Investimento['rentabilidade_tipo'],
      rentabilidade_percentual: rentabilidadePercentual
        ? parseFloat(rentabilidadePercentual.replace(',', '.'))
        : null,
      data_inicio: dataInicio || new Date().toISOString().split('T')[0],
      vencimento: vencimento || null,
    })
    setNome('')
    setTipo('cdb')
    setValorInvestido('')
    setRentabilidadeTipo('cdi')
    setRentabilidadePercentual('')
    setDataInicio('')
    setVencimento('')
    setModalVisivel(false)
  }

  const handleRemover = (id: string) => {
    Alert.alert('Remover', 'Deseja remover este investimento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removerInvestimento(id) },
    ])
  }

  const tipoLabel = (v: string) =>
    TIPOS_INVESTIMENTO.find(t => t.valor === v)?.label ?? v.toUpperCase()

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

  const variacaoColor = (v: number) =>
    v >= 0 ? colors.status.positive : colors.status.negative

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 56, paddingBottom: 16 }}>
        <Text style={{
          fontSize: 11,
          color: colors.text.tertiary,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
        }}>
          Patrimonio
        </Text>
        <Text style={{
          fontSize: 22,
          fontWeight: '700',
          color: colors.text.primary,
          marginTop: 4,
        }}>
          Investimentos
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
          <View style={{
            flex: 1,
            backgroundColor: colors.bg.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={sectionLabel}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.accent.main }}>
              {formatarMoeda(patrimonio_total)}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: colors.bg.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={sectionLabel}>Rendimento/mes</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.status.positive }}>
              +{formatarMoeda(rendimento_mensal)}
            </Text>
          </View>

          <View style={{
            flex: 1,
            backgroundColor: colors.bg.card,
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={sectionLabel}>Hoje</Text>
            {variacaoCarteira !== null ? (
              <Text style={{
                fontSize: 16,
                fontWeight: '700',
                color: variacaoColor(variacaoCarteira),
              }}>
                {variacaoCarteira >= 0 ? '+' : ''}
                {variacaoCarteira.toFixed(2)}%
              </Text>
            ) : (
              <Text style={{ fontSize: 14, color: colors.text.tertiary }}>--</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {carregando ? (
          <ActivityIndicator color={colors.accent.main} style={{ marginTop: 32 }} />
        ) : investimentos.length === 0 ? (
          <View style={{
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
              Nenhum investimento cadastrado.
            </Text>
            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>
              Toque em + para adicionar.
            </Text>
          </View>
        ) : (
          <>
            {/* Grafico de alocacao */}
            {pieData.length > 0 && (
              <View style={{
                backgroundColor: colors.bg.card,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.bg.border,
                marginBottom: 20,
                overflow: 'hidden',
              }}>
                <Text style={{
                  ...sectionLabel,
                  paddingHorizontal: 16,
                  paddingTop: 16,
                  marginBottom: 8,
                }}>
                  Alocacao
                </Text>
                <PieChart
                  data={pieData}
                  width={screenWidth - 40}
                  height={180}
                  chartConfig={{
                    color: () => colors.text.secondary,
                    labelColor: () => colors.text.secondary,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="12"
                  hasLegend
                />
              </View>
            )}

            {/* Renda Fixa */}
            {rendaFixa.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={sectionLabel}>
                  Renda Fixa{cdiAtual > 0 ? ` · CDI ${cdiAtual.toFixed(2)}% a.a.` : ''}
                </Text>
                {rendaFixa.map((inv) => {
                  const rendReal = calcRendimentoReal(inv, cdiAtual)
                  return (
                    <TouchableOpacity
                      key={inv.id}
                      onLongPress={() => handleRemover(inv.id)}
                      style={{
                        backgroundColor: colors.bg.card,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: colors.bg.border,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{
                          color: colors.text.primary,
                          fontSize: 14,
                          fontWeight: '500',
                          flex: 1,
                        }}>
                          {inv.nome}
                        </Text>
                        <Text style={{
                          color: colors.accent.main,
                          fontWeight: '700',
                          fontSize: 14,
                        }}>
                          {formatarMoeda(inv.valor_investido)}
                        </Text>
                      </View>
                      <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 6,
                      }}>
                        <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                          {tipoLabel(inv.tipo)}
                          {inv.rentabilidade_percentual
                            ? ` · ${inv.rentabilidade_percentual}% ${inv.rentabilidade_tipo?.toUpperCase()}`
                            : ''}
                        </Text>
                        <Text style={{ color: colors.status.positive, fontSize: 12 }}>
                          +{formatarMoeda(rendReal)}/mes
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}

            {/* Renda Variavel */}
            {rendaVariavel.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={sectionLabel}>Renda Variavel</Text>
                {rendaVariavel.map((inv) => {
                  const ticker = inv.nome.toUpperCase().trim()
                  const cot = TIPOS_BRAPI.includes(inv.tipo)
                    ? cotacoes[ticker]
                    : undefined
                  return (
                    <TouchableOpacity
                      key={inv.id}
                      onLongPress={() => handleRemover(inv.id)}
                      style={{
                        backgroundColor: colors.bg.card,
                        borderRadius: 14,
                        padding: 16,
                        marginBottom: 8,
                        borderWidth: 1,
                        borderColor: colors.bg.border,
                      }}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            color: colors.text.primary,
                            fontSize: 14,
                            fontWeight: '500',
                          }}>
                            {inv.nome}
                          </Text>
                          {cot && (
                            <Text style={{ color: colors.text.tertiary, fontSize: 11, marginTop: 2 }}>
                              {cot.shortName}
                            </Text>
                          )}
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{
                            color: colors.accent.main,
                            fontWeight: '700',
                            fontSize: 14,
                          }}>
                            {formatarMoeda(inv.valor_investido)}
                          </Text>
                          {cot && (
                            <Text style={{
                              color: variacaoColor(cot.variacaoPercent),
                              fontSize: 11,
                              marginTop: 2,
                            }}>
                              {cot.variacaoPercent >= 0 ? '+' : ''}
                              {cot.variacaoPercent.toFixed(2)}%
                            </Text>
                          )}
                        </View>
                      </View>

                      {cot && (
                        <View style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginTop: 8,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: colors.bg.border,
                        }}>
                          <View>
                            <Text style={{ color: colors.text.tertiary, fontSize: 10, letterSpacing: 1 }}>
                              PRECO ATUAL
                            </Text>
                            <Text style={{
                              color: colors.text.primary,
                              fontSize: 14,
                              fontWeight: '600',
                              marginTop: 2,
                            }}>
                              {formatarMoeda(cot.preco)}
                            </Text>
                          </View>
                          <View style={{ alignItems: 'flex-end' }}>
                            <Text style={{ color: colors.text.tertiary, fontSize: 10, letterSpacing: 1 }}>
                              VARIACAO HOJE
                            </Text>
                            <Text style={{
                              color: variacaoColor(cot.variacao),
                              fontSize: 14,
                              fontWeight: '600',
                              marginTop: 2,
                            }}>
                              {cot.variacao >= 0 ? '+' : ''}
                              {formatarMoeda(cot.variacao)}
                            </Text>
                          </View>
                        </View>
                      )}

                      {!cot && (
                        <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 6 }}>
                          {tipoLabel(inv.tipo)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </>
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

      {/* Modal novo investimento */}
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
                Novo investimento
              </Text>

              <TextInput
                style={inputStyle}
                placeholder="Nome ex: PETR4 ou CDB Banco X"
                placeholderTextColor={colors.text.tertiary}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="characters"
              />

              <TextInput
                style={inputStyle}
                placeholder="Valor investido ex: 5000,00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                value={valorInvestido}
                onChangeText={setValorInvestido}
              />

              <Text style={{ ...sectionLabel, marginBottom: 10 }}>Tipo</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {TIPOS_INVESTIMENTO.map((t) => (
                    <TouchableOpacity
                      key={t.valor}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: tipo === t.valor
                          ? colors.accent.main
                          : colors.bg.input,
                        borderWidth: 1,
                        borderColor: tipo === t.valor
                          ? colors.accent.main
                          : colors.bg.border,
                      }}
                      onPress={() => setTipo(t.valor)}
                    >
                      <Text style={{
                        color: tipo === t.valor
                          ? colors.text.inverse
                          : colors.text.secondary,
                        fontSize: 13,
                      }}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={{ ...sectionLabel, marginBottom: 10 }}>Rentabilidade</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {RENTABILIDADE_TIPOS.map((t) => (
                  <TouchableOpacity
                    key={t.valor}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: rentabilidadeTipo === t.valor
                        ? colors.accent.main
                        : colors.bg.input,
                      borderWidth: 1,
                      borderColor: rentabilidadeTipo === t.valor
                        ? colors.accent.main
                        : colors.bg.border,
                    }}
                    onPress={() => setRentabilidadeTipo(t.valor)}
                  >
                    <Text style={{
                      color: rentabilidadeTipo === t.valor
                        ? colors.text.inverse
                        : colors.text.secondary,
                      fontSize: 12,
                      fontWeight: '500',
                    }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={inputStyle}
                placeholder="Rentabilidade % ex: 100 (100% CDI)"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                value={rentabilidadePercentual}
                onChangeText={setRentabilidadePercentual}
              />

              <TextInput
                style={inputStyle}
                placeholder="Data inicio ex: 2025-05-01"
                placeholderTextColor={colors.text.tertiary}
                value={dataInicio}
                onChangeText={setDataInicio}
              />

              <TextInput
                style={{ ...inputStyle, marginBottom: 20 }}
                placeholder="Vencimento ex: 2026-05-01 (opcional)"
                placeholderTextColor={colors.text.tertiary}
                value={vencimento}
                onChangeText={setVencimento}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent.main,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginBottom: 12,
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
                  }}>
                    Salvar investimento
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}
