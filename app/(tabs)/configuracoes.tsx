import { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { colors } from '../../constants/colors'

function MenuItem({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  label: string
  onPress: () => void
  destructive?: boolean
}) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 18,
        gap: 14,
        backgroundColor: colors.bg.card,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.bg.border,
      }}
      onPress={onPress}
    >
      <Feather
        name={icon}
        size={18}
        color={destructive ? colors.status.negative : colors.text.secondary}
      />
      <Text style={{
        flex: 1,
        color: destructive ? colors.status.negative : colors.text.primary,
        fontSize: 15,
        fontWeight: '500',
      }}>
        {label}
      </Text>
      {!destructive && (
        <Feather name="chevron-right" size={16} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  )
}

export default function Configuracoes() {
  const { usuario, familia, logout, convidarMembro, carregando, erro } =
    useAuthStore()
  const [modalVisivel, setModalVisivel] = useState(false)
  const [emailMembro, setEmailMembro] = useState('')
  const insets = useSafeAreaInsets()

  const handleConvidar = async () => {
    if (!emailMembro) {
      Alert.alert('Atencao', 'Digite o email do membro')
      return
    }
    await convidarMembro(emailMembro)
    if (!erro) {
      setModalVisivel(false)
      setEmailMembro('')
      Alert.alert('Sucesso', 'Convite enviado!')
    }
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ])
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.bg.primary,
      paddingTop: insets.top || 48,
    }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 28 }}>
          <Text style={{
            fontSize: 11,
            color: colors.text.tertiary,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
            Conta
          </Text>
          <Text style={{
            fontSize: 26,
            fontWeight: '700',
            color: colors.text.primary,
            marginTop: 4,
            letterSpacing: -0.3,
          }}>
            Configuracoes
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, gap: 12 }}>

          {/* Avatar e perfil */}
          <View style={{
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.bg.border,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
          }}>
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: colors.accent.main,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                color: colors.text.inverse,
                fontSize: 22,
                fontWeight: '700',
              }}>
                {usuario?.nome?.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                color: colors.text.primary,
                fontSize: 16,
                fontWeight: '600',
              }}>
                {usuario?.nome}
              </Text>
              <Text style={{
                color: colors.text.secondary,
                fontSize: 13,
                marginTop: 2,
              }}>
                {usuario?.email}
              </Text>
            </View>
          </View>

          {/* Familia */}
          <View style={{
            backgroundColor: colors.bg.card,
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{
              fontSize: 11,
              color: colors.text.tertiary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              Familia
            </Text>

            {familia ? (
              <View style={{ gap: 10 }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}>
                  <Feather
                    name="users"
                    size={16}
                    color={colors.status.positive}
                  />
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: 15,
                    fontWeight: '500',
                  }}>
                    {familia.nome}
                  </Text>
                </View>
                <Text style={{
                  color: colors.text.secondary,
                  fontSize: 13,
                }}>
                  {familia.membros?.length ?? 0} membro(s) vinculado(s)
                </Text>
                <TouchableOpacity
                  style={{
                    marginTop: 6,
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: colors.bg.input,
                    borderWidth: 1,
                    borderColor: colors.bg.border,
                  }}
                  onPress={() => setModalVisivel(true)}
                >
                  <Text style={{
                    color: colors.accent.main,
                    fontWeight: '600',
                    fontSize: 14,
                  }}>
                    Convidar membro
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                  backgroundColor: colors.bg.input,
                  borderWidth: 1,
                  borderColor: colors.bg.border,
                }}
                onPress={() => setModalVisivel(true)}
              >
                <Text style={{
                  color: colors.accent.main,
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                  Criar familia
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Logout */}
          <MenuItem
            icon="log-out"
            label="Sair da conta"
            onPress={handleLogout}
            destructive
          />

          <View style={{ height: 32 }} />
        </View>
      </ScrollView>

      {/* Modal convidar */}
      <Modal
        visible={modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.75)',
        }}>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 24 + insets.bottom,
            borderTopWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{
              color: colors.text.primary,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 6,
            }}>
              {familia ? 'Convidar membro' : 'Criar familia'}
            </Text>
            <Text style={{
              color: colors.text.secondary,
              fontSize: 13,
              marginBottom: 20,
            }}>
              Digite o email do membro para convidar
            </Text>

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
                marginBottom: 12,
              }}
              placeholder="email@exemplo.com"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailMembro}
              onChangeText={setEmailMembro}
              autoFocus
            />

            {erro && (
              <Text style={{
                color: colors.status.negative,
                fontSize: 13,
                marginBottom: 12,
              }}>
                {erro}
              </Text>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: colors.accent.main,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12,
              }}
              onPress={handleConvidar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={{
                  color: colors.text.inverse,
                  fontWeight: '700',
                  fontSize: 15,
                }}>
                  Convidar
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={() => {
                setModalVisivel(false)
                setEmailMembro('')
              }}
            >
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
