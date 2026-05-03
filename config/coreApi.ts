import AsyncStorage from '@react-native-async-storage/async-storage'

const CORE_API_URL =
  process.env.EXPO_PUBLIC_CORE_API_URL || 'http://localhost:4000/api/v1'

const TOKEN_KEY = 'pactum_email'
const CORE_TOKEN_KEY = 'pactum_core_token'
const PACTUM_TOKEN_KEY = 'pactum_token'
const TIMEOUT_MS = 10_000

let _tokenCache: string | null | undefined = undefined
let _isRefreshing = false

const getCoreToken = async (): Promise<string | null> => {
  if (_tokenCache !== undefined) return _tokenCache
  _tokenCache = await AsyncStorage.getItem(CORE_TOKEN_KEY)
  return _tokenCache
}

const saveCoreToken = async (token: string): Promise<void> => {
  _tokenCache = token
  await AsyncStorage.setItem(CORE_TOKEN_KEY, token)
}

const removeCoreToken = async (): Promise<void> => {
  _tokenCache = null
  await AsyncStorage.removeItem(CORE_TOKEN_KEY)
}

const tryRefresh = async (): Promise<boolean> => {
  if (_isRefreshing) return false
  _isRefreshing = true
  try {
    const [email, pactumToken] = await Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(PACTUM_TOKEN_KEY),
    ])
    if (!email || !pactumToken) return false

    const res = await fetch(`${CORE_API_URL}/auth/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, pactum_token: pactumToken }),
    })
    const data = await res.json()
    if (res.ok && data.data?.token) {
      await saveCoreToken(data.data.token)
      return true
    }
    return false
  } catch {
    return false
  } finally {
    _isRefreshing = false
  }
}

const request = async (
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<any> => {
  const token = await getCoreToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${CORE_API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    // Auto-refresh: token expirado → tenta renovar e retenta uma vez
    if (response.status === 401 && !isRetry) {
      const refreshed = await tryRefresh()
      if (refreshed) return request(endpoint, options, true)
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisicao')
    }

    return data
  } finally {
    clearTimeout(timer)
  }
}

export const coreApi = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body: object) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint: string, body: object) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string) => request(endpoint, { method: 'DELETE' }),
  saveCoreToken,
  removeCoreToken,
  getCoreToken,
}

export default coreApi
