import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

const TOKEN_KEY         = 'pactum_token'
const REFRESH_TOKEN_KEY = 'pactum_refresh_token'
const TIMEOUT_MS        = 10_000

let _tokenCache:        string | null | undefined = undefined
let _refreshTokenCache: string | null | undefined = undefined
let _isRefreshing = false

const getToken = async (): Promise<string | null> => {
  if (_tokenCache !== undefined) return _tokenCache
  _tokenCache = await AsyncStorage.getItem(TOKEN_KEY)
  return _tokenCache
}

const saveToken = async (token: string): Promise<void> => {
  _tokenCache = token
  await AsyncStorage.setItem(TOKEN_KEY, token)
}

const saveRefreshToken = async (token: string): Promise<void> => {
  _refreshTokenCache = token
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token)
}

const removeToken = async (): Promise<void> => {
  _tokenCache = null
  _refreshTokenCache = null
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY])
}

const tryRefresh = async (): Promise<boolean> => {
  if (_isRefreshing) return false
  _isRefreshing = true
  try {
    if (_refreshTokenCache === undefined) {
      _refreshTokenCache = await AsyncStorage.getItem(REFRESH_TOKEN_KEY)
    }
    if (!_refreshTokenCache) return false

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: _refreshTokenCache }),
    })
    const data = await res.json()
    if (res.ok && data.token) {
      await saveToken(data.token)
      if (data.refresh_token) await saveRefreshToken(data.refresh_token)
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
  const token = await getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    })

    if (response.status === 401 && !isRetry) {
      const refreshed = await tryRefresh()
      if (refreshed) return request(endpoint, options, true)
    }

    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Erro na requisicao')
    return data
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  get:    (endpoint: string) => request(endpoint),
  post:   (endpoint: string, body: object) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch:  (endpoint: string, body: object) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string) =>
    request(endpoint, { method: 'DELETE' }),
  saveToken,
  saveRefreshToken,
  removeToken,
  getToken,
}

export default api
