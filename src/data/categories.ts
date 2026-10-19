import type { Availability, CategoryId, Urgency } from '../types'

export interface CategoryMeta {
  id: CategoryId
  label: string
  /** Emoji decorativo — sempre renderizar com aria-hidden */
  emoji: string
  /** Cor de marcador no mapa (contraste ≥ 3:1 sobre o mapa claro) */
  pinColor: string
  /** Classes Tailwind para badge (texto ≥ 4.5:1 sobre o fundo) */
  badgeClass: string
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  animais: {
    id: 'animais',
    label: 'Causa animal',
    emoji: '🐾',
    pinColor: '#7c3aed',
    badgeClass: 'bg-violet-100 text-violet-900',
  },
  idosos: {
    id: 'idosos',
    label: 'Idosos',
    emoji: '🤝',
    pinColor: '#be185d',
    badgeClass: 'bg-pink-100 text-pink-900',
  },
  'meio-ambiente': {
    id: 'meio-ambiente',
    label: 'Meio ambiente',
    emoji: '🌳',
    pinColor: '#15803d',
    badgeClass: 'bg-green-100 text-green-900',
  },
  alimentacao: {
    id: 'alimentacao',
    label: 'Alimentação',
    emoji: '🥫',
    pinColor: '#c2410c',
    badgeClass: 'bg-orange-100 text-orange-900',
  },
  educacao: {
    id: 'educacao',
    label: 'Educação',
    emoji: '📚',
    pinColor: '#1d4ed8',
    badgeClass: 'bg-blue-100 text-blue-900',
  },
  saude: {
    id: 'saude',
    label: 'Saúde',
    emoji: '🩺',
    pinColor: '#b91c1c',
    badgeClass: 'bg-red-100 text-red-900',
  },
  moradia: {
    id: 'moradia',
    label: 'Moradia',
    emoji: '🏠',
    pinColor: '#a16207',
    badgeClass: 'bg-yellow-100 text-yellow-900',
  },
  criancas: {
    id: 'criancas',
    label: 'Crianças',
    emoji: '🧸',
    pinColor: '#0f766e',
    badgeClass: 'bg-teal-100 text-teal-900',
  },
}

export const CATEGORY_LIST: CategoryMeta[] = Object.values(CATEGORIES)

export const URGENCY: Record<Urgency, { label: string; rank: number; badgeClass: string }> = {
  alta: { label: 'Urgente', rank: 0, badgeClass: 'bg-urgent text-on-urgent' },
  media: { label: 'Prioridade média', rank: 1, badgeClass: 'bg-navy-100 text-navy-900' },
  baixa: { label: 'Sem pressa', rank: 2, badgeClass: 'bg-sand-200 text-navy-800' },
}

export const AVAILABILITY: Record<Availability, string> = {
  manha: 'Manhãs',
  tarde: 'Tardes',
  noite: 'Noites',
  'fins-de-semana': 'Fins de semana',
}
