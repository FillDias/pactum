import { useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useChatViewModel } from '../../viewmodels/useChatViewModel'

export default function Chat() {
  const flatListRef = useRef<FlatList>(null)
  const vm = useChatViewModel()

  useEffect(() => {
    vm.buscarMensagens()
    vm.marcarComoLidas()
    return vm.setupSubscription()
  }, [])

  const handleEnviar = () => {
    vm.handleEnviar(() => flatListRef.current?.scrollToEnd())
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="bg-indigo-900 px-6 pt-14 pb-4">
        <Text className="text-white text-xl font-bold">Chat 💬</Text>
        <Text className="text-white opacity-70 text-sm">Conversa da família</Text>
      </View>

      {/* Lista de mensagens */}
      <FlatList
        ref={flatListRef}
        data={vm.mensagens}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => {
          const minha = item.user_id === vm.usuarioId
          const sistema = item.tipo === 'sistema'

          if (sistema) {
            return (
              <View className="bg-gray-100 rounded-xl px-4 py-2 mx-4">
                <Text className="text-gray-500 text-xs text-center">🤖 {item.conteudo}</Text>
              </View>
            )
          }

          return (
            <View className={`max-w-xs ${minha ? 'self-end' : 'self-start'}`}>
              <View className={`rounded-2xl px-4 py-3 ${minha ? 'bg-indigo-900' : 'bg-white'}`}>
                <Text className={minha ? 'text-white' : 'text-gray-800'}>{item.conteudo}</Text>
              </View>
              <Text className="text-gray-400 text-xs mt-1 px-1">
                {new Date(item.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          )
        }}
      />

      {/* Input */}
      <View className="flex-row items-center px-4 py-3 bg-white border-t border-gray-100">
        <TextInput
          className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3 text-base"
          placeholder="Mensagem..."
          value={vm.mensagem}
          onChangeText={vm.setMensagem}
          multiline
        />
        <TouchableOpacity
          className="bg-indigo-900 w-11 h-11 rounded-full items-center justify-center"
          onPress={handleEnviar}
        >
          <Text className="text-white text-lg">➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}
