import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type PKIUser } from '../services/mockPKIAuth'

interface AuthContextType {
  user: PKIUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: PKIUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'cac_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PKIUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PKIUser
        setUser(parsed)
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (authenticatedUser: PKIUser) => {
    setUser(authenticatedUser)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authenticatedUser))
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem(SESSION_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
