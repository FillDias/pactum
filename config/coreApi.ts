import AsyncStorage from '@react-native-async-storage/async-storage'

const CORE_API_URL =
  process.env.EXPO_PUBLIC_CORE_API_URL || 'http://localhost:4000/api/v1'

const TOKEN_KEY = 'pactum_core_token'
const TIMEOUT_MS = 10_000

let _tokenCache: string | null | undefined = undefined

const getCoreToken = async (): Promise<string | null> => {
  if (_tokenCache !== undefined) return _tokenCache
  _tokenCache = await AsyncStorage.getItem(TOKEN_KEY)
  return _tokenCache
}

const saveCoreToken = async (token: string): Promise<void> => {
  _tokenCache = token
  await AsyncStorage.setItem(TOKEN_KEY, token)
}

const removeCoreToken = async (): Promise<void> => {
  _tokenCache = null
  await AsyncStorage.removeItem(TOKEN_KEY)
}

const request = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
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
