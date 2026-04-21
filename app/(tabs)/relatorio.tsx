// Tela de relatório — metas e projeção de saldo
import { useEffect } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { useAuthStore } from '../../store/authStore'
import { useMetasStore } from '../../store/metasStore'
import { formatarMoeda } from '../../utils/formatters'
import { calcularProgressoMeta } from '../../utils/calculators'

const MESES_PROJECAO = ['Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function Relatorio() {
  const { casal } = useAuthStore()
  const { metas, buscarMetas } = useMetasStore()

  useEffect(() => {
    if (casal?.id) buscarMetas(casal.id)
  }, [casal])

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-900 px-6 pt-14 pb-6">
        <Text className="text-white text-xl font-bold">Relatório 📊</Text>
        <Text className="text-white opacity-70 text-sm">
          Visão geral do casal
        </Text>
      </View>

      <View className="mx-4 mt-4 gap-4">
        {/* Projeção mensal */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-700 font-bold mb-3">
            Projeção de saldo
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-3">
              {MESES_PROJECAO.map((mes, index) => (
                <View
                  key={mes}
                  className="bg-gray-50 rounded-xl p-3 items-center w-16"
                >
                  <Text className="text-gray-500 text-xs mb-1">{mes}</Text>
                  <Text
                    className={`text-sm font-bold ${
                      index === 0 ? 'text-orange-500' : 'text-green-600'
                    }`}
                  >
                    {index === 0 ? '~892' : `+${1400 + index * 200}`}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Metas */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-700 font-bold mb-3">
            Metas do casal 🎯
          </Text>

          {metas.length === 0 ? (
            <Text className="text-gray-400 text-center py-4">
              Nenhuma meta cadastrada ainda
            </Text>
          ) : (
            metas.map((meta) => {
              const progresso = calcularProgressoMeta(
                meta.valor_atual,
                meta.valor_alvo
              )
              return (
                <View key={meta.id} className="mb-4">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-800 font-medium">
                      {meta.titulo}
                    </Text>
                    <Text className="text-indigo-900 font-bold">
                      {progresso.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="bg-gray-100 rounded-full h-2">
                    <View
                      className="bg-indigo-900 rounded-full h-2"
                      style={{ width: `${progresso}%` }}
                    />
                  </View>
                  <Text className="text-gray-400 text-xs mt-1">
                    {formatarMoeda(meta.valor_atual)} de{' '}
                    {formatarMoeda(meta.valor_alvo)}
                  </Text>
                </View>
              )
            })
          )}
        </View>
      </View>

      <View className="h-6" />
    </ScrollView>
  )
}
