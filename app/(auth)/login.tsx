import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { colors } from '../../constants/colors'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const { login, carregando, erro, limparErro } = useAuthStore()

  const handleLogin = async () => {
    if (!email || !senha) return
    await login(email, senha)
    if (!erro) router.replace('/(tabs)')
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center' }}>
          <View style={{ marginBottom: 48 }}>
            <Text style={{
              fontSize: 36,
              fontWeight: '700',
              color: colors.text.primary,
              letterSpacing: 2,
            }}>
              PACTUM
            </Text>
            <Text style={{
              fontSize: 14,
              color: colors.text.secondary,
              marginTop: 6,
              letterSpacing: 1,
            }}>
              suas financas, um acordo so
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <TextInput
              style={{
                backgroundColor: colors.bg.input,
                borderWidth: 1,
                borderColor: colors.bg.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: colors.text.primary,
              }}
              placeholder="Email"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(t) => { setEmail(t); limparErro() }}
            />

            <TextInput
              style={{
                backgroundColor: colors.bg.input,
                borderWidth: 1,
                borderColor: colors.bg.border,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 15,
                color: colors.text.primary,
              }}
              placeholder="Senha"
              placeholderTextColor={colors.text.tertiary}
              secureTextEntry
              value={senha}
              onChangeText={(t) => { setSenha(t); limparErro() }}
            />

            {erro && (
              <Text style={{ color: colors.status.negative, fontSize: 13 }}>
                {erro}
              </Text>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: colors.accent.main,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 8,
              }}
              onPress={handleLogin}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={{
                  color: colors.text.inverse,
                  fontWeight: '700',
                  fontSize: 15,
                  letterSpacing: 0.5,
                }}>
                  Entrar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={() => { limparErro(); router.push('/(auth)/register') }}
            >
              <Text style={{ color: colors.text.secondary, fontSize: 14 }}>
                Nao tem conta?{' '}
                <Text style={{ color: colors.accent.main }}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
