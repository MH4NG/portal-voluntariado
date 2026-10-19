import { useRef, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { MOTION, gsap, useGSAP } from '../../lib/gsap'
import { Container } from '../ui/Container'
import { BeneficiaryIllustration, VolunteerIllustration } from './Illustrations'

interface ProfileOption {
  perfil: 'voluntario' | 'beneficiario'
  title: string
  subtitle: string
  benefits: string[]
  cta: string
  illustration: ReactNode
  tone: 'teal' | 'navy'
}

const OPTIONS: ProfileOption[] = [
  {
    perfil: 'voluntario',
    title: 'Quero ajudar',
    subtitle: 'Sou voluntário(a)',
    benefits: [
      'Encontre ações perto de você, no mapa da cidade',
      'Escolha causas e horários que cabem na sua rotina',
      'Fale direto com quem precisa, por WhatsApp ou e-mail',
    ],
    cta: 'Começar como voluntário(a)',
    illustration: <VolunteerIllustration />,
    tone: 'teal',
  },
  {
    perfil: 'beneficiario',
    title: 'Preciso de ajuda',
    subtitle: 'Sou pessoa ou instituição',
    benefits: [
      'Publique seu pedido em poucos passos, sem custo',
      'Apareça no mapa para voluntários da sua região',
      'Receba contato direto, sem intermediários',
    ],
    cta: 'Publicar um pedido de ajuda',
    illustration: <BeneficiaryIllustration />,
    tone: 'navy',
  },
]

/** Primeira tela do cadastro: escolha entre os dois perfis (define ?perfil=). */
export function ProfileChooser({ notice }: { notice?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        gsap.from('[data-anim="intro"]', { opacity: 0, y: 16, duration: 0.5, ease: 'power2.out', stagger: 0.08 })
        gsap.from('[data-anim="card"]', {
          opacity: 0,
          y: 32,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.12,
          delay: 0.15,
          clearProps: 'opacity,transform',
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 size-160 -translate-x-1/2 rounded-full bg-teal-100/50 blur-3xl"
      />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        {notice}
        <div className="mx-auto max-w-2xl text-center">
          <p data-anim="intro" className="mb-3 text-sm font-bold tracking-widest text-primary uppercase">
            Cadastro gratuito
          </p>
          <h1 data-anim="intro" className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Como você quer participar?
          </h1>
          <p data-anim="intro" className="mt-4 text-lg text-ink-muted">
            Escolha um perfil para começar. Leva só alguns minutos, e cada pequena ajuda constrói uma ponte
            na nossa cidade.
          </p>
        </div>

        <ul className="mx-auto mt-10 grid max-w-5xl gap-6 sm:mt-14 md:grid-cols-2 lg:gap-8">
          {OPTIONS.map((opt) => (
            <li key={opt.perfil} data-anim="card">
              <ProfileCard option={opt} />
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-base text-ink-muted">
          Já tem cadastro?{' '}
          <Link
            to="/entrar"
            className="inline-flex min-h-12 items-center rounded-md px-1 font-semibold text-primary underline decoration-2 underline-offset-4 hover:text-primary-hover"
          >
            Entrar
          </Link>
        </p>
      </Container>
    </div>
  )
}

function ProfileCard({ option }: { option: ProfileOption }) {
  const teal = option.tone === 'teal'
  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card bg-surface-raised shadow-card ring-1 ring-border',
        'transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-raised',
        'focus-within:ring-3 focus-within:ring-focus',
      )}
    >
      <div className={cn('px-8 pt-8 pb-2', teal ? 'bg-primary-soft' : 'bg-navy-50')}>
        <div className="mx-auto max-w-xs transition-transform duration-500 group-hover:scale-[1.03]">
          {option.illustration}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6 sm:p-8">
        <h2 className="font-display">
          <Link
            to={{ search: `?perfil=${option.perfil}` }}
            state={{ fromChooser: true }}
            className="flex flex-col gap-1 rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            <span className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{option.title}</span>
            <span className="sr-only"> — </span>
            <span className={cn('text-lg font-semibold', teal ? 'text-primary' : 'text-navy-700')}>
              {option.subtitle}
            </span>
            {/* Texto do botão visual entra no nome acessível (comando de voz: "clicar em …") */}
            <span className="sr-only">: {option.cta}</span>
          </Link>
        </h2>
        <ul className="flex flex-col gap-3">
          {option.benefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-base text-ink">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full',
                  teal ? 'bg-teal-100 text-teal-800' : 'bg-navy-100 text-navy-800',
                )}
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
                </svg>
              </span>
              {b}
            </li>
          ))}
        </ul>
        <span
          aria-hidden="true"
          className={cn(
            'mt-auto inline-flex min-h-12 items-center justify-center gap-2 self-stretch rounded-full px-6 py-3 text-base font-semibold sm:self-start',
            'transition-colors duration-200',
            teal ? 'bg-primary text-on-primary group-hover:bg-primary-hover' : 'bg-navy-900 text-ink-inverse group-hover:bg-navy-800',
          )}
        >
          {option.cta}
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 transition-transform group-hover:translate-x-1">
            <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </span>
      </div>
    </article>
  )
}
