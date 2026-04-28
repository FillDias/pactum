import { View, ActivityIndicator, Text } from 'react-native'
import { colors } from '../../constants/colors'

type Props = {
  mensagem?: string
}

export default function Loading({ mensagem = 'Carregando...' }: Props) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.primary }}>
      <ActivityIndicator size="large" color={colors.text.primary} />
      <Text style={{ color: colors.text.tertiary, marginTop: 12, fontSize: 14 }}>{mensagem}</Text>
    </View>
  )
}
