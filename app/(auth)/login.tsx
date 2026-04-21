// Tela de login — entrada com email e senha
import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/authStore'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const { login, carregando, erro, limparErro } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha')
      return
    }
    await login(email, senha)
    if (!erro) router.replace('/(tabs)')
  }

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-center text-indigo-900 mb-2">
        Pactum
      </Text>
      <Text className="text-center text-gray-500 mb-10">
        suas finanças, um acordo só
      </Text>

      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base"
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-6 text-base"
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {erro && (
        <Text className="text-red-500 text-center mb-4">{erro}</Text>
      )}

      <TouchableOpacity
        className="bg-indigo-900 rounded-xl py-4 items-center mb-4"
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">Entrar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          limparErro()
          router.push('/(auth)/register')
        }}
      >
        <Text className="text-center text-indigo-900">
          Não tem conta? Cadastre-se
        </Text>
      </TouchableOpacity>
    </View>
  )
}
