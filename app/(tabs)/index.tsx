import { useCallback, useMemo } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { useFinancasStore } from '../../store/financasStore'
import { useSaldoStore } from '../../store/saldoStore'
import { usePortfolioStore } from '../../store/portfolioStore'
import { useChatStore } from '../../store/chatStore'
import { formatarMoeda, formatarMesAno } from '../../utils/formatters'
import { colors } from '../../constants/colors'
import SwipeableItem from '../../components/shared/SwipeableItem'
import { useResponsive } from '../../hooks/useResponsive'

const DIAS_AVISO = 30

function diasParaVencer(maturityDate: string): number {
  const venc = new Date(maturityDate)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
}

export default function Inicio() {
  const { isDesktop } = useResponsive()
  const { usuario } = useAuthStore()
  const { lancamentos, mesSelecionado, anoSelecionado, buscarLancamentos, removerLancamento } =
    useFinancasStore()
  const { saldo, buscarSaldo } = useSaldoStore()
  const { portfolios, summaries, buscarPortfolios, buscarPosicoes } = usePortfolioStore()
  const { mensagens, buscarMensagens } = useChatStore()

  const carregarPortfolios = useCallback(async () => {
    await buscarPortfolios()
    const ids = usePortfolioStore.getState().portfolios.map(p => p.id)
    await Promise.all(ids.map(id => buscarPosicoes(id)))
  }, [])

  useFocusEffect(
    useCallback(() => {
      buscarLancamentos()
      buscarSaldo(mesSelecionado, anoSelecionado)
      buscarMensagens()
      carregarPortfolios()
    }, [mesSelecionado, anoSelecionado])
  )

  const handleDeletar = async (id: string) => {
    await removerLancamento(id)
    buscarSaldo(mesSelecionado, anoSelecionado)
  }

  const saldoValor = saldo?.saldo ?? 0
  const saldoPositivo = saldoValor >= 0
  const saldoColor = saldoPositivo ? colors.status.positive : colors.status.negative

  // Totais das carteiras (novo sistema)
  const totalInvestido = useMemo(
    () => Object.values(summaries).reduce((s, p) => s + p.totalMarketValue, 0),
    [summaries]
  )
  const totalPl = useMemo(
    () => Object.values(summaries).reduce((s, p) => s + p.totalPl, 0),
    [summaries]
  )
  const patrimonioTotal = saldoValor + totalInvestido

  // Alertas de vencimento (todas as posições de renda fixa com maturityDate próximo)
  const alertasVencimento = useMemo(() => {
    const alertas: { ticker: string; nome: string; dias: number; portfolioNome: string; marketValue: number }[] = []
    portfolios.forEach(p => {
      const s = summaries[p.id]
      if (!s) return
      s.positions.forEach(pos => {
        if (!pos.maturityDate) return
        const dias = diasParaVencer(pos.maturityDate)
        if (dias >= 0 && dias <= DIAS_AVISO) {
          alertas.push({
            ticker: pos.ticker,
            nome: pos.name,
            dias,
            portfolioNome: p.name,
            marketValue: pos.marketValue,
          })
        }
      })
    })
    return alertas.sort((a, b) => a.dias - b.dias)
  }, [portfolios, summaries])

  const atividadeRecente = mensagens
    .filter(m => m.tipo === 'sistema')
    .slice(-4)
    .reverse()

  const sectionLabel = {
    fontSize: 11,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{
          paddingHorizontal: 24,
          paddingTop: Platform.OS === 'web' ? 24 : 56,
          paddingBottom: 24,
        }}>
          <Text style={{ fontSize: 12, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Ola, {usuario?.nome}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, marginTop: 4 }}>
            {formatarMesAno(mesSelecionado, anoSelecionado)}
          </Text>
        </View>

        <View style={isDesktop
          ? { flexDirection: 'row', gap: 20, paddingHorizontal: 20, alignItems: 'flex-start' }
          : undefined
        }>

          {/* Coluna esquerda */}
          <View style={isDesktop ? { flex: 1, gap: 12 } : undefined}>

            {/* Alertas de vencimento */}
            {alertasVencimento.map(alerta => (
              <View key={alerta.ticker} style={{
                marginHorizontal: isDesktop ? 0 : 20,
                marginBottom: 10,
                backgroundColor: alerta.dias <= 7 ? '#FFF5F5' : '#FFFBF0',
                borderRadius: 12,
                padding: 14,
                borderLeftWidth: 3,
                borderLeftColor: alerta.dias <= 7 ? colors.status.negative : colors.status.warning,
              }}>
                <Text style={{
                  color: alerta.dias <= 7 ? colors.status.negative : colors.status.warning,
                  fontWeight: '700', fontSize: 13,
                }}>
                  {alerta.dias === 0 ? 'Vence hoje' : `Vence em ${alerta.dias} dia${alerta.dias !== 1 ? 's' : ''}`}
                  {' — '}{alerta.ticker}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                  {alerta.nome} · {alerta.portfolioNome} · {formatarMoeda(alerta.marketValue)}
                </Text>
              </View>
            ))}

            {/* Card saldo do mes */}
            <View style={{
              marginHorizontal: isDesktop ? 0 : 20,
              backgroundColor: colors.bg.card,
              borderRadius: 20,
              padding: isDesktop ? 28 : 24,
              borderWidth: 1,
              borderColor: colors.bg.border,
            }}>
              <Text style={sectionLabel}>Saldo do mes</Text>
              <Text style={{ fontSize: isDesktop ? 48 : 38, fontWeight: '700', color: saldoColor, letterSpacing: -1 }}>
                {formatarMoeda(saldoValor)}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
                <View style={{
                  flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12,
                  borderWidth: 1, borderColor: colors.bg.border,
                }}>
                  <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                    Receitas
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.status.positive }}>
                    {formatarMoeda(saldo?.total_receitas ?? 0)}
                  </Text>
                </View>
                <View style={{
                  flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12,
                  borderWidth: 1, borderColor: colors.bg.border,
                }}>
                  <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                    Gastos
                  </Text>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.status.negative }}>
                    {formatarMoeda(saldo?.total_gastos ?? 0)}
                  </Text>
                </View>
              </View>
            </View>

            {!saldoPositivo && saldoValor !== 0 && (
              <View style={{
                marginHorizontal: isDesktop ? 0 : 20,
                marginTop: 10,
                backgroundColor: '#FFF5F5',
                borderRadius: 12,
                padding: 14,
                borderLeftWidth: 3,
                borderLeftColor: colors.status.negative,
              }}>
                <Text style={{ color: colors.status.negative, fontSize: 13 }}>
                  Saldo negativo. Revise seus lancamentos.
                </Text>
              </View>
            )}

            {/* Card patrimônio total + carteiras */}
            {portfolios.length > 0 && (
              <TouchableOpacity
                style={{
                  marginHorizontal: isDesktop ? 0 : 20,
                  marginTop: isDesktop ? 0 : 12,
                  backgroundColor: colors.bg.card,
                  borderRadius: 20,
                  padding: 20,
                  borderWidth: 1,
                  borderColor: colors.bg.border,
                }}
                onPress={() => router.push('/(tabs)/investimentos' as any)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={sectionLabel}>Carteiras</Text>
                  <Text style={{ fontSize: 11, color: colors.accent.main }}>Ver tudo →</Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                      Investido
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: colors.accent.dark }}>
                      {formatarMoeda(totalInvestido)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                      P&L total
                    </Text>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: totalPl >= 0 ? colors.status.positive : colors.status.negative }}>
                      {totalPl >= 0 ? '+' : ''}{formatarMoeda(totalPl)}
                    </Text>
                  </View>
                </View>

                {/* Mini lista de carteiras */}
                {portfolios.map(p => {
                  const s = summaries[p.id]
                  if (!s) return null
                  return (
                    <View key={p.id} style={{
                      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                      paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.bg.border,
                    }}>
                      <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{p.name}</Text>
                      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '600' }}>
                          {formatarMoeda(s.totalMarketValue)}
                        </Text>
                        <Text style={{
                          fontSize: 12,
                          color: s.totalPl >= 0 ? colors.status.positive : colors.status.negative,
                        }}>
                          {s.totalPl >= 0 ? '+' : ''}{s.totalPlPercent.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  )
                })}

                {/* Patrimônio total */}
                <View style={{
                  marginTop: 12, paddingTop: 12,
                  borderTopWidth: 1, borderTopColor: colors.bg.border,
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase' }}>
                    Patrimônio total
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
                    {formatarMoeda(patrimonioTotal)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Coluna direita */}
          <View style={isDesktop ? { flex: 1, gap: 8 } : undefined}>
            {atividadeRecente.length > 0 && (
              <View style={{ marginHorizontal: isDesktop ? 0 : 20, marginTop: isDesktop ? 0 : 24 }}>
                <Text style={sectionLabel}>Atividade recente</Text>
                {atividadeRecente.map(msg => (
                  <View key={msg.id} style={{
                    backgroundColor: colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 8,
                    borderWidth: 1, borderColor: colors.bg.border,
                  }}>
                    <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{msg.conteudo}</Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 11, marginTop: 4 }}>
                      {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <View style={{ marginHorizontal: isDesktop ? 0 : 20, marginTop: isDesktop ? 0 : 24 }}>
              <Text style={sectionLabel}>Lancamentos recentes</Text>
              {lancamentos.length === 0 ? (
                <View style={{
                  backgroundColor: colors.bg.card, borderRadius: 16, padding: 24,
                  alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border,
                }}>
                  <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                    Nenhum lancamento este mes.
                  </Text>
                </View>
              ) : (
                lancamentos.slice(0, 8).map(lancamento => (
                  <SwipeableItem key={lancamento.id} onDelete={() => handleDeletar(lancamento.id)}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push(`/lancamento/${lancamento.id}` as any)}
                      style={{
                        backgroundColor: colors.bg.card, borderRadius: 14, padding: 16, marginBottom: 8,
                        flexDirection: 'row', alignItems: 'center',
                        borderWidth: 1, borderColor: colors.bg.border,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                          {lancamento.descricao}
                        </Text>
                        <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 3 }}>
                          {lancamento.categoria}
                          {lancamento.vencimento ? ` · dia ${lancamento.vencimento}` : ''}
                        </Text>
                      </View>
                      <Text style={{
                        fontWeight: '700', fontSize: 15,
                        color: lancamento.tipo === 'receita' ? colors.status.positive : colors.status.negative,
                      }}>
                        {lancamento.tipo === 'despesa' ? '-' : '+'}{formatarMoeda(lancamento.valor)}
                      </Text>
                    </TouchableOpacity>
                  </SwipeableItem>
                ))
              )}
            </View>
          </View>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}
