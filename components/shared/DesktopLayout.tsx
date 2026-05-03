import { View, Text, TouchableOpacity } from 'react-native'
import { router, usePathname } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { colors } from '../../constants/colors'
import { useResponsive } from '../../hooks/useResponsive'
import DesktopHeader from './DesktopHeader'

type NavItem = {
  label: string
  icon: React.ComponentProps<typeof Feather>['name']
  href: string
}

const GRUPOS_NAV: Array<{ grupo: string; items: NavItem[] }> = [
  {
    grupo: 'Financas',
    items: [
      { label: 'Inicio',    icon: 'home',              href: '/'           },
      { label: 'Gastos',    icon: 'arrow-down-circle', href: '/lancamento' },
      { label: 'Receitas',  icon: 'arrow-up-circle',   href: '/receitas'   },
    ],
  },
  {
    grupo: 'Patrimonio',
    items: [
      { label: 'Investimentos', icon: 'trending-up', href: '/investimentos' },
    ],
  },
  {
    grupo: 'Conta',
    items: [
      { label: 'Configuracoes', icon: 'settings', href: '/configuracoes' },
    ],
  },
]

type Props = {
  children: React.ReactNode
}

export default function DesktopLayout({ children }: Props) {
  const { isDesktop } = useResponsive()
  const pathname = usePathname()

  if (!isDesktop) {
    return <>{children}</>
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.bg.primary }}>

      {/* Sidebar */}
      <View style={{
        width: 240,
        backgroundColor: colors.bg.secondary,
        borderRightWidth: 1,
        borderRightColor: colors.bg.border,
        paddingTop: 32,
        paddingHorizontal: 16,
        flexDirection: 'column',
      }}>

        {/* Logo */}
        <View style={{ paddingHorizontal: 8, marginBottom: 36 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: '800',
            color: colors.text.primary,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}>
            PACTUM
          </Text>
          <Text style={{
            fontSize: 10,
            color: colors.text.tertiary,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginTop: 3,
          }}>
            gestao financeira
          </Text>
        </View>

        {/* Grupos de navegacao */}
        <View style={{ gap: 24 }}>
          {GRUPOS_NAV.map((grupo, gi) => (
            <View key={grupo.grupo}>
              <Text style={{
                fontSize: 9,
                color: colors.text.tertiary,
                letterSpacing: 1.8,
                textTransform: 'uppercase',
                paddingHorizontal: 12,
                marginBottom: 6,
              }}>
                {grupo.grupo}
              </Text>
              <View style={{ gap: 2 }}>
                {grupo.items.map((item) => {
                  const isActive = pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href))

                  return (
                    <TouchableOpacity
                      key={item.href}
                      onPress={() => router.push(item.href as any)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        borderRadius: 8,
                        backgroundColor: isActive ? colors.text.primary + '0C' : 'transparent',
                      }}
                    >
                      <Feather
                        name={item.icon}
                        size={16}
                        color={isActive ? colors.text.primary : colors.text.tertiary}
                      />
                      <Text style={{
                        fontSize: 13,
                        fontWeight: isActive ? '700' : '400',
                        color: isActive ? colors.text.primary : colors.text.secondary,
                      }}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
              {gi < GRUPOS_NAV.length - 1 && (
                <View style={{
                  height: 1,
                  backgroundColor: colors.bg.border,
                  marginTop: 16,
                }} />
              )}
            </View>
          ))}
        </View>

        {/* Versao no rodape */}
        <View style={{ flex: 1 }} />
        <Text style={{
          fontSize: 11,
          color: colors.text.tertiary,
          paddingHorizontal: 8,
          paddingBottom: 24,
          letterSpacing: 0.5,
        }}>
          v1.0
        </Text>
      </View>

      {/* Area de conteudo */}
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <DesktopHeader />
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </View>

    </View>
  )
}
