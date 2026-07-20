import { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useFocusEffect } from '@react-navigation/native'
import { colors } from '../../constants/colors'
import { useResponsive } from '../../hooks/useResponsive'
import { useInvestimentosViewModel } from '../../viewmodels/useInvestimentosViewModel'

const MOEDAS = ['BRL', 'USD', 'EUR']

export default function Investimentos() {
  const { isDesktop } = useResponsive()
  const router = useRouter()
  const vm = useInvestimentosViewModel()

  useFocusEffect(
    useCallback(() => {
      vm.buscarPortfolios()
    }, [])
  )

  const sectionLabel = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 16 }}>
        <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Patrimonio
        </Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, marginTop: 4 }}>
          Carteiras
        </Text>

        {vm.portfolios.length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.bg.border }}>
              <Text style={sectionLabel}>Total investido</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.accent.main }}>
                {vm.formatarMoeda(vm.totalPatrimonio)}
              </Text>
            </View>
            <View style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.bg.border }}>
              <Text style={sectionLabel}>P&L total</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: vm.plColor(vm.totalPL) }}>
                {vm.totalPL >= 0 ? '+' : ''}{vm.formatarMoeda(vm.totalPL)}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop
          ? { alignSelf: 'center', width: '100%', maxWidth: 720, paddingHorizontal: 20 }
          : { paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {vm.carregando ? (
          <ActivityIndicator color={colors.accent.main} style={{ marginTop: 32 }} />
        ) : !vm.coreConectado ? (
          <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border, marginTop: 8 }}>
            <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '600', marginBottom: 8 }}>
              Carteiras nao conectadas
            </Text>
            <Text style={{ color: colors.text.tertiary, fontSize: 13, textAlign: 'center' }}>
              Faca login novamente para conectar o modulo de carteiras.
            </Text>
          </View>
        ) : vm.portfolios.length === 0 ? (
          <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border, marginTop: 8 }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Nenhuma carteira criada.</Text>
            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>Toque em + para criar sua primeira carteira.</Text>
          </View>
        ) : (
          vm.portfolios.map(portfolio => {
            const summary = vm.summaries[portfolio.id]
            return (
              <TouchableOpacity
                key={portfolio.id}
                onPress={() => router.push(`/portfolio/${portfolio.id}` as any)}
                onLongPress={() => vm.handleDeletar(portfolio.id, portfolio.name)}
                style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: colors.bg.border }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '600' }}>{portfolio.name}</Text>
                    {portfolio.description ? (
                      <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>{portfolio.description}</Text>
                    ) : null}
                  </View>
                  <Text style={{ color: colors.text.tertiary, fontSize: 11, marginTop: 2 }}>{portfolio.currency}</Text>
                </View>

                {summary ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.bg.border }}>
                    <View>
                      <Text style={sectionLabel}>Valor atual</Text>
                      <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '700' }}>
                        {vm.formatarMoeda(summary.totalMarketValue)}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={sectionLabel}>P&L</Text>
                      <Text style={{ color: vm.plColor(summary.totalPl), fontSize: 15, fontWeight: '700' }}>
                        {summary.totalPl >= 0 ? '+' : ''}{vm.formatarMoeda(summary.totalPl)}
                        {'  '}
                        <Text style={{ fontSize: 12 }}>
                          ({summary.totalPlPercent >= 0 ? '+' : ''}{summary.totalPlPercent.toFixed(2)}%)
                        </Text>
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 10 }}>
                    Toque para ver posicoes
                  </Text>
                )}
              </TouchableOpacity>
            )
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      {vm.coreConectado && (
        <TouchableOpacity
          style={{
            position: 'absolute', bottom: 24, right: 24,
            backgroundColor: colors.accent.main, width: 56, height: 56,
            borderRadius: 28, alignItems: 'center', justifyContent: 'center',
          }}
          onPress={vm.abrirModal}
        >
          <Text style={{ color: colors.text.inverse, fontSize: 28, lineHeight: 32, fontWeight: '300' }}>+</Text>
        </TouchableOpacity>
      )}

      {/* Modal nova carteira */}
      <Modal
        visible={vm.modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={vm.fecharModal}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderTopWidth: 1, borderColor: colors.bg.border, padding: 24,
          }}>
            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>
              Nova carteira
            </Text>

            <TextInput
              style={{
                backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.bg.border,
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
                fontSize: 15, color: colors.text.primary, marginBottom: 12,
              }}
              placeholder="Nome ex: Carteira Principal"
              placeholderTextColor={colors.text.tertiary}
              value={vm.nome}
              onChangeText={vm.setNome}
            />

            <TextInput
              style={{
                backgroundColor: colors.bg.input, borderWidth: 1, borderColor: colors.bg.border,
                borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
                fontSize: 15, color: colors.text.primary, marginBottom: 16,
              }}
              placeholder="Descricao (opcional)"
              placeholderTextColor={colors.text.tertiary}
              value={vm.descricao}
              onChangeText={vm.setDescricao}
            />

            <Text style={sectionLabel}>Moeda</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
              {MOEDAS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
                    backgroundColor: vm.moeda === m ? colors.accent.main : colors.bg.input,
                    borderWidth: 1, borderColor: vm.moeda === m ? colors.accent.main : colors.bg.border,
                  }}
                  onPress={() => vm.setMoeda(m)}
                >
                  <Text style={{
                    color: vm.moeda === m ? colors.text.inverse : colors.text.secondary,
                    fontWeight: '600', fontSize: 13,
                  }}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={{ backgroundColor: colors.accent.main, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
              onPress={vm.handleCriar}
              disabled={vm.carregando}
            >
              {vm.carregando ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={{ color: colors.text.inverse, fontWeight: '700', fontSize: 15 }}>Criar carteira</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={vm.fecharModal}>
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
