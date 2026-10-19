export interface ImpactStat {
  id: string
  value: number
  /** Prefixo/sufixo exibidos junto ao número (ex.: "+", " kg") */
  prefix?: string
  suffix?: string
  label: string
  description: string
}

export const IMPACT_STATS: ImpactStat[] = [
  {
    id: 'voluntarios',
    value: 1284,
    label: 'voluntários cadastrados',
    description: 'Pessoas da cidade dispostas a doar seu tempo.',
  },
  {
    id: 'alimentos',
    value: 18750,
    suffix: ' kg',
    label: 'de alimentos arrecadados',
    description: 'Doações entregues a famílias e cozinhas comunitárias.',
  },
  {
    id: 'acoes',
    value: 342,
    label: 'ações concluídas',
    description: 'Pedidos de ajuda atendidos de ponta a ponta.',
  },
  {
    id: 'instituicoes',
    value: 87,
    label: 'instituições parceiras',
    description: 'ONGs, associações de bairro e coletivos.',
  },
]
