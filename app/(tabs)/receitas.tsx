import { useEffect } from 'react'
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
import { useResponsive } from '../../hooks/useResponsive'
import { colors } from '../../constants/colors'
import { CATEGORIAS_RECEITA } from '../../constants/categories'
import { useReceitasViewModel } from '../../viewmodels/useReceitasViewModel'

export default function Receitas() {
  const { isDesktop } = useResponsive()
  const vm = useReceitasViewModel()

  useEffect(() => {
    vm.buscarLancamentos()
  }, [vm.mesSelecionado, vm.anoSelecionado])

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

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 24 }}>
        <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          Entradas
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary }}>Receitas</Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.status.positive }}>
            {vm.formatarMoeda(vm.totalReceitas)}
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={isDesktop
          ? { maxWidth: 720, paddingHorizontal: 20 }
          : { paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {vm.carregando ? (
          <ActivityIndicator color={colors.accent.main} style={{ marginTop: 32 }} />
        ) : vm.receitas.length === 0 ? (
          <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border }}>
            <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Nenhuma receita este mes.</Text>
            <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 4 }}>Toque em + para adicionar.</Text>
          </View>
        ) : (
          vm.receitas.map(receita => (
            <TouchableOpacity
              key={receita.id}
              onLongPress={() => vm.handleRemover(receita.id)}
              style={{
                backgroundColor: colors.bg.card, borderRadius: 14, padding: 16, marginBottom: 8,
                flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>{receita.descricao}</Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 3 }}>
                  {receita.categoria}
                  {receita.recorrente ? ' · Recorrente' : ''}
                </Text>
              </View>
              <Text style={{ color: colors.status.positive, fontWeight: '700', fontSize: 15 }}>
                + {vm.formatarMoeda(receita.valor)}
              </Text>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
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

      {/* Modal nova receita */}
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
            padding: 24, borderTopWidth: 1, borderColor: colors.bg.border,
          }}>
            <Text style={{ color: colors.text.primary, fontSize: 18, fontWeight: '700', marginBottom: 20 }}>
              Nova receita
            </Text>

            <TextInput
              style={inputStyle}
              placeholder="Descricao ex: Salario"
              placeholderTextColor={colors.text.tertiary}
              value={vm.descricao}
              onChangeText={vm.setDescricao}
            />

            <TextInput
              style={inputStyle}
              placeholder="Valor ex: 3000,00"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="decimal-pad"
              value={vm.valor}
              onChangeText={vm.setValor}
            />

            <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 }}>
              Categoria
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIAS_RECEITA.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: vm.categoria === cat.nome ? colors.status.positive : colors.bg.input,
                      borderWidth: 1,
                      borderColor: vm.categoria === cat.nome ? colors.status.positive : colors.bg.border,
                    }}
                    onPress={() => vm.setCategoria(cat.nome)}
                  >
                    <Text style={{ color: vm.categoria === cat.nome ? '#fff' : colors.text.secondary, fontSize: 13 }}>
                      {cat.icone} {cat.nome}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: colors.bg.input, borderRadius: 12, padding: 14, marginBottom: 16,
                borderWidth: 1, borderColor: colors.bg.border,
              }}
              onPress={() => vm.setRecorrente(!vm.recorrente)}
            >
              <Text style={{ color: colors.text.primary, fontSize: 14 }}>Recorrente todo mes</Text>
              <View style={{
                width: 44, height: 24, borderRadius: 12,
                backgroundColor: vm.recorrente ? colors.status.positive : colors.bg.border,
                justifyContent: 'center', paddingHorizontal: 3,
              }}>
                <View style={{
                  width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff',
                  alignSelf: vm.recorrente ? 'flex-end' : 'flex-start',
                }} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{ backgroundColor: colors.status.positive, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
              onPress={vm.handleSalvar}
              disabled={vm.carregando}
            >
              {vm.carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Salvar receita</Text>
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
