import type { SVGProps } from 'react'

/**
 * Ícones de traço (24×24) usados na linha do tempo "Como funciona".
 * São sempre decorativos: o texto do passo carrega o significado.
 */
type IconProps = SVGProps<SVGSVGElement>

function Svg({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

/** Perfil com interesses (crachá + estrela) */
export function IconProfile(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <circle cx="9" cy="10.5" r="2.25" />
      <path d="M5.75 16.5c.55-1.7 1.8-2.6 3.25-2.6s2.7.9 3.25 2.6" />
      <path d="M15 9h3M15 12.5h3" />
    </Svg>
  )
}

/** Mapa com pin (encontrar ações perto) */
export function IconMapSearch(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z" />
      <path d="M9 4v14M15 6v5" />
      <path d="M17.5 13.25a2.25 2.25 0 1 0 0 .01" />
      <path d="m19.2 15.4 1.55 1.55" />
    </Svg>
  )
}

/** Balão de conversa (contato direto) */
export function IconChat(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 11.5a7.5 7.5 0 0 1-11.06 6.6L4 19.5l1.4-4.6A7.5 7.5 0 1 1 20 11.5Z" />
      <path d="M9 10.25c.25 1.9 1.85 3.5 3.75 3.75l1.1-1.1 1.65.75-.35 1.35" />
    </Svg>
  )
}

/** Coração com mãos / impacto */
export function IconImpact(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 20s-7.5-4.35-7.5-10A4.25 4.25 0 0 1 12 7.4 4.25 4.25 0 0 1 19.5 10c0 5.65-7.5 10-7.5 10Z" />
      <path d="M8.5 11.5h2l1-2 1.5 4 1-2h1.5" />
    </Svg>
  )
}

/** Instituição / casa (cadastro de quem precisa) */
export function IconInstitution(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 10 12 4l8.5 6" />
      <path d="M5.5 9v10.5h13V9" />
      <path d="M10 19.5v-4.25a2 2 0 0 1 4 0v4.25" />
      <path d="M12 11.6s-1.9-1.1-1.9-2.4a1 1 0 0 1 1.9-.45 1 1 0 0 1 1.9.45c0 1.3-1.9 2.4-1.9 2.4Z" />
    </Svg>
  )
}

/** Pin no mapa (endereço vira marcador) */
export function IconPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M8 21h8" />
    </Svg>
  )
}

/** Canais de contato (telefone + envelope) */
export function IconChannels(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="3.5" width="8" height="14" rx="2" />
      <path d="M6.25 14.5h1.5" />
      <rect x="13" y="9" width="8" height="11.5" rx="1.75" />
      <path d="m13.5 10 3.5 3 3.5-3" />
    </Svg>
  )
}

/** Aperto de mãos / ação concluída */
export function IconHandshake(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m11 7.5-1.6-1.3a2.5 2.5 0 0 0-3.2.1L3 9.2v5.3l2 .5" />
      <path d="m13 7.5 1.6-1.3a2.5 2.5 0 0 1 3.2.1L21 9.2v5.3l-2.5.8" />
      <path d="M13 7.5 9.4 10.6a1.4 1.4 0 0 0 1.9 2.1l1.7-1.3 4.6 4.3a1.3 1.3 0 0 1-1.8 1.9l-.5-.4" />
      <path d="m5 15 3.2 3a1.3 1.3 0 0 0 1.85-1.8M10 16.2l1.5 1.4a1.3 1.3 0 0 0 1.85-1.8M12.2 18.2l.8.7a1.3 1.3 0 0 0 1.85-1.8" />
    </Svg>
  )
}

/** Ícone pequeno das abas: pessoa com coração (voluntário) */
export function IconVolunteerTab(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="7.5" r="3" />
      <path d="M3.5 19.5c.6-3.4 2.75-5.25 5.5-5.25 1.2 0 2.3.35 3.2 1" />
      <path d="M17.5 20s-3.5-2.05-3.5-4.6a1.85 1.85 0 0 1 3.5-.85 1.85 1.85 0 0 1 3.5.85c0 2.55-3.5 4.6-3.5 4.6Z" />
    </Svg>
  )
}

/** Ícone pequeno das abas: casa com mão estendida (quem precisa) */
export function IconBeneficiaryTab(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9v10.5h12V9" />
      <path d="M9.5 15.5h1.75l1.5-1.25a1.2 1.2 0 0 1 1.6 1.75L12.5 17.5H9.5" />
    </Svg>
  )
}
