import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'

export const TOKEN_KEY = 'crs_access_token'

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor: Tu dong gan JWT token vao Authorization header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response Interceptor: Xu ly tap trung ma loi 401 & 403
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401) {
        removeToken()
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      } else if (status === 403) {
        window.dispatchEvent(
          new CustomEvent('auth:forbidden', {
            detail: { message: 'Bạn không có quyền thực hiện thao tác này.' },
          })
        )
      }
    }
    return Promise.reject(error)
  }
)

export default axiosClient

