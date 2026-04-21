// Tela de lançamentos — formulário de receitas e despesas
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '../../store/authStore'
import { useFinancasStore } from '../../store/financasStore'
import { CATEGORIAS, VENCIMENTOS } from '../../constants/categories'

export default function Lancamento() {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState<'despesa' | 'receita'>('despesa')
  const [categoria, setCategoria] = useState(CATEGORIAS[0].nome)
  const [vencimento, setVencimento] = useState(5)
  const [recorrente, setRecorrente] = useState(false)

  const { usuario, casal } = useAuthStore()
  const { adicionarLancamento, carregando, mesSelecionado, anoSelecionado } =
    useFinancasStore()

  const handleSalvar = async () => {
    if (!descricao || !valor) {
      Alert.alert('Atenção', 'Preencha descrição e valor')
      return
    }
    if (!casal?.id || !usuario?.id) {
      Alert.alert('Atenção', 'Você precisa estar vinculado a um casal')
      return
    }

    await adicionarLancamento({
      casal_id: casal.id,
      usuario_id: usuario.id,
      descricao,
      valor: parseFloat(valor.replace(',', '.')),
      tipo,
      categoria,
      vencimento,
      mes: mesSelecionado,
      ano: anoSelecionado,
      recorrente,
    })

    setDescricao('')
    setValor('')
    setTipo('despesa')
    setCategoria(CATEGORIAS[0].nome)
    setVencimento(5)
    setRecorrente(false)

    Alert.alert('✅ Sucesso', 'Lançamento adicionado!')
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-900 px-6 pt-14 pb-6">
        <Text className="text-white text-xl font-bold">
          Novo lançamento ➕
        </Text>
      </View>

      <View className="mx-4 mt-4 gap-4">
        {/* Tipo */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-sm mb-3">Tipo</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                tipo === 'despesa' ? 'bg-red-500' : 'bg-gray-100'
              }`}
              onPress={() => setTipo('despesa')}
            >
              <Text
                className={
                  tipo === 'despesa' ? 'text-white font-bold' : 'text-gray-500'
                }
              >
                💸 Despesa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl items-center ${
                tipo === 'receita' ? 'bg-green-500' : 'bg-gray-100'
              }`}
              onPress={() => setTipo('receita')}
            >
              <Text
                className={
                  tipo === 'receita' ? 'text-white font-bold' : 'text-gray-500'
                }
              >
                💰 Receita
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Descrição e valor */}
        <View className="bg-white rounded-2xl p-4 gap-3">
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
            placeholder="Descrição ex: Gasolina"
            value={descricao}
            onChangeText={setDescricao}
          />
          <TextInput
            className="border border-gray-200 rounded-xl px-4 py-3 text-base"
            placeholder="Valor ex: 830,00"
            keyboardType="decimal-pad"
            value={valor}
            onChangeText={setValor}
          />
        </View>

        {/* Categoria */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-sm mb-3">Categoria</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className={`px-4 py-2 rounded-full border ${
                    categoria === cat.nome
                      ? 'bg-indigo-900 border-indigo-900'
                      : 'bg-white border-gray-200'
                  }`}
                  onPress={() => setCategoria(cat.nome)}
                >
                  <Text
                    className={
                      categoria === cat.nome ? 'text-white' : 'text-gray-600'
                    }
                  >
                    {cat.icone} {cat.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Vencimento */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-sm mb-3">
            Dia de vencimento
          </Text>
          <View className="flex-row gap-3">
            {VENCIMENTOS.map((dia) => (
              <TouchableOpacity
                key={dia}
                className={`flex-1 py-3 rounded-xl items-center ${
                  vencimento === dia ? 'bg-indigo-900' : 'bg-gray-100'
                }`}
                onPress={() => setVencimento(dia)}
              >
                <Text
                  className={
                    vencimento === dia
                      ? 'text-white font-bold'
                      : 'text-gray-500'
                  }
                >
                  Dia {dia}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recorrente */}
        <TouchableOpacity
          className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
          onPress={() => setRecorrente(!recorrente)}
        >
          <View>
            <Text className="text-gray-800 font-medium">
              Lançamento recorrente
            </Text>
            <Text className="text-gray-400 text-sm">Repete todo mês</Text>
          </View>
          <View
            className={`w-12 h-6 rounded-full ${
              recorrente ? 'bg-indigo-900' : 'bg-gray-200'
            }`}
          >
            <View
              className={`w-6 h-6 rounded-full bg-white shadow-sm ${
                recorrente ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </View>
        </TouchableOpacity>

        {/* Botão salvar */}
        <TouchableOpacity
          className="bg-indigo-900 rounded-2xl py-4 items-center mb-6"
          onPress={handleSalvar}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Salvar lançamento
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
