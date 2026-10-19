import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { SEED_REQUESTS } from '../data/requests'
import { createId } from '../lib/id'
import { compareByUrgency, isRequestExpired } from '../lib/sort'
import { readJSON, writeJSON } from '../lib/storage'
import type { HelpRequest } from '../types'

const STORAGE_KEY = 'pontes:requests'

export type NewHelpRequest = Omit<HelpRequest, 'id' | 'createdAt'>

interface RequestsContextValue {
  /** Todas as ações (seed + criadas localmente), mais recentes primeiro */
  requests: HelpRequest[]
  getRequest: (id: string) => HelpRequest | undefined
  /** Apenas pedidos com prazo em aberto, ordenados por urgência e depois pela data limite/criação */
  urgentRequests: (limit?: number) => HelpRequest[]
  addRequest: (input: NewHelpRequest) => AddRequestResult
}

export interface AddRequestResult {
  request: HelpRequest
  /** false = não coube no armazenamento do navegador (fica só nesta sessão) */
  persisted: boolean
  /** true = o pedido foi salvo, mas sem a imagem, para caber no armazenamento */
  imageDropped: boolean
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
    (limit = 4) => {
      const now = new Date()
      return requests
        .filter((r) => !isRequestExpired(r, now))
        .sort(compareByUrgency)
        .slice(0, limit)
    },
    [requests],
  )

  const addRequest = useCallback(
    (input: NewHelpRequest): AddRequestResult => {
      let request: HelpRequest = {
        ...input,
        id: createId(input.title),
        createdAt: new Date().toISOString(),
      }
      // Grava fora do updater do estado (que precisa ser puro); imagens em data URL podem estourar a cota
      let persisted = writeJSON(STORAGE_KEY, [request, ...created])
      let imageDropped = false
      if (!persisted && request.image) {
        const { image: _image, imageAlt: _imageAlt, ...withoutImage } = request
        request = withoutImage
        imageDropped = true
        persisted = writeJSON(STORAGE_KEY, [request, ...created])
        if (!persisted) {
          // último recurso: remove também as imagens dos pedidos anteriores criados neste navegador
          const lighter = created.map(({ image: _i, imageAlt: _a, ...rest }) => rest)
          persisted = writeJSON(STORAGE_KEY, [request, ...lighter])
          if (persisted) {
            setCreated([request, ...lighter])
            return { request, persisted, imageDropped }
          }
        }
      }
      setCreated((prev) => [request, ...prev])
      return { request, persisted, imageDropped }
    },
    [created],
  )

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
