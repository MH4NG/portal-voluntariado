import { useLocation, type To } from 'react-router-dom'
import type { UserProfile } from '../../types'

export interface NavItem {
  id: 'acoes' | 'como-funciona' | 'contato'
  label: string
  /** Texto de apoio exibido no menu móvel */
  description: string
  to: To
  /** Usa <NavLink> (com aria-current="page") em vez de <Link> */
  isRoute: boolean
}

/** Itens da navegação principal. "Contato" mantém a página atual e rola até o rodapé. */
export function useNavItems(): NavItem[] {
  const { pathname, search } = useLocation()
  return [
    {
      id: 'acoes',
      label: 'Ações',
      description: 'Mapa e lista de pedidos de ajuda',
      to: '/acoes',
      isRoute: true,
    },
    {
      id: 'como-funciona',
      label: 'Como Funciona',
      description: 'Entenda o caminho em poucos passos',
      to: '/#como-funciona',
      isRoute: false,
    },
    {
      id: 'contato',
      label: 'Contato',
      description: 'Fale com a equipe da prefeitura',
      to: { pathname, search, hash: '#contato' },
      isRoute: false,
    },
  ]
}

/** Link para /entrar que traz a pessoa de volta à página atual após o login. */
export function useLoginHref(): string {
  const { pathname, search } = useLocation()
  const skip = pathname === '/' || pathname.startsWith('/entrar') || pathname.startsWith('/cadastro')
  return skip ? '/entrar' : `/entrar?next=${encodeURIComponent(pathname + search)}`
}

/** Primeiro nome para pessoas; nome completo para instituições. */
export function displayName(user: UserProfile): string {
  const name = user.name.trim()
  if (user.kind === 'beneficiario' && user.entityType === 'instituicao') return name
  return name.split(/\s+/)[0] ?? name
}

export function initials(user: UserProfile): string {
  const parts = user.name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase() || '?'
}

export function profileLabel(user: UserProfile): string {
  if (user.kind === 'voluntario') return 'Perfil voluntário'
  return user.entityType === 'instituicao' ? 'Instituição' : 'Pessoa que precisa de ajuda'
}
