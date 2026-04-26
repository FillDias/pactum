import { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useAuthStore } from '../../store/authStore'
import { useFinancasStore } from '../../store/financasStore'
import { useSaldoStore } from '../../store/saldoStore'
import { useInvestimentoStore } from '../../store/investimentoStore'
import { useChatStore } from '../../store/chatStore'
import { formatarMoeda, formatarMesAno } from '../../utils/formatters'
import { colors } from '../../constants/colors'

export default function Inicio() {
  const { usuario } = useAuthStore()
  const { lancamentos, mesSelecionado, anoSelecionado, buscarLancamentos } =
    useFinancasStore()
  const { saldo, buscarSaldo } = useSaldoStore()
  const { patrimonio_total, rendimento_mensal, buscarInvestimentos } =
    useInvestimentoStore()
  const { mensagens, buscarMensagens } = useChatStore()

  useFocusEffect(
    useCallback(() => {
      buscarLancamentos()
      buscarSaldo(mesSelecionado, anoSelecionado)
      buscarInvestimentos()
      buscarMensagens()
    }, [mesSelecionado, anoSelecionado])
  )

  const saldoValor = saldo?.saldo ?? 0
  const saldoPositivo = saldoValor >= 0
  const saldoColor = saldoPositivo ? colors.status.positive : colors.status.negative

  const atividadeRecente = mensagens
    .filter(m => m.tipo === 'sistema')
    .slice(-4)
    .reverse()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{
          paddingHorizontal: 24,
          paddingTop: 56,
          paddingBottom: 28,
          backgroundColor: colors.bg.primary,
        }}>
          <Text style={{
            fontSize: 12,
            color: colors.text.tertiary,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
            Ola, {usuario?.nome}
          </Text>
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: colors.text.primary,
            marginTop: 4,
            letterSpacing: 0.3,
          }}>
            {formatarMesAno(mesSelecionado, anoSelecionado)}
          </Text>
        </View>

        {/* Card saldo principal */}
        <View style={{
          marginHorizontal: 20,
          backgroundColor: colors.bg.card,
          borderRadius: 20,
          padding: 24,
          borderWidth: 1,
          borderColor: colors.bg.border,
        }}>
          <Text style={{
            fontSize: 11,
            color: colors.text.tertiary,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            Saldo do mes
          </Text>
          <Text style={{
            fontSize: 38,
            fontWeight: '700',
            color: saldoColor,
            letterSpacing: -0.5,
          }}>
            {formatarMoeda(saldoValor)}
          </Text>

          <View style={{ flexDirection: 'row', marginTop: 20, gap: 16 }}>
            <View style={{
              flex: 1,
              backgroundColor: colors.bg.secondary,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.bg.border,
            }}>
              <Text style={{
                fontSize: 10,
                color: colors.text.tertiary,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                Receitas
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.status.positive,
              }}>
                {formatarMoeda(saldo?.total_receitas ?? 0)}
              </Text>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: colors.bg.secondary,
              borderRadius: 12,
              padding: 12,
              borderWidth: 1,
              borderColor: colors.bg.border,
            }}>
              <Text style={{
                fontSize: 10,
                color: colors.text.tertiary,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                Gastos
              </Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.status.negative,
              }}>
                {formatarMoeda(saldo?.total_gastos ?? 0)}
              </Text>
            </View>
          </View>
        </View>

        {/* Alerta saldo negativo */}
        {!saldoPositivo && saldoValor !== 0 && (
          <View style={{
            marginHorizontal: 20,
            marginTop: 12,
            backgroundColor: '#2A1515',
            borderRadius: 12,
            padding: 14,
            borderLeftWidth: 3,
            borderLeftColor: colors.status.negative,
          }}>
            <Text style={{ color: colors.status.negative, fontSize: 13 }}>
              Saldo negativo. Revise seus lancamentos.
            </Text>
          </View>
        )}

        {/* Card investimentos */}
        {patrimonio_total > 0 && (
          <TouchableOpacity
            style={{
              marginHorizontal: 20,
              marginTop: 12,
              backgroundColor: colors.bg.card,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: colors.bg.border,
            }}
            onPress={() => router.push('/(tabs)/investimentos')}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 11,
                color: colors.text.tertiary,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}>
                Investimentos
              </Text>
              <Text style={{ fontSize: 11, color: colors.accent.main }}>
                Ver tudo →
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 10,
                  color: colors.text.tertiary,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  Patrimonio
                </Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.accent.main,
                }}>
                  {formatarMoeda(patrimonio_total)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 10,
                  color: colors.text.tertiary,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}>
                  Rendimento/mes
                </Text>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.status.positive,
                }}>
                  + {formatarMoeda(rendimento_mensal)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Atividade recente */}
        {atividadeRecente.length > 0 && (
          <View style={{ marginHorizontal: 20, marginTop: 24 }}>
            <Text style={{
              fontSize: 11,
              color: colors.text.tertiary,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              Atividade recente
            </Text>
            {atividadeRecente.map((msg) => (
              <View
                key={msg.id}
                style={{
                  backgroundColor: colors.bg.card,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: colors.bg.border,
                }}
              >
                <Text style={{ color: colors.text.secondary, fontSize: 13 }}>
                  {msg.conteudo}
                </Text>
                <Text style={{
                  color: colors.text.tertiary,
                  fontSize: 11,
                  marginTop: 4,
                }}>
                  {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Lancamentos recentes */}
        <View style={{ marginHorizontal: 20, marginTop: 24 }}>
          <Text style={{
            fontSize: 11,
            color: colors.text.tertiary,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Lancamentos recentes
          </Text>
          {lancamentos.length === 0 ? (
            <View style={{
              backgroundColor: colors.bg.card,
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.bg.border,
            }}>
              <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>
                Nenhum lancamento este mes.
              </Text>
            </View>
          ) : (
            lancamentos.slice(0, 8).map((lancamento) => (
              <View
                key={lancamento.id}
                style={{
                  backgroundColor: colors.bg.card,
                  borderRadius: 14,
                  padding: 16,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: colors.bg.border,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: colors.text.primary,
                    fontSize: 14,
                    fontWeight: '500',
                  }}>
                    {lancamento.descricao}
                  </Text>
                  <Text style={{
                    color: colors.text.tertiary,
                    fontSize: 12,
                    marginTop: 3,
                  }}>
                    {lancamento.categoria}
                    {lancamento.vencimento ? ` · dia ${lancamento.vencimento}` : ''}
                  </Text>
                </View>
                <Text style={{
                  fontWeight: '700',
                  fontSize: 15,
                  color: lancamento.tipo === 'receita'
                    ? colors.status.positive
                    : colors.status.negative,
                }}>
                  {lancamento.tipo === 'despesa' ? '-' : '+'}
                  {formatarMoeda(lancamento.valor)}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}
