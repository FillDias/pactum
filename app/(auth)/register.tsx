// Tela de cadastro — criação de conta
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

export default function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const { register, carregando, erro, limparErro } = useAuthStore()

  const handleRegister = async () => {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos')
      return
    }
    if (senha.length < 6) {
      Alert.alert('Atenção', 'Senha deve ter no mínimo 6 caracteres')
      return
    }
    await register(nome, email, senha)
    if (!erro) router.replace('/(tabs)')
  }

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="text-3xl font-bold text-center text-indigo-900 mb-2">
        Pactum
      </Text>
      <Text className="text-center text-gray-500 mb-10">
        crie sua conta
      </Text>

      <TextInput
        className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base"
        placeholder="Seu nome"
        value={nome}
        onChangeText={setNome}
      />

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
        placeholder="Senha (mínimo 6 caracteres)"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      {erro && (
        <Text className="text-red-500 text-center mb-4">{erro}</Text>
      )}

      <TouchableOpacity
        className="bg-indigo-900 rounded-xl py-4 items-center mb-4"
        onPress={handleRegister}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">
            Criar conta
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          limparErro()
          router.back()
        }}
      >
        <Text className="text-center text-indigo-900">
          Já tem conta? Entrar
        </Text>
      </TouchableOpacity>
    </View>
  )
}
