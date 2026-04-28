const BACEN_CDI_URL =
  'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'

export const buscarCDI = async (): Promise<number | null> => {
  try {
    const res = await fetch(BACEN_CDI_URL)
    if (!res.ok) return null
    const data = await res.json()
    const valor = data?.[0]?.valor
    const rate = parseFloat(String(valor ?? '0').replace(',', '.'))
    return isNaN(rate) ? null : rate
  } catch {
    return null
  }
}
