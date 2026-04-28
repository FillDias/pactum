import { useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import { PieChart } from 'react-native-chart-kit'
import { Lancamento } from '../../types'
import { colors } from '../../constants/colors'
import { formatarMoeda } from '../../utils/formatters'

const { width: screenWidth } = Dimensions.get('window')

const CATEGORIA_CORES: Record<string, string> = {
  Transporte: '#4A90D9',
  Alimentacao: '#3D9E6E',
  'Alimentação': '#3D9E6E',
  Moradia: '#C8BFA8',
  Saude: '#C94F4F',
  'Saúde': '#C94F4F',
  Educacao: '#9B59B6',
  'Educação': '#9B59B6',
  Lazer: '#F39C12',
  Cartao: '#E67E22',
  'Cartão': '#E67E22',
  Investimento: '#2ECC71',
  Outros: '#7F8C8D',
}

type Props = {
  lancamentos: Lancamento[]
}

export default function GraficoGastos({ lancamentos }: Props) {
  const dados = useMemo(() => {
    const despesas = lancamentos.filter(l => l.tipo === 'despesa')
    if (despesas.length === 0) return []

    const agrupado: Record<string, number> = {}
    for (const l of despesas) {
      agrupado[l.categoria] = (agrupado[l.categoria] ?? 0) + l.valor
    }

    const total = Object.values(agrupado).reduce((s, v) => s + v, 0)

    return Object.entries(agrupado)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: (valor / total) * 100,
        cor: CATEGORIA_CORES[nome] ?? '#555555',
      }))
      .sort((a, b) => b.valor - a.valor)
  }, [lancamentos])

  if (dados.length === 0) {
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
          Nenhuma despesa este mes
        </Text>
      </View>
    )
  }

  const pieData = dados.map(d => ({
    name: d.nome,
    population: Math.round(d.valor),
    color: d.cor,
    legendFontColor: colors.text.secondary,
    legendFontSize: 11,
  }))

  return (
    <View>
      <PieChart
        data={pieData}
        width={screenWidth - 40}
        height={180}
        chartConfig={{ color: () => colors.text.secondary }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="16"
        hasLegend={false}
      />

      <View style={{ marginTop: 8 }}>
        {dados.map((d, i) => (
          <View
            key={d.nome}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: colors.bg.border,
            }}
          >
            <View style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: d.cor,
              marginRight: 10,
            }} />
            <Text style={{
              flex: 1,
              color: colors.text.secondary,
              fontSize: 13,
            }}>
              {d.nome}
            </Text>
            <Text style={{
              color: colors.text.primary,
              fontSize: 13,
              fontWeight: '600',
            }}>
              {formatarMoeda(d.valor)}
            </Text>
            <Text style={{
              color: colors.text.tertiary,
              fontSize: 12,
              marginLeft: 10,
              width: 44,
              textAlign: 'right',
            }}>
              {d.percentual.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
