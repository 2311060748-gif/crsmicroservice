import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  getToken,
  removeToken,
  setToken,
} from '../api/axiosClient'
import { loginApi, registerApi } from '../api/authApi'
import type { LoginRequest, RegisterRequest, RegisterResponse, Role } from '../types'

export interface AuthUser {
  username: string
  role: Role
}

interface JwtPayload {
  sub?: string
  role?: string
  exp?: number
}

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    // Base64Url decode with UTF-8 support
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload) as JwtPayload
  } catch {
    return null
  }
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<RegisterResponse>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const parseUserFromToken = useCallback((rawToken: string): AuthUser | null => {
    const payload = decodeJwt(rawToken)
    if (!payload) return null

    // Kiem tra token con han su dung
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null
    }

    const username = payload.sub || ''
    const role: Role = payload.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER'
    return { username, role }
  }, [])

  // Khoi tao state tu localStorage khi reload trang
  useEffect(() => {
    const savedToken = getToken()
    if (savedToken) {
      const parsed = parseUserFromToken(savedToken)
      if (parsed) {
        setTokenState(savedToken)
        setUser(parsed)
      } else {
        // Token het han hoac khong hop le
        removeToken()
        setTokenState(null)
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [parseUserFromToken])

  const logout = useCallback(() => {
    removeToken()
    setTokenState(null)
    setUser(null)
  }, [])

  // Lang nghe su kien 401 tu axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout()
    }
    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [logout])

  const login = useCallback(
    async (credentials: LoginRequest): Promise<void> => {
      const res = await loginApi(credentials)
      const accessToken = res.accessToken
      setToken(accessToken)
      setTokenState(accessToken)

      const parsed = parseUserFromToken(accessToken)
      if (parsed) {
        setUser(parsed)
      } else {
        setUser({ username: credentials.username, role: 'USER' })
      }
    },
    [parseUserFromToken]
  )

  const register = useCallback(
    async (data: RegisterRequest): Promise<RegisterResponse> => {
      return await registerApi(data)
    },
    []
  )

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isAdmin: user?.role === 'ADMIN',
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
