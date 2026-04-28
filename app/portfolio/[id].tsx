import { useEffect, useState, useCallback, useMemo } from 'react'
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
  Platform,
  useWindowDimensions,
} from 'react-native'
import { PieChart } from 'react-native-chart-kit'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { usePortfolioStore } from '../../store/portfolioStore'
import { formatarMoeda } from '../../utils/formatters'
import { colors } from '../../constants/colors'
import { useResponsive } from '../../hooks/useResponsive'
import * as portfolioService from '../../services/portfolioService'
import { PortfolioTransaction, Security } from '../../types'

const TIPOS_TX = ['BUY', 'SELL'] as const

const TIPO_CONFIG: Record<string, { label: string; cor: string }> = {
  stock:   { label: 'AÇÃO',    cor: '#4A90D9' },
  fii:     { label: 'FII',     cor: '#3D9E6E' },
  etf:     { label: 'ETF',     cor: '#9B59B6' },
  bdr:     { label: 'BDR',     cor: '#E67E22' },
  crypto:  { label: 'CRIPTO',  cor: '#F39C12' },
  cdb:     { label: 'CDB',     cor: '#C8BFA8' },
  lci:     { label: 'LCI',     cor: '#A8C8BF' },
  lca:     { label: 'LCA',     cor: '#BFA8C8' },
  tesouro: { label: 'TESOURO', cor: '#C8C8A8' },
  fund:    { label: 'FUNDO',   cor: '#D4A8A8' },
  other:   { label: 'OUTRO',   cor: '#999'    },
}

const PIE_CATEGORIAS = [
  { label: 'Ações',   tipos: ['stock'],              cor: '#4A90D9' },
  { label: 'FIIs',    tipos: ['fii'],                cor: '#3D9E6E' },
  { label: 'ETFs',    tipos: ['etf', 'bdr'],         cor: '#9B59B6' },
  { label: 'Cripto',  tipos: ['crypto'],             cor: '#F39C12' },
  { label: 'Rf',      tipos: ['cdb','lci','lca','tesouro','savings'], cor: '#C8BFA8' },
  { label: 'Fundos',  tipos: ['fund'],               cor: '#D4A8A8' },
  { label: 'Outros',  tipos: ['other'],              cor: '#999'    },
]

