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
  Platform,
} from 'react-native'
import { useResponsive } from '../../hooks/useResponsive'
import { Feather } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuthStore } from '../../store/authStore'
import { colors } from '../../constants/colors'

type ModalModo = 'criar_familia' | 'convidar' | null

function MenuItem({
  icon,
  label,
  sublabel,
  onPress,
  destructive = false,
}: {
  icon: React.ComponentProps<typeof Feather>['name']
  label: string
  sublabel?: string
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
      <View style={{ flex: 1 }}>
        <Text style={{
          color: destructive ? colors.status.negative : colors.text.primary,
          fontSize: 15,
          fontWeight: '500',
        }}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 1 }}>
            {sublabel}
          </Text>
        ) : null}
      </View>
      {!destructive && (
        <Feather name="chevron-right" size={16} color={colors.text.tertiary} />
      )}
    </TouchableOpacity>
  )
}

export default function Configuracoes() {
  const { isDesktop } = useResponsive()
  const { usuario, familia, logout, criarFamilia, convidarMembro, carregando, erro, limparErro } =
    useAuthStore()
  const [modalModo, setModalModo] = useState<ModalModo>(null)
  const [nomeFamilia, setNomeFamilia] = useState('')
  const [emailMembro, setEmailMembro] = useState('')
  const insets = useSafeAreaInsets()

  const abrirModal = (modo: ModalModo) => {
    limparErro()
    setModalModo(modo)
  }

  const fecharModal = () => {
    setModalModo(null)
    setNomeFamilia('')
    setEmailMembro('')
  }

  const handleCriarFamilia = async () => {
    if (!nomeFamilia.trim()) {
      Alert.alert('Atencao', 'Digite o nome da familia')
      return
    }
    await criarFamilia(nomeFamilia.trim())
    if (!useAuthStore.getState().erro) {
      fecharModal()
      Alert.alert('Sucesso', 'Familia criada!')
    }
  }

  const handleConvidar = async () => {
    if (!emailMembro.trim()) {
      Alert.alert('Atencao', 'Digite o email do membro')
      return
    }
    await convidarMembro(emailMembro.trim())
    if (!useAuthStore.getState().erro) {
      fecharModal()
      Alert.alert('Sucesso', 'Convite enviado!')
    }
  }

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ])
  }

  const sectionLabel = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: colors.bg.primary,
      paddingTop: Platform.OS === 'web' ? 24 : (insets.top || 48),
    }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={isDesktop ? { alignSelf: 'center', width: '100%', maxWidth: 500 } : undefined}>

          {/* Header */}
          <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
            <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Conta
            </Text>
            <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text.primary, marginTop: 4 }}>
              Configuracoes
            </Text>
          </View>

          <View style={{ paddingHorizontal: 20, gap: 12 }}>

            {/* Perfil */}
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
                <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>
                  {usuario?.nome?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>
                  {usuario?.nome}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 13, marginTop: 2 }}>
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
              <Text style={sectionLabel}>Familia</Text>

              {familia ? (
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="users" size={16} color={colors.status.positive} />
                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600' }}>
                      {familia.nome}
                    </Text>
                  </View>

                  {/* Lista de membros */}
                  {familia.membros && familia.membros.length > 0 && (
                    <View style={{ gap: 8 }}>
                      {familia.membros.map(m => (
                        <View key={m.id} style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          backgroundColor: colors.bg.secondary,
                          borderRadius: 10,
                          padding: 10,
                        }}>
                          <View style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: m.papel === 'dono' ? colors.accent.main : colors.bg.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>
                              {(m.usuario?.nome ?? m.user_id).charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '500' }}>
                              {m.usuario?.nome ?? 'Membro'}
                            </Text>
                            <Text style={{ color: colors.text.tertiary, fontSize: 11 }}>
                              {m.usuario?.email ?? ''}
                            </Text>
                          </View>
                          {m.papel === 'dono' && (
                            <View style={{
                              backgroundColor: colors.accent.main + '33',
                              borderRadius: 4,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                            }}>
                              <Text style={{ color: colors.accent.dark, fontSize: 10, fontWeight: '700' }}>
                                DONO
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={{
                      paddingVertical: 12,
                      borderRadius: 10,
                      alignItems: 'center',
                      backgroundColor: colors.bg.input,
                      borderWidth: 1,
                      borderColor: colors.bg.border,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                    onPress={() => abrirModal('convidar')}
                  >
                    <Feather name="user-plus" size={14} color={colors.accent.dark} />
                    <Text style={{ color: colors.accent.dark, fontWeight: '600', fontSize: 14 }}>
                      Convidar membro
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    paddingVertical: 14,
                    borderRadius: 10,
                    alignItems: 'center',
                    backgroundColor: colors.accent.main + '22',
                    borderWidth: 1,
                    borderColor: colors.accent.main + '55',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onPress={() => abrirModal('criar_familia')}
                >
                  <Feather name="users" size={14} color={colors.accent.dark} />
                  <Text style={{ color: colors.accent.dark, fontWeight: '600', fontSize: 14 }}>
                    Criar familia
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Acoes */}
            <MenuItem
              icon="log-out"
              label="Sair da conta"
              sublabel={usuario?.email ?? ''}
              onPress={handleLogout}
              destructive
            />

            <View style={{ height: 32 }} />
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalModo !== null}
        transparent
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 24,
            paddingBottom: 24 + insets.bottom,
            borderTopWidth: 1,
            borderColor: colors.bg.border,
          }}>
            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 6 }}>
              {modalModo === 'criar_familia' ? 'Criar familia' : 'Convidar membro'}
            </Text>
            <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 20 }}>
              {modalModo === 'criar_familia'
                ? 'Escolha um nome para sua familia'
                : 'Digite o email do membro para convidar'}
            </Text>

            {modalModo === 'criar_familia' ? (
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
                placeholder="Nome da familia ex: Familia Silva"
                placeholderTextColor={colors.text.tertiary}
                value={nomeFamilia}
                onChangeText={setNomeFamilia}
                autoFocus
              />
            ) : (
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
            )}

            {erro ? (
              <Text style={{ color: colors.status.negative, fontSize: 13, marginBottom: 12 }}>
                {erro}
              </Text>
            ) : null}

            <TouchableOpacity
              style={{
                backgroundColor: colors.accent.main,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                marginBottom: 12,
              }}
              onPress={modalModo === 'criar_familia' ? handleCriarFamilia : handleConvidar}
              disabled={carregando}
            >
              {carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  {modalModo === 'criar_familia' ? 'Criar' : 'Convidar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={fecharModal}
            >
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
