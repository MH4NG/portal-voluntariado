import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { SEED_REQUESTS } from '../data/requests'
import { createId } from '../lib/id'
import { compareByUrgency } from '../lib/sort'
import { readJSON, writeJSON } from '../lib/storage'
import type { HelpRequest } from '../types'

const STORAGE_KEY = 'pontes:requests'

export type NewHelpRequest = Omit<HelpRequest, 'id' | 'createdAt'>

interface RequestsContextValue {
  /** Todas as ações (seed + criadas localmente), mais recentes primeiro */
  requests: HelpRequest[]
  getRequest: (id: string) => HelpRequest | undefined
  /** Ordenadas por urgência e depois pela data limite/criação */
  urgentRequests: (limit?: number) => HelpRequest[]
  addRequest: (input: NewHelpRequest) => HelpRequest
}

const RequestsContext = createContext<RequestsContextValue | null>(null)

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [created, setCreated] = useState<HelpRequest[]>(() => readJSON<HelpRequest[]>(STORAGE_KEY, []))

  const requests = useMemo(
    () =>
      [...created, ...SEED_REQUESTS].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [created],
  )

  const getRequest = useCallback((id: string) => requests.find((r) => r.id === id), [requests])

  const urgentRequests = useCallback(
    (limit = 4) => [...requests].sort(compareByUrgency).slice(0, limit),
    [requests],
  )

  const addRequest = useCallback((input: NewHelpRequest) => {
    const request: HelpRequest = {
      ...input,
      id: createId(input.title),
      createdAt: new Date().toISOString(),
    }
    setCreated((prev) => {
      const next = [request, ...prev]
      writeJSON(STORAGE_KEY, next)
      return next
    })
    return request
  }, [])

  const value = useMemo(
    () => ({ requests, getRequest, urgentRequests, addRequest }),
    [requests, getRequest, urgentRequests, addRequest],
  )

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useRequests(): RequestsContextValue {
  const ctx = useContext(RequestsContext)
  if (!ctx) throw new Error('useRequests deve ser usado dentro de <RequestsProvider>')
  return ctx
}
