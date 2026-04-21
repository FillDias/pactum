// Tela inicial — saldo familiar e lançamentos recentes
import { useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '../../store/authStore'
import { useFinancasStore } from '../../store/financasStore'
import { formatarMoeda, formatarMesAno } from '../../utils/formatters'

export default function Inicio() {
  const { usuario, casal } = useAuthStore()
  const {
    lancamentos,
    carregando,
    mesSelecionado,
    anoSelecionado,
    saldoFamiliar,
    saldoPorUsuario,
    buscarLancamentos,
  } = useFinancasStore()

  useEffect(() => {
    if (casal?.id) buscarLancamentos(casal.id)
  }, [casal, mesSelecionado, anoSelecionado])

  const saldo = saldoFamiliar()
  const saldoPositivo = saldo >= 0
  const saldoEu = saldoPorUsuario(usuario?.id ?? '')
  const saldoConjuge = saldoPorUsuario(
    usuario?.id === casal?.usuario1_id ? casal?.usuario2_id ?? '' : casal?.usuario1_id ?? ''
  )

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-900 px-6 pt-14 pb-6">
        <Text className="text-white opacity-70 text-sm">
          Olá, {usuario?.nome} 👋
        </Text>
        <Text className="text-white text-xl font-bold mt-1">
          {formatarMesAno(mesSelecionado, anoSelecionado)}
        </Text>
      </View>

      {/* Card de saldo */}
      <View className="mx-4 -mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-gray-500 text-sm mb-1">Saldo familiar</Text>
        <Text
          className={`text-3xl font-bold ${
            saldoPositivo ? 'text-green-600' : 'text-red-500'
          }`}
        >
          {formatarMoeda(saldo)}
        </Text>

        <View className="flex-row mt-4 gap-3">
          <View className="flex-1 bg-blue-50 rounded-xl p-3">
            <Text className="text-blue-900 text-xs mb-1">Você</Text>
            <Text className="text-blue-900 font-bold">
              {formatarMoeda(saldoEu)}
            </Text>
          </View>
          <View className="flex-1 bg-purple-50 rounded-xl p-3">
            <Text className="text-purple-900 text-xs mb-1">Cônjuge</Text>
            <Text className="text-purple-900 font-bold">
              {formatarMoeda(saldoConjuge)}
            </Text>
          </View>
        </View>
      </View>

      {/* Alerta saldo negativo */}
      {!saldoPositivo && (
        <View className="mx-4 mt-3 bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
          <Text className="text-red-700 text-sm">
            ⚠️ Saldo negativo este mês. Revise os lançamentos.
          </Text>
        </View>
      )}

      {/* Lançamentos recentes */}
      <View className="mx-4 mt-4">
        <Text className="text-gray-700 font-bold mb-3">
          Lançamentos recentes
        </Text>

        {carregando ? (
          <ActivityIndicator color="#1e1b4b" />
        ) : lancamentos.length === 0 ? (
          <View className="bg-white rounded-2xl p-6 items-center">
            <Text className="text-gray-400 text-center">
              Nenhum lançamento este mês.{'\n'}
              Toque em ➕ para adicionar.
            </Text>
          </View>
        ) : (
          lancamentos.slice(0, 10).map((lancamento) => (
            <View
              key={lancamento.id}
              className="bg-white rounded-xl p-4 mb-2 flex-row items-center"
            >
              <View className="flex-1">
                <Text className="text-gray-800 font-medium">
                  {lancamento.descricao}
                </Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {lancamento.categoria} · dia {lancamento.vencimento}
                </Text>
              </View>
              <Text
                className={`font-bold ${
                  lancamento.tipo === 'receita'
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {lancamento.tipo === 'despesa' ? '-' : '+'}
                {formatarMoeda(lancamento.valor)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View className="h-6" />
    </ScrollView>
  )
}
