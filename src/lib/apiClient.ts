import axios, { type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '../stores/authStore'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) return null

  try {
    const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
    useAuthStore.getState().setTokens(res.data.accessToken, res.data.refreshToken)
    return res.data.accessToken as string
  } catch {
    useAuthStore.getState().logout()
    return null
  }
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as RetryableConfig | undefined

    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes('/auth/')) {
      original._retry = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`)
        return apiClient(original)
      }
    }

    return Promise.reject(error)
  },
)
