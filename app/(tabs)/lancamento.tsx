import { useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native'
import { useFocusEffect } from 'expo-router'
import { VENCIMENTOS } from '../../constants/categories'
import { colors } from '../../constants/colors'
import { useResponsive } from '../../hooks/useResponsive'
import MesNavegador from '../../components/shared/MesNavegador'
import { useLancamentosViewModel } from '../../viewmodels/useLancamentosViewModel'
import { CATEGORIAS, CATEGORIAS_RECEITA } from '../../constants/categories'

export default function Lancamento() {
  const { isDesktop } = useResponsive()
  const vm = useLancamentosViewModel()

  useFocusEffect(
    useCallback(() => {
      vm.buscarLancamentos()
    }, [vm.mesSelecionado, vm.anoSelecionado, vm.escopo])
  )

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
    marginBottom: 10,
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={isDesktop ? { maxWidth: 720 } : undefined}>

          {/* Header */}
          <View style={{
            paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 20,
            flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
          }}>
            <View>
              <Text style={sectionLabel}>Financas</Text>
              <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary, marginTop: 4 }}>
                Lancamentos
              </Text>
            </View>
            <MesNavegador
              mes={vm.mesSelecionado}
              ano={vm.anoSelecionado}
              onChange={(m, a) => vm.setMesSelecionado(m, a)}
            />
          </View>

          {/* Toggle Eu / Familia */}
          {vm.temFamilia && (
            <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
              <View style={{
                flexDirection: 'row',
                backgroundColor: colors.bg.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.bg.border,
                padding: 4,
              }}>
                {(['eu', 'familia'] as const).map(op => (
                  <TouchableOpacity
                    key={op}
                    style={{
                      flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center',
                      backgroundColor: vm.escopo === op ? colors.accent.main : 'transparent',
                    }}
                    onPress={() => vm.setEscopo(op)}
                  >
                    <Text style={{
                      color: vm.escopo === op ? '#fff' : colors.text.secondary,
                      fontWeight: '600', fontSize: 13,
                    }}>
                      {op === 'eu' ? 'Eu' : 'Familia'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Resumo */}
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.bg.border }}>
                <Text style={sectionLabel}>Receitas</Text>
                <Text style={{ color: colors.status.positive, fontSize: 16, fontWeight: '700' }}>
                  {vm.formatarMoeda(vm.totalReceitas)}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: colors.bg.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.bg.border }}>
                <Text style={sectionLabel}>Despesas</Text>
                <Text style={{ color: colors.status.negative, fontSize: 16, fontWeight: '700' }}>
                  {vm.formatarMoeda(vm.totalDespesas)}
                </Text>
              </View>
            </View>
          </View>

          {/* Formulario */}
          <View style={{ paddingHorizontal: 20, gap: 14 }}>

            {/* Toggle tipo */}
            <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.bg.border }}>
              <Text style={sectionLabel}>Tipo</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {(['despesa', 'receita'] as const).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={{
                      flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                      backgroundColor: vm.tipo === t
                        ? (t === 'despesa' ? colors.status.negative : colors.status.positive) + '22'
                        : colors.bg.input,
                      borderWidth: 1,
                      borderColor: vm.tipo === t
                        ? (t === 'despesa' ? colors.status.negative : colors.status.positive)
                        : colors.bg.border,
                    }}
                    onPress={() => vm.setTipo(t)}
                  >
                    <Text style={{
                      color: vm.tipo === t
                        ? (t === 'despesa' ? colors.status.negative : colors.status.positive)
                        : colors.text.secondary,
                      fontWeight: '700', fontSize: 13, textTransform: 'capitalize',
                    }}>
                      {t === 'despesa' ? '↓ Despesa' : '↑ Receita'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Detalhes */}
            <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.bg.border }}>
              <Text style={sectionLabel}>Detalhes</Text>
              <TextInput
                style={inputStyle}
                placeholder="Descricao"
                placeholderTextColor={colors.text.tertiary}
                value={vm.descricao}
                onChangeText={vm.setDescricao}
              />
              <TextInput
                style={{ ...inputStyle, marginBottom: 0 }}
                placeholder="Valor ex: 830,00"
                placeholderTextColor={colors.text.tertiary}
                keyboardType="decimal-pad"
                value={vm.valor}
                onChangeText={vm.setValor}
              />
            </View>

            {/* Categoria */}
            <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.bg.border }}>
              <Text style={sectionLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {vm.cats.map(cat => {
                    const selecionada = vm.tipo === 'despesa' ? vm.categoria === cat.nome : vm.categoriaReceita === cat.nome
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                          backgroundColor: selecionada ? vm.tipoColor + '22' : colors.bg.input,
                          borderWidth: 1,
                          borderColor: selecionada ? vm.tipoColor : colors.bg.border,
                        }}
                        onPress={() => vm.tipo === 'despesa' ? vm.setCategoria(cat.nome) : vm.setCategoriaReceita(cat.nome)}
                      >
                        <Text style={{
                          color: selecionada ? vm.tipoColor : colors.text.secondary,
                          fontSize: 13,
                          fontWeight: selecionada ? '600' : '400',
                        }}>
                          {cat.icone} {cat.nome}
                        </Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </ScrollView>
            </View>

            {/* Vencimento (apenas despesa) */}
            {vm.tipo === 'despesa' && (
              <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.bg.border }}>
                <Text style={sectionLabel}>Vencimento</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {VENCIMENTOS.map(dia => (
                    <TouchableOpacity
                      key={dia}
                      style={{
                        flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
                        backgroundColor: vm.vencimento === dia ? colors.accent.main : colors.bg.input,
                        borderWidth: 1,
                        borderColor: vm.vencimento === dia ? colors.accent.main : colors.bg.border,
                      }}
                      onPress={() => vm.setVencimento(dia)}
                    >
                      <Text style={{
                        color: vm.vencimento === dia ? '#fff' : colors.text.secondary,
                        fontWeight: '600', fontSize: 13,
                      }}>
                        Dia {dia}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Recorrente */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.bg.card, borderRadius: 16, padding: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                borderWidth: 1, borderColor: colors.bg.border,
              }}
              onPress={() => vm.setRecorrente(!vm.recorrente)}
            >
              <View>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>Recorrente</Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 2 }}>Repete todo mes</Text>
              </View>
              <View style={{
                width: 44, height: 24, borderRadius: 12,
                backgroundColor: vm.recorrente ? colors.accent.main : colors.bg.border,
                justifyContent: 'center', paddingHorizontal: 3,
              }}>
                <View style={{
                  width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff',
                  alignSelf: vm.recorrente ? 'flex-end' : 'flex-start',
                }} />
              </View>
            </TouchableOpacity>

            {/* Botao salvar */}
            <TouchableOpacity
              style={{ backgroundColor: vm.tipoColor, borderRadius: 14, paddingVertical: 16, alignItems: 'center' }}
              onPress={vm.handleSalvar}
              disabled={vm.carregando}
            >
              {vm.carregando ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, letterSpacing: 0.5 }}>
                  {vm.tipo === 'despesa' ? 'Registrar despesa' : 'Registrar receita'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Lista recente */}
            {vm.lancamentos.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ ...sectionLabel, marginBottom: 12 }}>
                  Lancamentos do mes ({vm.lancamentos.length})
                </Text>
                {vm.lancamentos.map(l => (
                  <TouchableOpacity
                    key={l.id}
                    onLongPress={() => vm.handleRemover(l.id, l.descricao)}
                    style={{
                      backgroundColor: colors.bg.card,
                      borderRadius: 12, padding: 14, marginBottom: 8,
                      borderWidth: 1, borderColor: colors.bg.border,
                      flexDirection: 'row', alignItems: 'center', gap: 12,
                    }}
                  >
                    <View style={{
                      width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
                      backgroundColor: (l.tipo === 'despesa' ? colors.status.negative : colors.status.positive) + '18',
                    }}>
                      <Text style={{ fontSize: 16 }}>
                        {[...CATEGORIAS, ...CATEGORIAS_RECEITA].find(c => c.nome === l.categoria)?.icone ?? '📦'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>{l.descricao}</Text>
                      <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 1 }}>
                        {l.categoria}  ·  Dia {l.vencimento}
                        {l.recorrente ? '  ·  Recorrente' : ''}
                      </Text>
                    </View>
                    <Text style={{
                      color: l.tipo === 'despesa' ? colors.status.negative : colors.status.positive,
                      fontWeight: '700', fontSize: 14,
                    }}>
                      {l.tipo === 'despesa' ? '-' : '+'}{vm.formatarMoeda(l.valor)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={{ height: 60 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
