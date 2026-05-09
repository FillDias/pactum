import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { colors } from '../../constants/colors'
import api from '../../config/api'
import { useAuthStore } from '../../store/authStore'

export default function ResetPassword() {
  const [token, setToken]           = useState('')
  const [senha, setSenha]           = useState('')
  const [confirma, setConfirma]     = useState('')
  const [salvando, setSalvando]     = useState(false)

  const handleRedefinir = async () => {
    if (!token.trim()) { Alert.alert('Atencao', 'Informe o codigo recebido'); return }
    if (senha.length < 6) { Alert.alert('Atencao', 'Senha deve ter ao menos 6 caracteres'); return }
    if (senha !== confirma) { Alert.alert('Atencao', 'As senhas nao coincidem'); return }

    setSalvando(true)
    try {
      const data = await api.post('/auth/reset_password', { token: token.trim(), password: senha })
      await api.saveToken(data.token)
      if (data.refresh_token) await api.saveRefreshToken(data.refresh_token)
      Alert.alert('Sucesso', 'Senha redefinida com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ])
    } catch (err: any) {
      Alert.alert('Erro', err.message)
    } finally {
      setSalvando(false)
    }
  }

  const inputStyle = {
    backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.bg.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: colors.text.primary,
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 420, paddingHorizontal: 28 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ color: colors.accent.main, fontSize: 14 }}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 8 }}>
          Nova senha
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: 14, marginBottom: 32 }}>
          Cole o código recebido no email e escolha uma nova senha.
        </Text>

        <View style={{ gap: 12 }}>
          <TextInput
            style={inputStyle}
            placeholder="Código do email"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />
          <TextInput
            style={inputStyle}
            placeholder="Nova senha (min. 6 caracteres)"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
          />
          <TextInput
            style={inputStyle}
            placeholder="Confirmar nova senha"
            placeholderTextColor={colors.text.tertiary}
            secureTextEntry
            value={confirma}
            onChangeText={setConfirma}
          />

          <TouchableOpacity
            style={{
              backgroundColor: colors.accent.main, borderRadius: 12,
              paddingVertical: 16, alignItems: 'center', marginTop: 8,
            }}
            onPress={handleRedefinir}
            disabled={salvando}
          >
            {salvando
              ? <ActivityIndicator color={colors.text.inverse} />
              : <Text style={{ color: colors.text.inverse, fontWeight: '700', fontSize: 15 }}>
                  Redefinir senha
                </Text>
            }
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
