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
  KeyboardAvoidingView,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useResponsive } from '../../hooks/useResponsive'
import { colors } from '../../constants/colors'
import { OPERADORAS_CARTAO, OPERADORA_OUTRA, PARCELAS_CARTAO } from '../../constants/categories'
import { useCartoesViewModel } from '../../viewmodels/useCartoesViewModel'
import { useCompraCartaoViewModel } from '../../viewmodels/useCompraCartaoViewModel'

export default function Cartoes() {
  const { isDesktop } = useResponsive()
  const cartoesVm = useCartoesViewModel()
  const comprasVm = useCompraCartaoViewModel()

  useFocusEffect(
    useCallback(() => {
      cartoesVm.buscarCartoes()
      comprasVm.buscarDados()
    }, [])
  )

  const sectionLabel = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  }

  const inputStyle = {
    backgroundColor: colors.bg.input,
    borderWidth: 1,
    borderColor: colors.bg.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 12,
  }

  const nomeCartao = (cartaoId: string) => {
    const cartao = cartoesVm.cartoes.find(c => c.id === cartaoId)
    if (!cartao) return 'Cartao'
    return cartao.apelido || cartao.operadora
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 16 }}>
        <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Contas
        </Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, marginTop: 4 }}>
          Cartoes
        </Text>

        <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.bg.border }}>
            <Text style={sectionLabel}>Total no mes</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.status.negative }}>
              {comprasVm.formatarMoeda(comprasVm.totalGeralNoMes)}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.bg.border }}>
            <Text style={sectionLabel}>Comprometido futuro</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>
              {comprasVm.formatarMoeda(comprasVm.comprometidoFuturo)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop
          ? { alignSelf: 'center', width: '100%', maxWidth: 720, paddingHorizontal: 20 }
          : { paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={sectionLabel}>Meus cartoes</Text>
          <TouchableOpacity onPress={cartoesVm.abrirModal}>
            <Text style={{ color: colors.accent.main, fontSize: 13, fontWeight: '600' }}>+ Novo cartao</Text>
          </TouchableOpacity>
        </View>

        {cartoesVm.carregando ? (
          <ActivityIndicator color={colors.accent.main} style={{ marginTop: 16 }} />
        ) : cartoesVm.cartoes.length === 0 ? (
          <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Nenhum cartao cadastrado.</Text>
            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>Toque em "+ Novo cartao" para comecar.</Text>
          </View>
        ) : (
          cartoesVm.cartoes.map(cartao => (
            <TouchableOpacity
              key={cartao.id}
              onLongPress={() => cartoesVm.handleRemover(cartao.id)}
              style={{
                backgroundColor: colors.bg.card, borderRadius: 14, padding: 16, marginBottom: 8,
                flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                  {cartao.apelido || cartao.operadora}
                </Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 3 }}>
                  {cartao.operadora}
                  {cartao.limite ? ` · Limite ${comprasVm.formatarMoeda(cartao.limite)}` : ''}
                  {cartao.dia_vencimento ? ` · Vence dia ${cartao.dia_vencimento}` : ''}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: colors.status.negative, fontWeight: '700', fontSize: 15 }}>
                  {comprasVm.formatarMoeda(comprasVm.totalPorCartao[cartao.id] ?? 0)}
                </Text>
                <TouchableOpacity onPress={() => cartoesVm.handleRemover(cartao.id)}>
                  <Feather name="trash-2" size={16} color={colors.status.negative} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text style={{ ...sectionLabel, marginTop: 20 }}>Compras parceladas</Text>
        {comprasVm.comprasCartao.length === 0 ? (
          <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Nenhuma compra parcelada ainda.</Text>
          </View>
        ) : (
          comprasVm.comprasCartao.map(compra => (
            <View
              key={compra.id}
              style={{
                backgroundColor: colors.bg.card, borderRadius: 14, padding: 16, marginBottom: 8,
                flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border,
                opacity: compra.cancelada_em ? 0.5 : 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>
                  {compra.descricao}
                </Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 3 }}>
                  {nomeCartao(compra.cartao_id)} · {compra.numero_parcelas}x
                  {compra.cancelada_em ? ' · Cancelada' : ''}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={{ color: colors.text.primary, fontWeight: '700', fontSize: 15 }}>
                  {comprasVm.formatarMoeda(compra.valor_total)}
                </Text>
                {!compra.cancelada_em && (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity onPress={() => comprasVm.handleCancelar(compra.id)}>
                      <Feather name="slash" size={15} color={colors.text.tertiary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => comprasVm.handleExcluir(compra.id)}>
                      <Feather name="trash-2" size={15} color={colors.status.negative} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB: nova compra */}
      <TouchableOpacity
        style={{
          position: 'absolute', bottom: 24, right: 24,
          backgroundColor: colors.accent.main, width: 56, height: 56,
          borderRadius: 28, alignItems: 'center', justifyContent: 'center',
        }}
        onPress={() => {
          if (cartoesVm.cartoes.length === 0) {
            cartoesVm.abrirModal()
            return
          }
          comprasVm.abrirModal(cartoesVm.cartoes[0].id)
        }}
      >
        <Text style={{ color: colors.text.inverse, fontSize: 28, lineHeight: 32, fontWeight: '300' }}>+</Text>
      </TouchableOpacity>

      {/* Modal novo cartao */}
      <Modal visible={cartoesVm.modalVisivel} transparent animationType="slide" onRequestClose={cartoesVm.fecharModal}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <View style={{
              backgroundColor: colors.bg.secondary,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              borderTopWidth: 1, borderColor: colors.bg.border,
              maxHeight: '90%',
            }}>
              <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>
                  Novo cartao
                </Text>

                <TextInput
                  style={inputStyle}
                  placeholder="Apelido (opcional) ex: Cartao da Ana"
                  placeholderTextColor={colors.text.tertiary}
                  value={cartoesVm.apelido}
                  onChangeText={cartoesVm.setApelido}
                />

                <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                  Operadora
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[...OPERADORAS_CARTAO, OPERADORA_OUTRA].map(op => (
                      <TouchableOpacity
                        key={op}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: cartoesVm.operadoraSelecionada === op ? colors.accent.main : colors.bg.input,
                          borderWidth: 1,
                          borderColor: cartoesVm.operadoraSelecionada === op ? colors.accent.main : colors.bg.border,
                        }}
                        onPress={() => cartoesVm.setOperadoraSelecionada(op)}
                      >
                        <Text style={{ color: cartoesVm.operadoraSelecionada === op ? colors.text.inverse : colors.text.secondary, fontSize: 13 }}>
                          {op}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {cartoesVm.operadoraSelecionada === OPERADORA_OUTRA && (
                  <TextInput
                    style={inputStyle}
                    placeholder="Nome da operadora"
                    placeholderTextColor={colors.text.tertiary}
                    value={cartoesVm.operadoraCustomizada}
                    onChangeText={cartoesVm.setOperadoraCustomizada}
                  />
                )}

                <TextInput
                  style={inputStyle}
                  placeholder="Limite (opcional) ex: 5000,00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={cartoesVm.limite}
                  onChangeText={cartoesVm.setLimite}
                />

                <TextInput
                  style={inputStyle}
                  placeholder="Dia de vencimento (opcional) ex: 10"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="number-pad"
                  maxLength={2}
                  value={cartoesVm.diaVencimento}
                  onChangeText={cartoesVm.setDiaVencimento}
                />

                <TouchableOpacity
                  style={{ backgroundColor: colors.accent.main, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
                  onPress={cartoesVm.handleSalvar}
                  disabled={cartoesVm.carregando}
                >
                  {cartoesVm.carregando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Salvar cartao</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={cartoesVm.fecharModal}>
                  <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal nova compra parcelada */}
      <Modal
        visible={comprasVm.modalVisivel}
        transparent
        animationType="slide"
        onRequestClose={comprasVm.fecharModal}
      >
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <View style={{
              backgroundColor: colors.bg.secondary,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              borderTopWidth: 1, borderColor: colors.bg.border,
              maxHeight: '90%',
            }}>
              <ScrollView contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>
                  Nova compra no cartao
                </Text>

                <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                  Cartao
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {cartoesVm.cartoes.map(cartao => (
                      <TouchableOpacity
                        key={cartao.id}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: comprasVm.cartaoId === cartao.id ? colors.accent.main : colors.bg.input,
                          borderWidth: 1,
                          borderColor: comprasVm.cartaoId === cartao.id ? colors.accent.main : colors.bg.border,
                        }}
                        onPress={() => comprasVm.setCartaoId(cartao.id)}
                      >
                        <Text style={{ color: comprasVm.cartaoId === cartao.id ? colors.text.inverse : colors.text.secondary, fontSize: 13 }}>
                          {cartao.apelido || cartao.operadora}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TextInput
                  style={inputStyle}
                  placeholder="Descricao ex: Notebook"
                  placeholderTextColor={colors.text.tertiary}
                  value={comprasVm.descricao}
                  onChangeText={comprasVm.setDescricao}
                />

                <TextInput
                  style={inputStyle}
                  placeholder="Valor total ex: 3000,00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={comprasVm.valor}
                  onChangeText={comprasVm.setValor}
                />

                <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
                  Parcelas: {comprasVm.numeroParcelas}x
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {PARCELAS_CARTAO.filter(n => [1, 2, 3, 4, 5, 6, 10, 12, 18, 24, 36, 48].includes(n)).map(n => (
                      <TouchableOpacity
                        key={n}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: comprasVm.numeroParcelas === n ? colors.accent.main : colors.bg.input,
                          borderWidth: 1,
                          borderColor: comprasVm.numeroParcelas === n ? colors.accent.main : colors.bg.border,
                        }}
                        onPress={() => comprasVm.setNumeroParcelas(n)}
                      >
                        <Text style={{ color: comprasVm.numeroParcelas === n ? colors.text.inverse : colors.text.secondary, fontSize: 13 }}>
                          {n}x
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={{ backgroundColor: colors.accent.main, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
                  onPress={comprasVm.handleSalvar}
                  disabled={comprasVm.carregando}
                >
                  {comprasVm.carregando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Salvar compra</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={{ paddingVertical: 12, alignItems: 'center' }} onPress={comprasVm.fecharModal}>
                  <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}
