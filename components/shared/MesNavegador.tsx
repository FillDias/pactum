import { View, Text, TouchableOpacity } from 'react-native'
import { colors } from '../../constants/colors'
import { formatarMesAno, getMesAtual, getAnoAtual } from '../../utils/formatters'

type Props = {
  mes: number
  ano: number
  onChange: (mes: number, ano: number) => void
}

function navegar(mes: number, ano: number, direcao: -1 | 1): { mes: number; ano: number } {
  let novoMes = mes + direcao
  let novoAno = ano
  if (novoMes < 1) { novoMes = 12; novoAno-- }
  if (novoMes > 12) { novoMes = 1; novoAno++ }
  return { mes: novoMes, ano: novoAno }
}

export default function MesNavegador({ mes, ano, onChange }: Props) {
  const ehMesAtual = mes === getMesAtual() && ano === getAnoAtual()

  const ir = (direcao: -1 | 1) => {
    const next = navegar(mes, ano, direcao)
    onChange(next.mes, next.ano)
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <TouchableOpacity
        onPress={() => ir(-1)}
        style={{ padding: 8 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ color: colors.text.secondary, fontSize: 18, lineHeight: 20 }}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => !ehMesAtual && onChange(getMesAtual(), getAnoAtual())}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 8,
          backgroundColor: ehMesAtual ? colors.bg.secondary : colors.accent.main + '22',
          borderWidth: 1,
          borderColor: ehMesAtual ? colors.bg.border : colors.accent.main + '55',
        }}
      >
        <Text style={{
          fontSize: 14,
          fontWeight: '600',
          color: ehMesAtual ? colors.text.secondary : colors.accent.dark,
        }}>
          {formatarMesAno(mes, ano)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => ir(1)}
        disabled={ehMesAtual}
        style={{ padding: 8, opacity: ehMesAtual ? 0.3 : 1 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={{ color: colors.text.secondary, fontSize: 18, lineHeight: 20 }}>›</Text>
      </TouchableOpacity>
    </View>
  )
}
