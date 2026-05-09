import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform, Alert,
} from 'react-native'
import { router } from 'expo-router'
import { colors } from '../../constants/colors'
import api from '../../config/api'

export default function ForgotPassword() {
  const [email, setEmail]       = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado]   = useState(false)

  const handleEnviar = async () => {
    if (!email.trim()) return
    setEnviando(true)
    try {
      await api.post('/auth/forgot_password', { email: email.trim().toLowerCase() })
      setEnviado(true)
    } catch {
      // sempre mostra sucesso para não revelar se email existe
      setEnviado(true)
    } finally {
      setEnviando(false)
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
          Recuperar senha
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: 14, marginBottom: 32 }}>
          Informe seu email e enviaremos as instruções.
        </Text>

        {enviado ? (
          <View style={{
            backgroundColor: colors.bg.card, borderRadius: 16, padding: 20,
            borderWidth: 1, borderColor: colors.bg.border, alignItems: 'center',
          }}>
            <Text style={{ color: colors.status.positive, fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
              Email enviado!
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
              Se este email estiver cadastrado, você receberá as instruções em breve.
              {'\n\n'}Em desenvolvimento: o código aparece no log do servidor Rails.
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/reset-password' as any)}>
              <Text style={{ color: colors.accent.main, fontWeight: '600', fontSize: 14 }}>
                Já tenho o código →
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <TextInput
              style={inputStyle}
              placeholder="Seu email"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TouchableOpacity
              style={{
                backgroundColor: colors.accent.main, borderRadius: 12,
                paddingVertical: 16, alignItems: 'center', marginTop: 8,
              }}
              onPress={handleEnviar}
              disabled={enviando || !email.trim()}
            >
              {enviando
                ? <ActivityIndicator color={colors.text.inverse} />
                : <Text style={{ color: colors.text.inverse, fontWeight: '700', fontSize: 15 }}>
                    Enviar instruções
                  </Text>
              }
            </TouchableOpacity>
          </View>
        )}
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
