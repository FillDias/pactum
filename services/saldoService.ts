import api from '../config/api'
import { Saldo } from '../types'

export const buscarSaldo = async (
  mes: number,
  ano: number
): Promise<Saldo> => {
  const data = await api.get(`/saldo?mes=${mes}&ano=${ano}`)
  const s = data.saldo ?? data

  const toNum = (v: any): number => {
    const n = parseFloat(String(v ?? '0'))
    return isNaN(n) ? 0 : n
  }

  return {
    total_receitas: toNum(s.total_receitas),
    total_gastos:   toNum(s.total_gastos),
    saldo:          toNum(s.saldo),
    positivo:       Boolean(s.positivo),
    mes:            toNum(s.mes),
    ano:            toNum(s.ano),
  }
}
