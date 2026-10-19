import type { ComponentType, SVGProps } from 'react'
import {
  IconBeneficiaryTab,
  IconChannels,
  IconChat,
  IconHandshake,
  IconImpact,
  IconInstitution,
  IconMapSearch,
  IconPin,
  IconProfile,
  IconVolunteerTab,
} from './HowItWorksIcons'

export type JourneyId = 'voluntario' | 'beneficiario'

type Icon = ComponentType<SVGProps<SVGSVGElement>>

export interface JourneyStep {
  title: string
  description: string
  icon: Icon
  /** Pequenas etiquetas de apoio exibidas no card (opcional) */
  tags?: string[]
}

export interface Journey {
  id: JourneyId
  /** Rótulo da aba */
  label: string
  tabIcon: Icon
  /** Frase curta exibida no topo do painel */
  intro: string
  steps: JourneyStep[]
  cta: { label: string; to: string }
}

export const JOURNEYS: Journey[] = [
  {
    id: 'voluntario',
    label: 'Para voluntários',
    tabIcon: IconVolunteerTab,
    intro: 'Você escolhe a causa, o horário e o bairro. A gente aproxima você de quem precisa.',
    steps: [
      {
        title: 'Crie seu perfil',
        description:
          'Conte do que você gosta e quando pode ajudar. Seus interesses e sua disponibilidade deixam as sugestões muito mais certeiras.',
        icon: IconProfile,
        tags: ['Interesses', 'Disponibilidade'],
      },
      {
        title: 'Encontre ações no mapa',
        description:
          'Veja no mapa da cidade os pedidos perto de você e filtre por categoria ou urgência para achar o que combina com você.',
        icon: IconMapSearch,
        tags: ['Perto de você', 'Filtros'],
      },
      {
        title: 'Fale direto com quem precisa',
        description:
          'Sem chat intermediário: com um toque você abre o WhatsApp com uma mensagem pronta ou envia um e-mail para a instituição.',
        icon: IconChat,
        tags: ['WhatsApp', 'E-mail'],
      },
      {
        title: 'Ajude e acompanhe seu impacto',
        description:
          'Participe da ação, faça a diferença no seu bairro e veja como cada gesto se soma ao impacto da comunidade.',
        icon: IconImpact,
      },
    ],
    cta: { label: 'Quero ser voluntário', to: '/cadastro?perfil=voluntario' },
  },
  {
    id: 'beneficiario',
    label: 'Para quem precisa de ajuda',
    tabIcon: IconBeneficiaryTab,
    intro: 'Pessoas e instituições publicam o que precisam em poucos minutos — e de graça.',
    steps: [
      {
        title: 'Cadastre sua instituição ou pedido',
        description:
          'Crie um perfil como pessoa ou instituição e descreva com clareza a ajuda de que você precisa.',
        icon: IconInstitution,
        tags: ['Pessoa', 'Instituição'],
      },
      {
        title: 'Informe o endereço',
        description:
          'O endereço vira um pin no mapa da cidade, para que voluntários da região encontrem seu pedido com facilidade.',
        icon: IconPin,
        tags: ['Pin no mapa'],
      },
      {
        title: 'Escolha seus canais de contato',
        description:
          'Você decide como quer ser procurado: WhatsApp, e-mail ou redes sociais. Mostramos só o que você escolher.',
        icon: IconChannels,
        tags: ['WhatsApp', 'E-mail', 'Redes sociais'],
      },
      {
        title: 'Receba voluntários e conclua a ação',
        description:
          'Combine os detalhes diretamente com quem se ofereceu para ajudar e celebre cada ação concluída.',
        icon: IconHandshake,
      },
    ],
    cta: { label: 'Preciso de ajuda', to: '/cadastro?perfil=beneficiario' },
  },
]
