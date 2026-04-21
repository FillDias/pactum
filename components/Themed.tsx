// Componente de tema — stub do boilerplate Expo, será substituído na Parte 3
import { Text as DefaultText, View as DefaultView } from 'react-native'
import { useColorScheme } from './useColorScheme'

type ThemeProps = { lightColor?: string; darkColor?: string }
export type TextProps = ThemeProps & DefaultText['props']
export type ViewProps = ThemeProps & DefaultView['props']

const fallback = { light: { text: '#000', background: '#fff' }, dark: { text: '#fff', background: '#000' } }

export function useThemeColor(props: { light?: string; dark?: string }, colorName: 'text' | 'background') {
  const theme = useColorScheme() ?? 'light'
  return props[theme] ?? fallback[theme][colorName]
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...rest } = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text')
  return <DefaultText style={[{ color }, style]} {...rest} />
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...rest } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background')
  return <DefaultView style={[{ backgroundColor }, style]} {...rest} />
}
