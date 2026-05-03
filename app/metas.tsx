import { useState, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useMetasStore } from '../store/metasStore'
import { formatarMoeda } from '../utils/formatters'
import { colors } from '../constants/colors'
import { Meta } from '../types'

function diasRestantes(prazo: string): number {
  const venc = new Date(prazo)
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  return Math.ceil((venc.getTime() - hoje.getTime()) / 86400000)
}

function mesesRestantes(prazo: string): number {
  const venc = new Date(prazo)
  const hoje = new Date()
  const meses =
    (venc.getFullYear() - hoje.getFullYear()) * 12 +
    (venc.getMonth() - hoje.getMonth())
  return Math.max(meses, 1)
}

function aportesugerido(meta: Meta): number {
  const falta = meta.valor_alvo - meta.valor_atual
  if (falta <= 0) return 0
  return falta / mesesRestantes(meta.prazo)
}

type ModalModo = 'nova' | 'atualizar' | null

export default function Metas() {
  const { metas, carregando, buscarMetas, adicionarMeta, atualizarProgressoMeta, removerMeta } =
    useMetasStore()

  const [modalModo, setModalModo] = useState<ModalModo>(null)
  const [metaSelecionada, setMetaSelecionada] = useState<Meta | null>(null)

  // Campos nova meta
  const [titulo, setTitulo] = useState('')
  const [valorAlvo, setValorAlvo] = useState('')
  const [prazo, setPrazo] = useState('')

  // Campo atualizar
  const [novoValor, setNovoValor] = useState('')

  const [salvando, setSalvando] = useState(false)

  useFocusEffect(
    useCallback(() => {
      buscarMetas()
    }, [])
  )

  const abrirNova = () => {
    setTitulo('')
    setValorAlvo('')
    setPrazo('')
    setModalModo('nova')
  }

  const abrirAtualizar = (meta: Meta) => {
    setMetaSelecionada(meta)
    setNovoValor(String(meta.valor_atual))
    setModalModo('atualizar')
  }

  const fechar = () => {
    setModalModo(null)
    setMetaSelecionada(null)
  }

  const handleSalvarNova = async () => {
    if (!titulo.trim() || !valorAlvo || !prazo) {
      Alert.alert('Atencao', 'Preencha todos os campos')
      return
    }
    setSalvando(true)
    try {
      await adicionarMeta({
        titulo: titulo.trim(),
        valor_alvo: parseFloat(valorAlvo.replace(',', '.')),
        valor_atual: 0,
        prazo,
      })
      fechar()
    } catch (e: any) {
      Alert.alert('Erro', e.message)
    } finally {
      setSalvando(false)
    }
  }

  const handleAtualizar = async () => {
    if (!metaSelecionada || !novoValor) return
    const val = parseFloat(novoValor.replace(',', '.'))
    if (isNaN(val) || val < 0) {
      Alert.alert('Atencao', 'Valor invalido')
      return
    }
    setSalvando(true)
    try {
      await atualizarProgressoMeta(metaSelecionada.id, val)
      fechar()
    } catch (e: any) {
      Alert.alert('Erro', e.message)
    } finally {
      setSalvando(false)
    }
  }

  const handleRemover = (meta: Meta) => {
    Alert.alert('Remover meta', `Remover "${meta.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive',
        onPress: () => removerMeta(meta.id),
      },
    ])
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

  const sectionLabel = {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  }

  const concluidas = metas.filter(m => m.valor_atual >= m.valor_alvo)
  const ativas = metas.filter(m => m.valor_atual < m.valor_alvo)

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'web' ? 24 : 56,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        <View>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
            <Text style={{ color: colors.accent.main, fontSize: 14 }}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary }}>
            Metas
          </Text>
          <Text style={{ color: colors.text.tertiary, fontSize: 13, marginTop: 2 }}>
            {ativas.length} ativa{ativas.length !== 1 ? 's' : ''}
            {concluidas.length > 0 ? ` · ${concluidas.length} concluida${concluidas.length !== 1 ? 's' : ''}` : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={abrirNova}
          style={{
            backgroundColor: colors.accent.main,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Nova meta</Text>
        </TouchableOpacity>
      </View>

      {carregando && metas.length === 0 ? (
        <ActivityIndicator color={colors.accent.main} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
        >
          {metas.length === 0 && (
            <View style={{
              backgroundColor: colors.bg.card, borderRadius: 16, padding: 32,
              alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border, marginTop: 8,
            }}>
              <Text style={{ color: colors.text.tertiary, fontSize: 14, textAlign: 'center' }}>
                Nenhuma meta ainda.{'\n'}Crie sua primeira meta financeira.
              </Text>
            </View>
          )}

          {/* Metas ativas */}
          {ativas.map(meta => {
            const progresso = Math.min((meta.valor_atual / meta.valor_alvo) * 100, 100)
            const dias = diasRestantes(meta.prazo)
            const aporte = aportesugerido(meta)
            const vencida = dias < 0
            const urgente = dias >= 0 && dias <= 30

            return (
              <View key={meta.id} style={{
                backgroundColor: colors.bg.card, borderRadius: 16, padding: 18,
                marginBottom: 12, borderWidth: 1,
                borderColor: vencida ? colors.status.negative + '44' : colors.bg.border,
              }}>
                {/* Titulo e menu */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontSize: 16, fontWeight: '700' }}>
                      {meta.titulo}
                    </Text>
                    {vencida ? (
                      <Text style={{ color: colors.status.negative, fontSize: 12, marginTop: 2 }}>
                        Prazo encerrado
                      </Text>
                    ) : (
                      <Text style={{
                        fontSize: 12, marginTop: 2,
                        color: urgente ? colors.status.warning : colors.text.tertiary,
                        fontWeight: urgente ? '600' : '400',
                      }}>
                        {dias === 0 ? 'Vence hoje' : `${dias} dias restantes`}
                        {' · '}{meta.prazo}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemover(meta)}
                    style={{ padding: 4 }}
                  >
                    <Feather name="trash-2" size={15} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>

                {/* Barra de progresso */}
                <View style={{ backgroundColor: colors.bg.secondary, borderRadius: 6, height: 8, marginBottom: 10 }}>
                  <View style={{
                    backgroundColor: vencida ? colors.status.negative : colors.accent.main,
                    borderRadius: 6, height: 8,
                    width: `${progresso}%`,
                  }} />
                </View>

                {/* Valores */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View>
                    <Text style={sectionLabel}>Atual</Text>
                    <Text style={{ color: colors.accent.dark, fontSize: 15, fontWeight: '700' }}>
                      {formatarMoeda(meta.valor_atual)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={sectionLabel}>Progresso</Text>
                    <Text style={{ color: colors.text.primary, fontSize: 15, fontWeight: '700' }}>
                      {progresso.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={sectionLabel}>Alvo</Text>
                    <Text style={{ color: colors.text.secondary, fontSize: 15, fontWeight: '700' }}>
                      {formatarMoeda(meta.valor_alvo)}
                    </Text>
                  </View>
                </View>

                {/* Aporte sugerido + botão atualizar */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.bg.border,
                }}>
                  {!vencida && aporte > 0 ? (
                    <View>
                      <Text style={sectionLabel}>Aporte mensal sugerido</Text>
                      <Text style={{ color: colors.status.positive, fontSize: 14, fontWeight: '600' }}>
                        {formatarMoeda(aporte)}/mês
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  <TouchableOpacity
                    onPress={() => abrirAtualizar(meta)}
                    style={{
                      backgroundColor: colors.accent.main + '22',
                      borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
                      borderWidth: 1, borderColor: colors.accent.main + '55',
                      flexDirection: 'row', alignItems: 'center', gap: 4,
                    }}
                  >
                    <Feather name="edit-2" size={13} color={colors.accent.dark} />
                    <Text style={{ color: colors.accent.dark, fontSize: 13, fontWeight: '600' }}>
                      Atualizar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}

          {/* Concluidas */}
          {concluidas.length > 0 && (
            <>
              <Text style={{ ...sectionLabel, marginTop: 8, marginBottom: 10 }}>Concluidas</Text>
              {concluidas.map(meta => (
                <View key={meta.id} style={{
                  backgroundColor: colors.bg.card, borderRadius: 14, padding: 16,
                  marginBottom: 10, borderWidth: 1, borderColor: colors.status.positive + '44',
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: colors.status.positive + '22',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Feather name="check" size={18} color={colors.status.positive} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text.primary, fontWeight: '600', fontSize: 14 }}>
                      {meta.titulo}
                    </Text>
                    <Text style={{ color: colors.status.positive, fontSize: 12, marginTop: 1 }}>
                      {formatarMoeda(meta.valor_atual)} de {formatarMoeda(meta.valor_alvo)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemover(meta)}>
                    <Feather name="trash-2" size={15} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}

      {/* Modal */}
      <Modal
        visible={modalModo !== null}
        transparent
        animationType="slide"
        onRequestClose={fechar}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            padding: 24, paddingBottom: 40,
            borderTopWidth: 1, borderColor: colors.bg.border,
          }}>
            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>
              {modalModo === 'nova' ? 'Nova meta' : `Atualizar — ${metaSelecionada?.titulo}`}
            </Text>

            {modalModo === 'nova' ? (
              <>
                <TextInput
                  style={inputStyle}
                  placeholder="Titulo ex: Reserva de emergencia"
                  placeholderTextColor={colors.text.tertiary}
                  value={titulo}
                  onChangeText={setTitulo}
                  autoFocus
                />
                <TextInput
                  style={inputStyle}
                  placeholder="Valor alvo ex: 20000,00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={valorAlvo}
                  onChangeText={setValorAlvo}
                />
                <TextInput
                  style={inputStyle}
                  placeholder="Prazo ex: 2026-12-31"
                  placeholderTextColor={colors.text.tertiary}
                  value={prazo}
                  onChangeText={setPrazo}
                />
              </>
            ) : (
              <>
                <Text style={{ color: colors.text.secondary, fontSize: 13, marginBottom: 12 }}>
                  Alvo: {formatarMoeda(metaSelecionada?.valor_alvo ?? 0)}
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Valor atual ex: 5000,00"
                  placeholderTextColor={colors.text.tertiary}
                  keyboardType="decimal-pad"
                  value={novoValor}
                  onChangeText={setNovoValor}
                  autoFocus
                />
              </>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: colors.accent.main, borderRadius: 12,
                paddingVertical: 16, alignItems: 'center', marginBottom: 12,
              }}
              onPress={modalModo === 'nova' ? handleSalvarNova : handleAtualizar}
              disabled={salvando}
            >
              {salvando
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                    {modalModo === 'nova' ? 'Criar meta' : 'Salvar'}
                  </Text>
              }
            </TouchableOpacity>

            <TouchableOpacity
              style={{ paddingVertical: 12, alignItems: 'center' }}
              onPress={fechar}
            >
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}
