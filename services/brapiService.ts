import { Cotacao } from '../types'

const TOKEN = process.env.EXPO_PUBLIC_BRAPI_TOKEN ?? ''
const BRAPI_BASE = 'https://brapi.dev/api'
const BACEN_CDI_URL =
  'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'

export const buscarCotacao = async (tickers: string[]): Promise<Cotacao[] | null> => {
  const joined = tickers.join(',')
  const url = `${BRAPI_BASE}/quote/${joined}?token=${TOKEN}`
  console.log('[BRAPI] buscarCotacao tickers:', tickers)
  try {
    const res = await fetch(url)
    console.log('[BRAPI] buscarCotacao response.ok:', res.ok, 'status:', res.status)
    if (!res.ok) return null
    const data = await res.json()
    console.log('[BRAPI] buscarCotacao data:', JSON.stringify(data?.results?.slice(0, 2)))
    return (data.results ?? []).map((r: any): Cotacao => ({
      symbol: r.symbol,
      shortName: r.shortName ?? r.symbol,
      preco: r.regularMarketPrice,
      variacao: r.regularMarketChange,
      variacaoPercent: r.regularMarketChangePercent,
    }))
  } catch (e) {
    console.log('[BRAPI] buscarCotacao erro:', e)
    return null
  }
}

export const buscarCDI = async (): Promise<number | null> => {
  console.log('[BACEN] buscarCDI url:', BACEN_CDI_URL)
  try {
    const res = await fetch(BACEN_CDI_URL)
    console.log('[BACEN] buscarCDI response.ok:', res.ok, 'status:', res.status)
    if (!res.ok) return null
    const data = await res.json()
    console.log('[BACEN] buscarCDI data:', JSON.stringify(data))
    const valor = data?.[0]?.valor
    const rate = parseFloat(String(valor ?? '0').replace(',', '.'))
    console.log('[BACEN] buscarCDI taxa anual:', rate)
    return isNaN(rate) ? null : rate
  } catch (e) {
    console.log('[BACEN] buscarCDI erro:', e)
    return null
  }
}
