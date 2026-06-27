import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { User, AuthResponse } from '../types'
import { authAPI } from './api'

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'))
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const { data } = await authAPI.me()
      if (data.user) {
        setUser(data.user)
      }
    } catch {
      setUser(null)
      setToken(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [token])

  const login = async (email: string, password: string, rememberMe = false) => {
    const { data } = await authAPI.login({ email, password, rememberMe })
    if (!data.success || !data.token || !data.user) {
      throw new Error(data.error || '登录失败')
    }
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    if (rememberMe) {
      localStorage.setItem('remember', 'true')
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch {
      // ignore
    }
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('remember')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}