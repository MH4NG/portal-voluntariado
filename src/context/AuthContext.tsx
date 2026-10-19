import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { readJSON, removeKey, writeJSON } from '../lib/storage'
import type { UserProfile } from '../types'

/**
 * Autenticação simulada para o MVP (sem backend): perfis ficam no localStorage.
 * A interface foi pensada para ser trocada por uma API real sem mudar os consumidores.
 */
const USERS_KEY = 'pontes:users'
const SESSION_KEY = 'pontes:session'

interface AuthContextValue {
  user: UserProfile | null
  /** Cadastra (ou substitui, pelo e-mail) e inicia a sessão */
  register: (profile: UserProfile) => void
  /** Inicia a sessão de um perfil já cadastrado. Retorna false se o e-mail não existir. */
  login: (email: string) => boolean
  logout: () => void
  /** Atualiza o perfil logado (ex.: adicionar requestIds ao beneficiário) */
  updateUser: (patch: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadUsers(): UserProfile[] {
  return readJSON<UserProfile[]>(USERS_KEY, [])
}

function saveUser(profile: UserProfile) {
  const users = loadUsers().filter((u) => u.email.toLowerCase() !== profile.email.toLowerCase())
  writeJSON(USERS_KEY, [...users, profile])
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const email = readJSON<string | null>(SESSION_KEY, null)
    if (!email) return null
    return loadUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null
  })

  const register = useCallback((profile: UserProfile) => {
    saveUser(profile)
    writeJSON(SESSION_KEY, profile.email)
    setUser(profile)
  }, [])

  const login = useCallback((email: string) => {
    const found = loadUsers().find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
    if (!found) return false
    writeJSON(SESSION_KEY, found.email)
    setUser(found)
    return true
  }, [])

  const logout = useCallback(() => {
    removeKey(SESSION_KEY)
    setUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch } as UserProfile
      saveUser(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ user, register, login, logout, updateUser }),
    [user, register, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
