import { Platform } from 'react-native'
import { Tabs } from 'expo-router'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'

function TabIcon({
  name,
  focused,
}: {
  name: React.ComponentProps<typeof Feather>['name']
  focused: boolean
}) {
  return (
    <Feather
      name={name}
      size={22}
      color={focused ? colors.accent.main : colors.text.tertiary}
    />
  )
}

function TabsNavigator() {
  const insets = useSafeAreaInsets()

  // No Android, insets.bottom pode retornar 0 ao voltar do background.
  // Garantimos um padding mínimo para não sobrepor os botões do sistema.
  const bottomInset = Platform.OS === 'android'
    ? Math.max(insets.bottom, 8)
    : insets.bottom

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.secondary,
          borderTopColor: colors.bg.border,
          borderTopWidth: 1,
          height: 56 + bottomInset,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          letterSpacing: 0.2,
          marginTop: 2,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="lancamento"
        options={{
          title: 'Gastos',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="arrow-down-circle" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="receitas"
        options={{
          title: 'Receitas',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="arrow-up-circle" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="investimentos"
        options={{
          title: 'Invest.',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="trending-up" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="configuracoes"
        options={{
          title: 'Config',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="chat" options={{ href: null }} />
      <Tabs.Screen name="relatorio" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  )
}

export default function TabsLayout() {
  return (
    <SafeAreaProvider>
      <TabsNavigator />
    </SafeAreaProvider>
  )
}
