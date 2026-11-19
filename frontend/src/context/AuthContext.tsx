import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from '../types'
import { api } from '../lib/api'

// Shape of the auth context value
interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

// Create the context with a default of null (must be used inside AuthProvider)
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true) // true while checking localStorage

  // On first load, check if there's a saved token in localStorage and restore session
  useEffect(() => {
    const savedToken = localStorage.getItem('crewly_token')
    if (savedToken) {
      setToken(savedToken)
      // Verify token is still valid by calling /auth/me
      api.get<User>('/auth/me')
        .then((userData) => setUser(userData))
        .catch(() => {
          // Token is expired or invalid — clear it
          localStorage.removeItem('crewly_token')
          setToken(null)
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  // Login: call the API, save token to localStorage, set user in state
  async function login(email: string, password: string) {
    const result = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    })

    localStorage.setItem('crewly_token', result.token)
    setToken(result.token)
    setUser(result.user)
  }

  // Logout: remove token from localStorage and clear state
  function logout() {
    localStorage.removeItem('crewly_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook so components can easily access auth state
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>')
  }
  return context
}