export default function PortfolioDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { isDesktop } = useResponsive()
  const { width } = useWindowDimensions()

  const { portfolios, summaries, carregandoPosicoes, buscarPosicoes } = usePortfolioStore()

  const portfolio = portfolios.find(p => p.id === id)
  const summary = summaries[id ?? '']

  const [transacoes, setTransacoes] = useState<PortfolioTransaction[]>([])
  const [paginaTx, setPaginaTx] = useState(1)
  const [totalPaginasTx, setTotalPaginasTx] = useState(1)
  const [carregandoTx, setCarregandoTx] = useState(false)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [modalVisivel, setModalVisivel] = useState(false)
  const [aba, setAba] = useState<'posicoes' | 'transacoes' | 'rentabilidade'>('posicoes')
  const [rentabilidade, setRentabilidade] = useState<any>(null)
  const [carregandoRent, setCarregandoRent] = useState(false)

  // Nova transacao
  const [ticker, setTicker] = useState('')
  const [tipo, setTipo] = useState<'BUY' | 'SELL'>('BUY')
  const [quantidade, setQuantidade] = useState('')
  const [preco, setPreco] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [broker, setBroker] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Busca de security
  const [securityResults, setSecurityResults] = useState<Security[]>([])
  const [securitySelecionada, setSecuritySelecionada] = useState<Security | null>(null)
  const [buscandoSecurity, setBuscandoSecurity] = useState(false)

  const carregarRentabilidade = useCallback(async () => {
    if (!id) return
    setCarregandoRent(true)
    try {
      const [irr, twr] = await Promise.all([
        portfolioService.calcularIRR(id).catch(() => null),
        portfolioService.calcularTWR(id).catch(() => null),
      ])
      setRentabilidade({ irr, twr })
    } catch {
      /* nao bloquear */
    } finally {
      setCarregandoRent(false)
    }
  }, [id])

  const carregarDados = useCallback(() => {
    if (!id) return
    buscarPosicoes(id)
    carregarTransacoes()
  }, [id])

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarTransacoes = async (pagina = 1) => {
    if (!id) return
    if (pagina === 1) setCarregandoTx(true)
    else setCarregandoMais(true)
    try {
      const res = await portfolioService.listarTransacoes(id, pagina)
      setTransacoes(prev => pagina === 1 ? res.data : [...prev, ...res.data])
      setPaginaTx(pagina)
      setTotalPaginasTx(res.meta.total_pages)
    } catch {
      /* nao bloquear a tela */
    } finally {
      setCarregandoTx(false)
      setCarregandoMais(false)
    }
  }

  const buscarSecurity = async (q: string) => {
    setTicker(q)
    setSecuritySelecionada(null)
    if (q.length < 2) { setSecurityResults([]); return }
    setBuscandoSecurity(true)
    try {
      const results = await portfolioService.buscarSecurities(q)
      setSecurityResults(results)
    } catch {
      setSecurityResults([])
    } finally {
      setBuscandoSecurity(false)
    }
  }

  const selecionarSecurity = (s: Security) => {
    setSecuritySelecionada(s)
    setTicker(s.ticker)
    setSecurityResults([])
  }

  const handleSalvarTransacao = async () => {
    if (!securitySelecionada && !ticker.trim()) {
      Alert.alert('Atencao', 'Selecione ou informe um ativo')
      return
    }
    if (!quantidade || !preco) {
      Alert.alert('Atencao', 'Preencha quantidade e preco')
      return
    }

    setSalvando(true)
    try {
      await portfolioService.adicionarTransacao(id!, {
        securityId: securitySelecionada?.ticker ?? ticker.trim().toUpperCase(),
        type: tipo,
        quantity: parseFloat(quantidade.replace(',', '.')),
        price: parseFloat(preco.replace(',', '.')),
        date: data,
        brokerId: broker.trim() || undefined,
      })
      setModalVisivel(false)
      resetForm()
      carregarDados()
    } catch (err: any) {
      Alert.alert('Erro', err.message)
    } finally {
      setSalvando(false)
    }
  }

  const handleRemoverTransacao = (txId: string) => {
    Alert.alert('Remover', 'Deseja remover esta transacao?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await portfolioService.removerTransacao(id!, txId)
            carregarDados()
          } catch (err: any) {
            Alert.alert('Erro', err.message)
          }
        },
      },
    ])
  }

  const resetForm = () => {
    setTicker('')
    setTipo('BUY')
    setQuantidade('')
    setPreco('')
    setData(new Date().toISOString().split('T')[0])
    setBroker('')
    setSecuritySelecionada(null)
    setSecurityResults([])
  }

  const posicoesOrdenadas = useMemo(
    () => summary?.positions.slice().sort((a, b) => b.marketValue - a.marketValue) ?? [],
    [summary]
  )

  const pieData = useMemo(() => {
    if (!summary) return []
    return PIE_CATEGORIAS.map(cat => ({
      name: cat.label,
      population: Math.round(
        summary.positions
          .filter(p => cat.tipos.includes(p.securityType))
          .reduce((s, p) => s + p.marketValue, 0)
      ),
      color: cat.cor,
      legendFontColor: colors.text.secondary,
      legendFontSize: 11,
    })).filter(d => d.population > 0)
  }, [summary])

  const chartWidth = isDesktop ? Math.min(width - 280, 680) : width - 40

  const sectionLabel = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  }

  const plColor = (v: number) => (v >= 0 ? colors.status.positive : colors.status.negative)

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
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.accent.main, fontSize: 14 }}>← Carteiras</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary }}>
          {portfolio?.name ?? 'Carteira'}
        </Text>
        {portfolio?.description ? (
          <Text style={{ color: colors.text.tertiary, fontSize: 13, marginTop: 2 }}>
            {portfolio.description}
          </Text>
        ) : null}

        {summary && (
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
            <View style={{
              flex: 1, backgroundColor: colors.bg.card, borderRadius: 14,
              padding: 12, borderWidth: 1, borderColor: colors.bg.border,
            }}>
              <Text style={sectionLabel}>Valor atual</Text>
              <Text style={{ color: colors.accent.main, fontSize: 15, fontWeight: '700' }}>
                {formatarMoeda(summary.totalMarketValue)}
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: colors.bg.card, borderRadius: 14,
              padding: 12, borderWidth: 1, borderColor: colors.bg.border,
            }}>
              <Text style={sectionLabel}>Custo</Text>
              <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '700' }}>
                {formatarMoeda(summary.totalCost)}
              </Text>
            </View>
            <View style={{
              flex: 1, backgroundColor: colors.bg.card, borderRadius: 14,
              padding: 12, borderWidth: 1, borderColor: colors.bg.border,
            }}>
              <Text style={sectionLabel}>P&L</Text>
              <Text style={{ color: plColor(summary.totalPl), fontSize: 15, fontWeight: '700' }}>
                {summary.totalPl >= 0 ? '+' : ''}{summary.totalPlPercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Abas */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 24, marginTop: 16, marginBottom: 4 }}>
        {(['posicoes', 'transacoes', 'rentabilidade'] as const).map(a => (
          <TouchableOpacity
            key={a}
            onPress={() => {
              setAba(a)
              if (a === 'rentabilidade' && !rentabilidade && !carregandoRent) {
                carregarRentabilidade()
              }
            }}
            style={{
              marginRight: 20,
              paddingBottom: 8,
              borderBottomWidth: 2,
              borderBottomColor: aba === a ? colors.accent.main : 'transparent',
            }}
          >
            <Text style={{
              fontSize: 14,
              fontWeight: aba === a ? '600' : '400',
              color: aba === a ? colors.text.primary : colors.text.tertiary,
              textTransform: 'capitalize',
            }}>
              {a === 'rentabilidade' ? 'Rentab.' : a}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop
          ? { alignSelf: 'center', width: '100%', maxWidth: 720, paddingHorizontal: 20 }
          : { paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {aba === 'rentabilidade' ? (
          carregandoRent ? (
            <ActivityIndicator color={colors.accent.main} style={{ marginTop: 32 }} />
          ) : !rentabilidade ? (
            <View style={{
              backgroundColor: colors.bg.card, borderRadius: 16, padding: 24,
              alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border, marginTop: 8,
            }}>
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                Sem dados de rentabilidade.
              </Text>
            </View>
          ) : (
            <>
              <View style={{
                backgroundColor: colors.bg.card, borderRadius: 16, padding: 20,
                borderWidth: 1, borderColor: colors.bg.border, marginTop: 8, marginBottom: 12,
              }}>
                <Text style={{ ...sectionLabel, marginBottom: 8 }}>TIR (IRR) anualizada</Text>
                {rentabilidade.irr?.irrAnnualPercent != null ? (
                  <Text style={{
                    fontSize: 28, fontWeight: '700',
                    color: rentabilidade.irr.irrAnnualPercent >= 0 ? colors.status.positive : colors.status.negative,
                  }}>
                    {rentabilidade.irr.irrAnnualPercent >= 0 ? '+' : ''}{rentabilidade.irr.irrAnnualPercent.toFixed(2)}%
                  </Text>
                ) : (
                  <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                    Transacoes insuficientes
                  </Text>
                )}
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>
                  Taxa interna de retorno do portfolio
                </Text>
              </View>

              <View style={{
                backgroundColor: colors.bg.card, borderRadius: 16, padding: 20,
                borderWidth: 1, borderColor: colors.bg.border, marginBottom: 12,
              }}>
                <Text style={{ ...sectionLabel, marginBottom: 8 }}>TWR acumulado</Text>
                {rentabilidade.twr?.twr != null ? (
                  <Text style={{
                    fontSize: 28, fontWeight: '700',
                    color: rentabilidade.twr.twr >= 0 ? colors.status.positive : colors.status.negative,
                  }}>
                    {rentabilidade.twr.twr >= 0 ? '+' : ''}{rentabilidade.twr.twr.toFixed(2)}%
                  </Text>
                ) : (
                  <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                    Transacoes insuficientes
                  </Text>
                )}
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>
                  Retorno ponderado pelo tempo
                </Text>
              </View>
            </>
          )
        ) : aba === 'posicoes' ? (
          carregandoPosicoes ? (
            <ActivityIndicator color={colors.accent.main} style={{ marginTop: 32 }} />
          ) : !summary || summary.positions.length === 0 ? (
            <View style={{
              backgroundColor: colors.bg.card, borderRadius: 16, padding: 24,
              alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border, marginTop: 8,
            }}>
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                Nenhuma posicao. Adicione uma transacao.
              </Text>
            </View>
          ) : (
            <>
              {/* Grafico de alocacao */}
              {pieData.length > 1 && (
                <View style={{
                  backgroundColor: colors.bg.card, borderRadius: 16, borderWidth: 1,
                  borderColor: colors.bg.border, marginBottom: 16, overflow: 'hidden',
                }}>
                  <Text style={{ ...sectionLabel, paddingHorizontal: 16, paddingTop: 14, marginBottom: 0 }}>
                    Alocacao
                  </Text>
                  <PieChart
                    data={pieData}
                    width={chartWidth}
                    height={160}
                    chartConfig={{ color: () => colors.text.secondary, labelColor: () => colors.text.secondary }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="8"
                    hasLegend
                  />
                </View>
              )}

              {/* Lista de posicoes ordenada por valor */}
              {posicoesOrdenadas.map(pos => {
                const cfg = TIPO_CONFIG[pos.securityType] ?? TIPO_CONFIG.other
                return (
                  <View key={pos.ticker} style={{
                    backgroundColor: colors.bg.card, borderRadius: 14, padding: 16,
                    marginBottom: 10, borderWidth: 1, borderColor: colors.bg.border,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <View style={{
                            backgroundColor: cfg.cor + '22', borderRadius: 4,
                            paddingHorizontal: 6, paddingVertical: 2,
                          }}>
                            <Text style={{ color: cfg.cor, fontSize: 9, fontWeight: '700', letterSpacing: 0.5 }}>
                              {cfg.label}
                            </Text>
                          </View>
                          <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                            {pos.ticker}
                          </Text>
                        </View>
                        <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>{pos.name}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '700' }}>
                          {formatarMoeda(pos.marketValue)}
                        </Text>
                        <Text style={{ color: plColor(pos.pl), fontSize: 12, marginTop: 2 }}>
                          {pos.pl >= 0 ? '+' : ''}{formatarMoeda(pos.pl)} ({pos.plPercent >= 0 ? '+' : ''}{pos.plPercent.toFixed(2)}%)
                        </Text>
                      </View>
                    </View>

                    <View style={{
                      flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
                      paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.bg.border,
                    }}>
                      <View>
                        <Text style={sectionLabel}>Qtd</Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{pos.quantity}</Text>
                      </View>
                      <View>
                        <Text style={sectionLabel}>PM</Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                          {formatarMoeda(pos.averagePrice)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={sectionLabel}>Atual</Text>
                        <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                          {formatarMoeda(pos.currentPrice)}
                          {'  '}
                          <Text style={{ fontSize: 9, color: pos.priceSource === 'brapi' ? colors.status.positive : colors.text.tertiary }}>
                            {pos.priceSource === 'brapi' ? '● ao vivo' : '● ult. tx'}
                          </Text>
                        </Text>
                      </View>
                    </View>

                    {/* Info renda fixa */}
                    {(pos.annualRate != null || pos.maturityDate) && (
                      <View style={{
                        flexDirection: 'row', gap: 12, marginTop: 8,
                        paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.bg.border,
                      }}>
                        {pos.annualRate != null && (
                          <View>
                            <Text style={sectionLabel}>Taxa</Text>
                            <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
                              {pos.indexType ? `${pos.indexType} ` : ''}{pos.annualRate}% a.a.
                            </Text>
                          </View>
                        )}
                        {pos.maturityDate && (() => {
                          const dias = Math.ceil((new Date(pos.maturityDate).getTime() - new Date().setHours(0,0,0,0)) / 86400000)
                          const urgente = dias <= 30
                          return (
                            <View style={{ alignItems: 'flex-end', flex: 1 }}>
                              <Text style={sectionLabel}>Vencimento</Text>
                              <Text style={{ fontSize: 12, color: urgente ? colors.status.warning : colors.text.secondary, fontWeight: urgente ? '600' : '400' }}>
                                {pos.maturityDate}{urgente ? `  ·  ${dias}d` : ''}
                              </Text>
                            </View>
                          )
                        })()}
                      </View>
                    )}
                  </View>
                )
              })}
            </>
          )
        ) : (
          carregandoTx ? (
            <ActivityIndicator color={colors.accent.main} style={{ marginTop: 32 }} />
          ) : transacoes.length === 0 ? (
            <View style={{
              backgroundColor: colors.bg.card, borderRadius: 16, padding: 24,
              alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border, marginTop: 8,
            }}>
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                Nenhuma transacao registrada.
              </Text>
            </View>
          ) : (
            <>
              {transacoes.map(tx => (
                <TouchableOpacity
                  key={tx.id}
                  onLongPress={() => handleRemoverTransacao(tx.id)}
                  style={{
                    backgroundColor: colors.bg.card, borderRadius: 14, padding: 14,
                    marginBottom: 8, borderWidth: 1, borderColor: colors.bg.border,
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{
                        backgroundColor: tx.transaction_type === 'BUY' ? colors.status.positive : colors.status.negative,
                        borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
                      }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{tx.transaction_type}</Text>
                      </View>
                      <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14 }}>
                        {tx.ticker}
                      </Text>
                    </View>
                    <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>
                      {tx.date}  ·  {tx.quantity} x {formatarMoeda(tx.price)}
                      {tx.broker ? `  ·  ${tx.broker}` : ''}
                    </Text>
                  </View>
                  <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: 14 }}>
                    {formatarMoeda(tx.quantity * tx.price)}
                  </Text>
                </TouchableOpacity>
              ))}
              {paginaTx < totalPaginasTx && (
                <TouchableOpacity
                  onPress={() => carregarTransacoes(paginaTx + 1)}
                  disabled={carregandoMais}
                  style={{
                    paddingVertical: 14, alignItems: 'center', marginBottom: 8,
                    borderWidth: 1, borderColor: colors.bg.border, borderRadius: 12,
                    backgroundColor: colors.bg.card,
                  }}
                >
                  {carregandoMais
                    ? <ActivityIndicator size="small" color={colors.accent.main} />
                    : <Text style={{ color: colors.accent.main, fontWeight: '600', fontSize: 14 }}>
                        Carregar mais
                      </Text>}
                </TouchableOpacity>
              )}
            </>
          )
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={{
          position: 'absolute', bottom: 24, right: 24,
          backgroundColor: colors.accent.main, width: 56, height: 56,
          borderRadius: 28, alignItems: 'center', justifyContent: 'center',
        }}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={{ color: colors.text.inverse, fontSize: 28, lineHeight: 32, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      {/* Modal nova transacao */}
      <Modal visible={modalVisivel} transparent animationType="slide" onRequestClose={() => { setModalVisivel(false); resetForm() }}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <ScrollView style={{
            backgroundColor: colors.bg.secondary,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderTopWidth: 1, borderColor: colors.bg.border,
          }}>
            <View style={{ padding: 24 }}>
              <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>
                Nova transacao
              </Text>

              {/* Tipo BUY/SELL */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
                {TIPOS_TX.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                      backgroundColor: tipo === t ? (t === 'BUY' ? colors.status.positive : colors.status.negative) : colors.bg.input,
                      borderWidth: 1,
                      borderColor: tipo === t ? (t === 'BUY' ? colors.status.positive : colors.status.negative) : colors.bg.border,
                    }}
                    onPress={() => setTipo(t)}
                  >
                    <Text style={{
                      color: tipo === t ? '#fff' : colors.text.secondary,
                      fontWeight: '700', fontSize: 13,
                    }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Busca de ativo */}
              <View style={{ marginBottom: 12 }}>
                <TextInput
                  style={inputStyle}
                  placeholder="Ticker ex: PETR4, MXRF11"
                  placeholderTextColor={colors.text.tertiary}
                  value={ticker}
                  onChangeText={buscarSecurity}
                  autoCapitalize="characters"
                />
                {buscandoSecurity && (
                  <ActivityIndicator size="small" color={colors.accent.main} style={{ marginTop: -8, marginBottom: 8 }} />
                )}
                {securityResults.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => selecionarSecurity(s)}
                    style={{
                      backgroundColor: colors.bg.card, padding: 10, borderRadius: 8,
                      marginBottom: 4, borderWidth: 1, borderColor: colors.bg.border,
                    }}
                  >
                    <Text style={{ color: colors.text.primary, fontWeight: '600' }}>{s.ticker}</Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>{s.name}</Text>
                  </TouchableOpacity>
                ))}
                {securitySelecionada && (
                  <View style={{
                    backgroundColor: colors.bg.card, padding: 12, borderRadius: 8,
                    marginTop: -8, marginBottom: 8, borderWidth: 1, borderColor: colors.accent.main,
                  }}>
                    <Text style={{ color: colors.accent.main, fontWeight: '600' }}>
                      {securitySelecionada.ticker} — {securitySelecionada.name}
                    </Text>
                    {securitySelecionada.annual_rate != null && (
                      <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 4 }}>
                        {securitySelecionada.index_type ?? 'Taxa'}: {securitySelecionada.annual_rate}%
                        {securitySelecionada.maturity_date ? `  ·  Venc: ${securitySelecionada.maturity_date}` : ''}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              <TextInput
                style={inputStyle}
                placeholder="Quantidade ex: 100"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                value={quantidade}
                onChangeText={setQuantidade}
              />

              <TextInput
                style={inputStyle}
                placeholder="Preco unitario ex: 38,50"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                value={preco}
                onChangeText={setPreco}
              />

              <TextInput
                style={inputStyle}
                placeholder="Data ex: 2025-05-01"
                placeholderTextColor={colors.text.tertiary}
                value={data}
                onChangeText={setData}
              />

              <TextInput
                style={{ ...inputStyle, marginBottom: 20 }}
                placeholder="Corretora (opcional)"
                placeholderTextColor={colors.text.tertiary}
                value={broker}
                onChangeText={setBroker}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: colors.accent.main, borderRadius: 12,
                  paddingVertical: 16, alignItems: 'center', marginBottom: 12,
                }}
                onPress={handleSalvarTransacao}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <Text style={{ color: colors.text.inverse, fontWeight: '700', fontSize: 15 }}>
                    Registrar transacao
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 12, alignItems: 'center', marginBottom: 8 }}
                onPress={() => { setModalVisivel(false); resetForm() }}
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
