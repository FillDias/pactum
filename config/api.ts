import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem('pactum_token')
}

const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem('pactum_token', token)
}

const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem('pactum_token')
}

const request = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = await getToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Erro na requisicao')
  }

  return data
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, body: object) =>
    request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint: string, body: object) =>
    request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string) =>
    request(endpoint, { method: 'DELETE' }),
  saveToken,
  removeToken,
  getToken,
}

export default api
