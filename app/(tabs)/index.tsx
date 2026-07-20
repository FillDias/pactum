import { useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import MesNavegador from '../../components/shared/MesNavegador'
import SwipeableItem from '../../components/shared/SwipeableItem'
import { colors } from '../../constants/colors'
import { useResponsive } from '../../hooks/useResponsive'
import { useDashboardViewModel } from '../../viewmodels/useDashboardViewModel'

export default function Inicio() {
  const { isDesktop } = useResponsive()
  const vm = useDashboardViewModel()

  useFocusEffect(
    useCallback(() => {
      vm.carregarDados()
    }, [vm.mesSelecionado, vm.anoSelecionado, vm.escopoHome])
  )

  const sectionLabel = {
    fontSize: 11,
    color: colors.text.tertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
  }

  const CardSaldo = (
    <View style={{
      backgroundColor: colors.bg.card,
      borderRadius: 20,
      padding: isDesktop ? 28 : 24,
      borderWidth: 1,
      borderColor: colors.bg.border,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <Text style={sectionLabel}>Saldo do mes</Text>
        {vm.temFamilia && (
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.bg.secondary,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.bg.border,
            padding: 3,
            marginBottom: 10,
          }}>
            {(['eu', 'familia'] as const).map(op => (
              <TouchableOpacity
                key={op}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 6,
                  backgroundColor: vm.escopoHome === op ? colors.accent.main : 'transparent',
                }}
                onPress={() => vm.setEscopoHome(op)}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: vm.escopoHome === op ? '#fff' : colors.text.secondary }}>
                  {op === 'eu' ? 'Eu' : 'Familia'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <Text style={{ fontSize: isDesktop ? 42 : 38, fontWeight: '700', color: vm.saldoColor, letterSpacing: -1 }}>
        {vm.formatarMoeda(vm.saldoValor)}
      </Text>
      <View style={{ flexDirection: 'row', marginTop: 20, gap: 12 }}>
        <View style={{ flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.bg.border }}>
          <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Receitas</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.status.positive }}>{vm.formatarMoeda(vm.totalReceitas)}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: colors.bg.secondary, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.bg.border }}>
          <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Gastos</Text>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.status.negative }}>{vm.formatarMoeda(vm.totalGastos)}</Text>
        </View>
      </View>
    </View>
  )

  const AlertaSaldo = !vm.saldoPositivo && vm.saldoValor !== 0 ? (
    <View style={{ marginTop: 10, backgroundColor: '#FFF5F5', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: colors.status.negative }}>
      <Text style={{ color: colors.status.negative, fontSize: 13 }}>Saldo negativo. Revise seus lancamentos.</Text>
    </View>
  ) : null

  const CardCarteiras = vm.portfolios.length > 0 ? (
    <TouchableOpacity
      style={{ backgroundColor: colors.bg.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.bg.border }}
      onPress={() => router.push('/(tabs)/investimentos' as any)}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={sectionLabel}>Carteiras</Text>
        <Text style={{ fontSize: 11, color: colors.accent.main }}>Ver tudo →</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 14 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>Investido</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.accent.dark }}>{vm.formatarMoeda(vm.totalInvestido)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>P&L total</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: vm.totalPl >= 0 ? colors.status.positive : colors.status.negative }}>
            {vm.totalPl >= 0 ? '+' : ''}{vm.formatarMoeda(vm.totalPl)}
          </Text>
        </View>
      </View>
      {vm.portfolios.map(p => {
        const s = vm.summaries[p.id]
        if (!s) return null
        return (
          <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.bg.border }}>
            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{p.name}</Text>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Text style={{ color: colors.text.primary, fontSize: 13, fontWeight: '600' }}>{vm.formatarMoeda(s.totalMarketValue)}</Text>
              <Text style={{ fontSize: 12, color: s.totalPl >= 0 ? colors.status.positive : colors.status.negative }}>
                {s.totalPl >= 0 ? '+' : ''}{s.totalPlPercent.toFixed(1)}%
              </Text>
            </View>
          </View>
        )
      })}
      <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.bg.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: colors.text.tertiary, letterSpacing: 1, textTransform: 'uppercase' }}>Patrimônio total</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary }}>{vm.formatarMoeda(vm.patrimonioTotal)}</Text>
      </View>
    </TouchableOpacity>
  ) : null

  const SecaoAtividade = vm.atividadeRecente.length > 0 ? (
    <View>
      <Text style={sectionLabel}>Atividade recente</Text>
      {vm.atividadeRecente.map(msg => (
        <View key={msg.id} style={{ backgroundColor: colors.bg.card, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.bg.border }}>
          <Text style={{ color: colors.text.secondary, fontSize: 13 }}>{msg.conteudo}</Text>
          <Text style={{ color: colors.text.tertiary, fontSize: 11, marginTop: 4 }}>
            {new Date(msg.created_at).toLocaleDateString('pt-BR')}
          </Text>
        </View>
      ))}
    </View>
  ) : null

  const SecaoLancamentos = (
    <View>
      <Text style={sectionLabel}>Lancamentos recentes</Text>
      {vm.lancamentos.length === 0 ? (
        <View style={{ backgroundColor: colors.bg.card, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border }}>
          <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Nenhum lancamento este mes.</Text>
        </View>
      ) : (
        vm.lancamentos.slice(0, 8).map(lancamento => (
          <SwipeableItem key={lancamento.id} onDelete={() => vm.handleDeletar(lancamento.id)}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push(`/lancamento/${lancamento.id}` as any)}
              style={{ backgroundColor: colors.bg.card, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.bg.border }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text.primary, fontSize: 14, fontWeight: '500' }}>{lancamento.descricao}</Text>
                <Text style={{ color: colors.text.tertiary, fontSize: 12, marginTop: 3 }}>
                  {lancamento.categoria}{lancamento.vencimento ? ` · dia ${lancamento.vencimento}` : ''}
                </Text>
              </View>
              <Text style={{ fontWeight: '700', fontSize: 15, color: lancamento.tipo === 'receita' ? colors.status.positive : colors.status.negative }}>
                {lancamento.tipo === 'despesa' ? '-' : '+'}{vm.formatarMoeda(lancamento.valor)}
              </Text>
            </TouchableOpacity>
          </SwipeableItem>
        ))
      )}
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.primary} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'web' ? 24 : 56, paddingBottom: 24 }}>
          <Text style={{ fontSize: 12, color: colors.text.tertiary, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Ola, {vm.nomeUsuario}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text.primary }}>Inicio</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <TouchableOpacity onPress={() => router.push('/(tabs)/relatorio' as any)}>
                <Text style={{ fontSize: 12, color: colors.accent.main }}>Relatorio →</Text>
              </TouchableOpacity>
              <MesNavegador mes={vm.mesSelecionado} ano={vm.anoSelecionado} onChange={(m, a) => vm.setMesSelecionado(m, a)} />
            </View>
          </View>
        </View>

        {isDesktop ? (
          <View style={{ paddingHorizontal: 20 }}>
            {vm.alertasVencimento.map(alerta => (
              <View key={alerta.ticker} style={{
                marginBottom: 10, backgroundColor: alerta.dias <= 7 ? '#FFF5F5' : '#FFFBF0',
                borderRadius: 12, padding: 14, borderLeftWidth: 3,
                borderLeftColor: alerta.dias <= 7 ? colors.status.negative : colors.status.warning,
              }}>
                <Text style={{ color: alerta.dias <= 7 ? colors.status.negative : colors.status.warning, fontWeight: '700', fontSize: 13 }}>
                  {alerta.dias === 0 ? 'Vence hoje' : `Vence em ${alerta.dias} dia${alerta.dias !== 1 ? 's' : ''}`}{' — '}{alerta.ticker}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                  {alerta.nome} · {alerta.portfolioNome} · {vm.formatarMoeda(alerta.marketValue)}
                </Text>
              </View>
            ))}

            <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20, alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 10 }}>
                {CardSaldo}
                {AlertaSaldo}
              </View>
              <View style={{ flex: 1 }}>
                {CardCarteiras ?? (
                  <View style={{ backgroundColor: colors.bg.card, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: colors.bg.border, alignItems: 'center' }}>
                    <Text style={{ color: colors.text.tertiary, fontSize: 14 }}>Nenhuma carteira ainda.</Text>
                    <TouchableOpacity onPress={() => router.push('/(tabs)/investimentos' as any)} style={{ marginTop: 12 }}>
                      <Text style={{ color: colors.accent.main, fontSize: 13 }}>Criar carteira →</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 8 }}>{SecaoAtividade}</View>
              <View style={{ flex: 1 }}>{SecaoLancamentos}</View>
            </View>
          </View>
        ) : (
          <>
            {vm.alertasVencimento.map(alerta => (
              <View key={alerta.ticker} style={{
                marginHorizontal: 20, marginBottom: 10,
                backgroundColor: alerta.dias <= 7 ? '#FFF5F5' : '#FFFBF0',
                borderRadius: 12, padding: 14, borderLeftWidth: 3,
                borderLeftColor: alerta.dias <= 7 ? colors.status.negative : colors.status.warning,
              }}>
                <Text style={{ color: alerta.dias <= 7 ? colors.status.negative : colors.status.warning, fontWeight: '700', fontSize: 13 }}>
                  {alerta.dias === 0 ? 'Vence hoje' : `Vence em ${alerta.dias} dia${alerta.dias !== 1 ? 's' : ''}`}{' — '}{alerta.ticker}
                </Text>
                <Text style={{ color: colors.text.secondary, fontSize: 12, marginTop: 2 }}>
                  {alerta.nome} · {alerta.portfolioNome} · {vm.formatarMoeda(alerta.marketValue)}
                </Text>
              </View>
            ))}
            <View style={{ marginHorizontal: 20 }}>{CardSaldo}</View>
            {AlertaSaldo && <View style={{ marginHorizontal: 20 }}>{AlertaSaldo}</View>}
            {CardCarteiras && <View style={{ marginHorizontal: 20, marginTop: 12 }}>{CardCarteiras}</View>}
            {SecaoAtividade && <View style={{ marginHorizontal: 20, marginTop: 24 }}>{SecaoAtividade}</View>}
            <View style={{ marginHorizontal: 20, marginTop: 24 }}>{SecaoLancamentos}</View>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  )
}
