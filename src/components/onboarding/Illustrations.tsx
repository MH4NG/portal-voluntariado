import { cn } from '../../lib/cn'

/* Ilustrações decorativas em SVG inline (sempre aria-hidden). */

export function VolunteerIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true" className={cn('h-auto w-full', className)}>
      <defs>
        <linearGradient id="vol-heart" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2fae9f" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="96" r="78" fill="#c8f2ea" />
      <circle cx="160" cy="96" r="54" fill="#95e3d5" opacity="0.55" />
      {/* coração */}
      <path
        d="M160 128c-30-18-48-36-48-56 0-14 11-24 24-24 10 0 18 6 24 15 6-9 14-15 24-15 13 0 24 10 24 24 0 20-18 38-48 56Z"
        fill="url(#vol-heart)"
      />
      <path d="M138 66c4-6 10-8 15-6" stroke="#effcf9" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* mão esquerda */}
      <path d="M40 180c8-26 22-44 44-52l26-8c8-2 14 4 11 11l-6 12 30-10c7-2 12 6 7 11l-30 26c-10 9-22 10-34 10H40Z" fill="#c68b59" />
      <path d="M28 180c4-18 10-30 22-40l18 40H28Z" fill="#243b53" />
      {/* mão direita */}
      <path d="M280 180c-8-26-22-44-44-52l-26-8c-8-2-14 4-11 11l6 12-30-10c-7-2-12 6-7 11l30 26c10 9 22 10 34 10h48Z" fill="#8d5524" />
      <path d="M292 180c-4-18-10-30-22-40l-18 40h40Z" fill="#334e68" />
      {/* brilhos */}
      <path d="M86 46l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8Z" fill="#fbbf24" />
      <path d="M238 34l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4 2.4-6Z" fill="#fbbf24" />
      <circle cx="252" cy="78" r="4" fill="#179286" />
      <circle cx="70" cy="92" r="3" fill="#486581" />
    </svg>
  )
}

export function BeneficiaryIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 180" aria-hidden="true" className={cn('h-auto w-full', className)}>
      <circle cx="160" cy="98" r="78" fill="#d9e2ec" />
      <path d="M40 160h240" stroke="#bcccdc" strokeWidth="6" strokeLinecap="round" />
      {/* casas */}
      <path d="M58 160v-46l30-24 30 24v46H58Z" fill="#486581" />
      <path d="M52 116l36-30 36 30" stroke="#243b53" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="80" y="130" width="16" height="30" rx="3" fill="#f8f3ea" />
      <path d="M200 160v-54l34-28 34 28v54h-68Z" fill="#334e68" />
      <path d="M194 108l40-34 40 34" stroke="#102a43" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="214" y="118" width="16" height="16" rx="3" fill="#fde68a" />
      <rect x="238" y="118" width="16" height="16" rx="3" fill="#f8f3ea" />
      <rect x="226" y="140" width="16" height="20" rx="3" fill="#f8f3ea" />
      {/* pessoa ao centro */}
      <circle cx="160" cy="112" r="11" fill="#8d5524" />
      <path d="M140 160c0-16 9-28 20-28s20 12 20 28h-40Z" fill="#0f766e" />
      {/* pin do mapa */}
      <path
        d="M160 20c-15 0-27 12-27 27 0 20 27 46 27 46s27-26 27-46c0-15-12-27-27-27Z"
        fill="#179286"
      />
      <circle cx="160" cy="47" r="10" fill="#ffffff" />
      <path d="M160 52c-5-3-8-6-8-9 0-2.2 1.8-4 4-4 1.6 0 3 .9 4 2.3 1-1.4 2.4-2.3 4-2.3 2.2 0 4 1.8 4 4 0 3-3 6-8 9Z" fill="#0f766e" />
      {/* ondas de sinal */}
      <path d="M118 42c-6 8-6 22 0 30M202 42c6 8 6 22 0 30" stroke="#5ccbbb" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}

export function SuccessIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" aria-hidden="true" className={cn('h-auto w-full', className)}>
      <circle cx="100" cy="80" r="62" fill="#c8f2ea" />
      <circle data-anim="badge" cx="100" cy="80" r="42" fill="#0f766e" />
      <path
        data-anim="badge"
        d="M80 81l13 13 27-29"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <g data-anim="confetti">
        <rect x="26" y="34" width="10" height="10" rx="2" fill="#fbbf24" transform="rotate(18 31 39)" />
        <circle cx="168" cy="40" r="6" fill="#179286" />
        <rect x="160" y="112" width="12" height="6" rx="3" fill="#334e68" transform="rotate(-24 166 115)" />
        <circle cx="34" cy="118" r="5" fill="#486581" />
        <path d="M178 82l2.4 6 6 2.4-6 2.4-2.4 6-2.4-6-6-2.4 6-2.4 2.4-6Z" fill="#fbbf24" />
        <path d="M18 76l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#5ccbbb" />
      </g>
    </svg>
  )
}
