import coreApi from '../config/coreApi'
import { Portfolio, PortfolioSummary, PortfolioTransaction, Security } from '../types'

export async function listarPortfolios(): Promise<Portfolio[]> {
  const res = await coreApi.get('/portfolios')
  return res.data ?? []
}

export async function criarPortfolio(data: {
  name: string
  description?: string
  currency?: string
}): Promise<Portfolio> {
  const res = await coreApi.post('/portfolios', { portfolio: data })
  return res.data
}

export async function deletarPortfolio(id: string): Promise<void> {
  await coreApi.delete(`/portfolios/${id}`)
}

export async function buscarPosicoes(portfolioId: string): Promise<PortfolioSummary> {
  const res = await coreApi.get(`/portfolios/${portfolioId}/positions`)
  return res.data
}

export type TransacoesPaginadas = {
  data: PortfolioTransaction[]
  meta: { page: number; per_page: number; total: number; total_pages: number }
}

export async function listarTransacoes(
  portfolioId: string,
  page = 1,
  perPage = 25
): Promise<TransacoesPaginadas> {
  const res = await coreApi.get(
    `/portfolios/${portfolioId}/transactions?page=${page}&per_page=${perPage}`
  )
  return { data: res.data ?? [], meta: res.meta ?? { page, per_page: perPage, total: 0, total_pages: 0 } }
}

export async function adicionarTransacao(
  portfolioId: string,
  data: {
    securityId: string
    type: 'BUY' | 'SELL'
    quantity: number
    price: number
    date: string
    brokerId?: string
  }
): Promise<PortfolioTransaction> {
  const res = await coreApi.post(`/portfolios/${portfolioId}/transactions`, {
    transaction: {
      security_id: data.securityId,
      transaction_type: data.type,
      quantity: data.quantity,
      price: data.price,
      date: data.date,
      broker: data.brokerId ?? null,
    },
  })
  return res.data
}

export async function removerTransacao(portfolioId: string, txId: string): Promise<void> {
  await coreApi.delete(`/portfolios/${portfolioId}/transactions/${txId}`)
}

export async function calcularNAV(portfolioId: string): Promise<any> {
  const res = await coreApi.post(`/portfolios/${portfolioId}/calculations/nav`, {})
  return res.data
}

export async function calcularIRR(portfolioId: string): Promise<{ irr: number | null }> {
  const res = await coreApi.post(`/portfolios/${portfolioId}/calculations/irr`, {})
  return res.data
}

export async function calcularTWR(portfolioId: string): Promise<{ twr: number | null }> {
  const res = await coreApi.post(`/portfolios/${portfolioId}/calculations/twr`, {})
  return res.data
}

export async function buscarSecurities(query: string): Promise<Security[]> {
  const res = await coreApi.get(`/securities/search?q=${encodeURIComponent(query)}`)
  return res.data ?? []
}

export async function loginCoreApi(email: string, password: string): Promise<string> {
  const res = await coreApi.post('/auth/login', { email, password })
  const token: string = res.data?.token
  if (!token) throw new Error('Token nao recebido do core')
  await coreApi.saveCoreToken(token)
  return token
}

export async function registerCoreApi(
  name: string,
  email: string,
  password: string
): Promise<void> {
  const res = await coreApi.post('/auth/register', { name, email, password })
  const token: string = res.data?.token
  if (token) await coreApi.saveCoreToken(token)
}
