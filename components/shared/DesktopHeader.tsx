import { View, Text } from 'react-native'
import { useFinancasStore } from '../../store/financasStore'
import { useAuthStore } from '../../store/authStore'
import { formatarMesAno } from '../../utils/formatters'
import { colors } from '../../constants/colors'

export default function DesktopHeader() {
  const { mesSelecionado, anoSelecionado } = useFinancasStore()
  const { usuario } = useAuthStore()

  return (
    <View style={{
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 28,
      borderBottomWidth: 1,
      borderBottomColor: colors.bg.border,
      backgroundColor: colors.bg.primary,
    }}>
      <View style={{ flex: 1 }} />
      <Text style={{
        fontSize: 14,
        fontWeight: '600',
        color: colors.text.primary,
        letterSpacing: 0.5,
      }}>
        {formatarMesAno(mesSelecionado, anoSelecionado)}
      </Text>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={{
          fontSize: 13,
          color: colors.text.secondary,
        }}>
          {usuario?.nome}
        </Text>
      </View>
    </View>
  )
}
