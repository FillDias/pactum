import { useCallback, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { PieChart, LineChart } from 'react-native-chart-kit'
import { useFinancasStore } from '../../store/financasStore'
import { usePortfolioStore } from '../../store/portfolioStore'
import { useMetasStore } from '../../store/metasStore'
import { calcularProgressoMeta } from '../../utils/calculators'
import { formatarMoeda } from '../../utils/formatters'
import { colors } from '../../constants/colors'
import { useResponsive } from '../../hooks/useResponsive'
import * as saldoService from '../../services/saldoService'

const CATEGORIA_CORES: Record<string, string> = {
  moradia:      '#4A90D9',
  alimentacao:  '#E67E22',
  transporte:   '#9B59B6',
  saude:        '#2D8A5E',
  educacao:     '#F39C12',
  lazer:        '#E74C3C',
  vestuario:    '#1ABC9C',
  outros:       '#95A5A6',
}

const PALETA = ['#4A90D9','#E67E22','#9B59B6','#2D8A5E','#F39C12','#E74C3C','#1ABC9C','#C8BFA8','#95A5A6']

function ultimosMeses(n: number): { mes: number; ano: number; label: string }[] {
  const LABELS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  const agora = new Date()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(agora.getFullYear(), agora.getMonth() - (n - 1 - i), 1)
    return { mes: d.getMonth() + 1, ano: d.getFullYear(), label: LABELS[d.getMonth()] }
  })
}

