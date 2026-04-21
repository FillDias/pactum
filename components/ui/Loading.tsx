// Tela de carregamento reutilizável
import { View, ActivityIndicator, Text } from 'react-native'

type Props = {
  mensagem?: string
}

export default function Loading({ mensagem = 'Carregando...' }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#1e1b4b" />
      <Text className="text-gray-400 mt-3 text-sm">{mensagem}</Text>
    </View>
  )
}
