import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { colors } from '../../constants/colors'
import api from '../../config/api'

export default function VerifyEmail() {
  const [token, setToken]       = useState('')
  const [salvando, setSalvando] = useState(false)

  const handleVerificar = async () => {
    if (!token.trim()) return
    setSalvando(true)
    try {
      await api.get(`/auth/verify_email?token=${token.trim()}`)
      Alert.alert('Email verificado!', 'Sua conta está ativa.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ])
    } catch (err: any) {
      Alert.alert('Erro', err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg.primary }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 8 }}>
          Verifique seu email
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: 14, marginBottom: 32 }}>
          Enviamos um código de verificação para o seu email.
          {'\n'}Cole o código abaixo para ativar sua conta.
          {'\n\n'}Em desenvolvimento: o código aparece no log do servidor Rails.
        </Text>

        <View style={{ gap: 12 }}>
          <TextInput
            style={{
              backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.bg.border,
              borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
              fontSize: 15, color: colors.text.primary,
            }}
            placeholder="Código de verificação"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />

          <TouchableOpacity
            style={{
              backgroundColor: colors.accent.main, borderRadius: 12,
              paddingVertical: 16, alignItems: 'center',
            }}
            onPress={handleVerificar}
            disabled={salvando || !token.trim()}
          >
            {salvando
              ? <ActivityIndicator color={colors.text.inverse} />
              : <Text style={{ color: colors.text.inverse, fontWeight: '700', fontSize: 15 }}>
                  Verificar email
                </Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingVertical: 12, alignItems: 'center' }}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={{ color: colors.text.tertiary, fontSize: 13 }}>
              Verificar depois
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
