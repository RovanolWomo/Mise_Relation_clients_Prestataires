import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { api } from '@/services/api'

export interface AuthUser {
  id: number
  email: string
  nom: string
  prenom: string
  telephone?: string
  role: 'PARTICULIER' | 'PRESTATAIRE' | 'ADMIN'
  avatar?: string
  bio?: string
  verified?: boolean
  statut?: string
  categorie?: string
  tarif?: number
  zone?: string
  experience?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  register: (data: RegisterData) => Promise<AuthUser>
  logout: () => void
  updateUser: (user: AuthUser) => void
}

interface RegisterData {
  email: string
  password: string
  nom: string
  prenom: string
  telephone?: string
  role?: string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => { throw new Error('Not implemented') },
  register: async () => { throw new Error('Not implemented') },
  logout: () => {},
  updateUser: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const data = await api.post<{ user: AuthUser; token: string }>('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const register = async (registerData: RegisterData): Promise<AuthUser> => {
    const data = await api.post<{ user: AuthUser; token: string }>('/auth/register', registerData)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function roleToPath(role: AuthUser['role']): string {
  const map: Record<AuthUser['role'], string> = {
    PARTICULIER: '/particulier',
    PRESTATAIRE: '/prestataire',
    ADMIN: '/admin',
  }
  return map[role] || '/connexion'
}
