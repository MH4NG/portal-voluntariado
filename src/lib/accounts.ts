import type { UserProfile } from '../types'
import { readJSON } from './storage'

/** Chave dos perfis cadastrados neste navegador (MVP sem backend). */
export const USERS_KEY = 'pontes:users'

export const DUPLICATE_EMAIL_MESSAGE = 'Já existe um cadastro com este e-mail. Entre para continuar.'

export function loadUsers(): UserProfile[] {
  return readJSON<UserProfile[]>(USERS_KEY, [])
}

/** Já existe um perfil com este e-mail? */
export function hasAccount(email: string): boolean {
  const wanted = email.trim().toLowerCase()
  if (!wanted) return false
  return loadUsers().some((u) => u.email.toLowerCase() === wanted)
}
