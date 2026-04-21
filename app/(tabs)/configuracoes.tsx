// Tela de configurações — perfil, casal e logout
import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native'
import { useAuthStore } from '../../store/authStore'

export default function Configuracoes() {
  const { usuario, casal, logout, vincularConjuge, carregando, erro } =
    useAuthStore()
  const [modalVisivel, setModalVisivel] = useState(false)
  const [emailConjuge, setEmailConjuge] = useState('')

  const handleVincular = async () => {
    if (!emailConjuge) {
      Alert.alert('Atenção', 'Digite o email do cônjuge')
      return
    }
    await vincularConjuge(emailConjuge)
    if (!erro) {
      setModalVisivel(false)
      setEmailConjuge('')
      Alert.alert('✅ Sucesso', 'Casal vinculado com sucesso!')
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout },
      ]
    )
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-900 px-6 pt-14 pb-6">
        <Text className="text-white text-xl font-bold">
          Configurações ⚙️
        </Text>
      </View>

      <View className="mx-4 mt-4 gap-3">
        {/* Perfil */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-xs mb-1">Logado como</Text>
          <Text className="text-gray-800 font-bold">{usuario?.nome}</Text>
          <Text className="text-gray-400 text-sm">{usuario?.email}</Text>
        </View>

        {/* Casal */}
        <View className="bg-white rounded-2xl p-4">
          <Text className="text-gray-500 text-xs mb-2">Casal</Text>
          {casal ? (
            <View>
              <Text className="text-green-600 font-medium">
                ✅ Casal vinculado ao Pactum
              </Text>
              <Text className="text-gray-400 text-xs mt-1">
                ID: {casal.id.slice(0, 8)}...
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              className="bg-indigo-900 rounded-xl py-3 items-center"
              onPress={() => setModalVisivel(true)}
            >
              <Text className="text-white font-bold">
                Vincular cônjuge
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="bg-red-50 rounded-2xl p-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-red-500 font-bold">Sair da conta</Text>
        </TouchableOpacity>
      </View>

      {/* Modal vincular cônjuge */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-800 text-lg font-bold mb-1">
              Vincular cônjuge
            </Text>
            <Text className="text-gray-400 text-sm mb-6">
              Digite o email cadastrado do seu cônjuge
            </Text>

            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base"
              placeholder="email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailConjuge}
              onChangeText={setEmailConjuge}
              autoFocus
            />

            {erro && (
              <Text className="text-red-500 text-sm mb-3">{erro}</Text>
            )}

            <TouchableOpacity
              className="bg-indigo-900 rounded-xl py-4 items-center mb-3"
              onPress={handleVincular}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold">Vincular</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="py-3 items-center"
              onPress={() => {
                setModalVisivel(false)
                setEmailConjuge('')
              }}
            >
              <Text className="text-gray-400">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