export default function Relatorio() {
  const { isDesktop } = useResponsive()
  const { width } = useWindowDimensions()

  const { lancamentos, mesSelecionado, anoSelecionado, buscarLancamentos } = useFinancasStore()
  const { portfolios, summaries, buscarPortfolios } = usePortfolioStore()
  const { metas, buscarMetas } = useMetasStore()

  const [historico, setHistorico] = useState<(Saldo & { label: string })[]>([])
  const [carregandoHist, setCarregandoHist] = useState(false)

  const meses = ultimosMeses(6)

  const carregarHistorico = useCallback(async () => {
    setCarregandoHist(true)
    try {
      const resultados = await Promise.all(
        meses.map(m => saldoService.buscarSaldo(m.mes, m.ano).catch(() => null))
      )
      setHistorico(
        resultados.map((s, i) => ({
          label: meses[i].label,
          saldo: s?.saldo ?? 0,
          total_receitas: s?.total_receitas ?? 0,
          total_gastos: s?.total_gastos ?? 0,
          positivo: (s?.saldo ?? 0) >= 0,
        }))
      )
    } finally {
      setCarregandoHist(false)
    }
  }, [])

  const carregarPortfoliosComPosicoes = useCallback(async () => {
    await buscarPortfolios()
    const ids = usePortfolioStore.getState().portfolios.map(p => p.id)
    await Promise.all(ids.map(id => usePortfolioStore.getState().buscarPosicoes(id)))
  }, [])

  useFocusEffect(
    useCallback(() => {
      buscarLancamentos()
      buscarMetas()
      carregarHistorico()
      carregarPortfoliosComPosicoes()
    }, [])
  )

  const despesas = lancamentos.filter(l => l.tipo === 'despesa')
  const receitas = lancamentos.filter(l => l.tipo === 'receita')

  const totalDespesas = despesas.reduce((s, l) => s + l.valor, 0)
  const totalReceitas = receitas.reduce((s, l) => s + l.valor, 0)
  const saldoMes = totalReceitas - totalDespesas

  const totalInvestido = Object.values(summaries).reduce((s, p) => s + p.totalMarketValue, 0)
  const totalPatrimonio = saldoMes + totalInvestido

  // Gastos por categoria
  const porCategoria = despesas.reduce<Record<string, number>>((acc, l) => {
    acc[l.categoria] = (acc[l.categoria] ?? 0) + l.valor
    return acc
  }, {})
  const pieData = Object.entries(porCategoria)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, val], i) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      population: Math.round(val),
      color: CATEGORIA_CORES[cat] ?? PALETA[i % PALETA.length],
      legendFontColor: colors.text.secondary,
      legendFontSize: 11,
    }))

  const chartWidth = isDesktop ? Math.min(width - 280, 680) : width - 48

  const sectionLabel = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  }

  const cardStyle = {
    backgroundColor: colors.bg.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.bg.border,
    marginBottom: 16,
  }

  const lineData = {
    labels: historico.map(h => h.label),
    datasets: [
      {
        data: historico.length > 0 ? historico.map(h => h.total_receitas) : [0],
        color: () => colors.status.positive,
        strokeWidth: 2,
      },
      {
        data: historico.length > 0 ? historico.map(h => h.total_gastos) : [0],
        color: () => colors.status.negative,
        strokeWidth: 2,
      },
    ],
    legend: ['Receitas', 'Despesas'],
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

      <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary }}>Relatório</Text>
        <Text style={{ color: colors.text.tertiary, fontSize: 13, marginTop: 2 }}>
          Visão geral financeira
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop
          ? { alignSelf: 'center', width: '100%', maxWidth: 720, paddingHorizontal: 24 }
          : { paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
      >

        {/* --- 1. Resumo patrimonial --- */}
        <View style={cardStyle}>
          <Text style={sectionLabel}>Patrimônio total</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text.primary, marginBottom: 16 }}>
            {formatarMoeda(totalPatrimonio)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12 }}>
              <Text style={{ ...sectionLabel, marginBottom: 4 }}>Saldo do mês</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: saldoMes >= 0 ? colors.status.positive : colors.status.negative }}>
                {formatarMoeda(saldoMes)}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12 }}>
              <Text style={{ ...sectionLabel, marginBottom: 4 }}>Investido</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.accent.dark }}>
                {formatarMoeda(totalInvestido)}
              </Text>
              <Text style={{ fontSize: 11, color: colors.text.tertiary, marginTop: 2 }}>
                {portfolios.length} carteira{portfolios.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12 }}>
              <Text style={{ ...sectionLabel, marginBottom: 4 }}>Receitas</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.status.positive }}>
                {formatarMoeda(totalReceitas)}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12 }}>
              <Text style={{ ...sectionLabel, marginBottom: 4 }}>Despesas</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.status.negative }}>
                {formatarMoeda(totalDespesas)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- 2. Gastos por categoria --- */}
        <View style={cardStyle}>
          <Text style={sectionLabel}>Gastos por categoria</Text>
          {despesas.length === 0 ? (
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
              Nenhuma despesa no mês.
            </Text>
          ) : pieData.length > 0 ? (
            <>
              <PieChart
                data={pieData}
                width={chartWidth}
                height={180}
                chartConfig={{ color: () => colors.text.secondary, labelColor: () => colors.text.secondary }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="8"
                hasLegend
              />
              <View style={{ marginTop: 8, gap: 6 }}>
                {pieData.map(d => (
                  <View key={d.name} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: d.color }} />
                      <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{d.name}</Text>
                    </View>
                    <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '600' }}>
                      {formatarMoeda(d.population)}{' '}
                      <Text style={{ color: colors.text.tertiary, fontWeight: '400' }}>
                        ({totalDespesas > 0 ? ((d.population / totalDespesas) * 100).toFixed(1) : 0}%)
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </View>

        {/* --- 3. Evolução mensal --- */}
        <View style={cardStyle}>
          <Text style={sectionLabel}>Evolução mensal — últimos 6 meses</Text>
          {carregandoHist ? (
            <ActivityIndicator color={colors.accent.main} />
          ) : historico.length === 0 ? (
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Sem histórico.</Text>
          ) : (
            <>
              <LineChart
                data={lineData}
                width={chartWidth}
                height={180}
                chartConfig={{
                  backgroundGradientFrom: colors.bg.card,
                  backgroundGradientTo: colors.bg.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(13,13,13,${opacity})`,
                  labelColor: () => colors.text.tertiary,
                  propsForDots: { r: '3' },
                  propsForBackgroundLines: { stroke: colors.bg.border },
                }}
                bezier
                withInnerLines
                withOuterLines={false}
                style={{ marginLeft: -16, borderRadius: 8 }}
              />
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 12, height: 3, backgroundColor: colors.status.positive, borderRadius: 2 }} />
                  <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Receitas</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 12, height: 3, backgroundColor: colors.status.negative, borderRadius: 2 }} />
                  <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>Despesas</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* --- 4. Performance carteiras --- */}
        {portfolios.length > 0 && (
          <View style={cardStyle}>
            <Text style={sectionLabel}>Carteiras de investimento</Text>
            {portfolios.map(p => {
              const s = summaries[p.id]
              if (!s) return null
              return (
                <View key={p.id} style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1, borderBottomColor: colors.bg.border,
                }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14 }}>{p.name}</Text>
                    <Text style={{ color: colors.text.tertiary, fontSize: 12 }}>
                      {s.positions.length} ativo{s.positions.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: 14 }}>
                      {formatarMoeda(s.totalMarketValue)}
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: s.totalPl >= 0 ? colors.status.positive : colors.status.negative,
                    }}>
                      {s.totalPl >= 0 ? '+' : ''}{s.totalPlPercent.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              )
            })}
          </View>
        )}

        {/* --- 5. Metas --- */}
        {metas.length > 0 && (
          <View style={cardStyle}>
            <Text style={sectionLabel}>Metas</Text>
            {metas.map(meta => {
              const progresso = calcularProgressoMeta(meta.valor_atual, meta.valor_alvo)
              return (
                <View key={meta.id} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14, flex: 1 }}>
                      {meta.titulo}
                    </Text>
                    <Text style={{ color: colors.accent.dark, fontWeight: '700', fontSize: 14 }}>
                      {progresso.toFixed(0)}%
                    </Text>
                  </View>
                  <View style={{ backgroundColor: colors.bg.secondary, borderRadius: 6, height: 6 }}>
                    <View style={{
                      backgroundColor: colors.accent.main,
                      borderRadius: 6,
                      height: 6,
                      width: `${progresso}%`,
                    }} />
                  </View>
                  <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>
                    {formatarMoeda(meta.valor_atual)} de {formatarMoeda(meta.valor_alvo)}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}
