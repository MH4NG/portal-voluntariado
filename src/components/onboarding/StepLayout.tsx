import { useEffect, useId, useRef, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MOTION, gsap, prefersReducedMotion, useGSAP } from '../../lib/gsap'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { ErrorSummary } from './FormField'
import { Stepper } from './Stepper'
import type { FieldErrors } from './validation'

/* ------------------------------------------------------------------ */
/* Moldura da página do assistente                                     */
/* ------------------------------------------------------------------ */

interface WizardLayoutProps {
  eyebrow: string
  title: string
  intro: ReactNode
  steps: readonly string[]
  current: number
  stepsLabel?: string
  backLink?: { to: string; label: string }
  /** Conteúdo acima do layout (ex.: aviso de sessão ativa) */
  notice?: ReactNode
  children: ReactNode
}

export function WizardLayout({
  eyebrow,
  title,
  intro,
  steps,
  current,
  stepsLabel,
  backLink,
  notice,
  children,
}: WizardLayoutProps) {
  return (
    <div className="relative overflow-hidden bg-surface">
      {/* brilho decorativo de fundo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 size-112 rounded-full bg-teal-100/60 blur-3xl"
      />
      <Container className="relative py-8 sm:py-12 lg:py-16">
        {notice}
        <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[19rem_minmax(0,1fr)] xl:gap-16">
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            {backLink && (
              <Link
                to={backLink.to}
                className="-ml-2 inline-flex min-h-12 items-center gap-2 self-start rounded-full px-2 text-sm font-semibold text-ink-muted hover:text-ink focus-ring"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
                </svg>
                {backLink.label}
              </Link>
            )}
            <div>
              <p className="mb-2 text-sm font-bold tracking-widest text-primary uppercase">{eyebrow}</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">{title}</h1>
              <div className="mt-3 text-base text-ink-muted sm:text-lg lg:text-base">{intro}</div>
            </div>
            <Stepper steps={steps} current={current} label={stepsLabel} />
            <div className="hidden rounded-card bg-surface-muted p-5 ring-1 ring-border lg:block">
              <p className="flex items-center gap-2 font-display font-bold text-ink">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5 text-primary">
                  <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" strokeLinejoin="round" />
                  <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Seus dados protegidos
              </p>
              <p className="mt-2 text-sm text-ink-muted">
                Usamos suas informações apenas para conectar pessoas a ações voluntárias, conforme a LGPD.
                Seu progresso fica salvo nesta aba até você concluir.
              </p>
            </div>
          </div>

          <div className="min-w-0 rounded-card bg-surface-raised p-5 shadow-card ring-1 ring-border sm:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </Container>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Formulário de uma etapa                                             */
/* ------------------------------------------------------------------ */

interface StepFormProps {
  title: string
  description?: ReactNode
  errors: FieldErrors
  /** Contador de tentativas com erro (foca o resumo) */
  attempt: number
  /** Foca o título ao montar (troca de etapa) */
  focusHeading: boolean
  direction: 1 | -1
  onSubmit: () => void
  onBack?: () => void
  submitLabel?: string
  submitDisabled?: boolean
  showRequiredNote?: boolean
  children: ReactNode
}

/**
 * Uma etapa = um <form noValidate>. Na montagem, o foco vai para o título da etapa
 * (tabIndex=-1) e há uma transição sutil de opacidade/deslocamento (só sem reduced-motion).
 */
export function StepForm({
  title,
  description,
  errors,
  attempt,
  focusHeading,
  direction,
  onSubmit,
  onBack,
  submitLabel = 'Continuar',
  submitDisabled,
  showRequiredNote = true,
  children,
}: StepFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = useId()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        gsap.from(formRef.current, {
          opacity: 0,
          x: 28 * direction,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'opacity,transform',
        })
      })
      return () => mm.revert()
    },
    { scope: formRef },
  )

  useEffect(() => {
    if (!focusHeading) return
    const heading = headingRef.current
    const form = formRef.current
    if (!heading || !form) return
    heading.focus({ preventScroll: true })
    if (form.getBoundingClientRect().top < 96) {
      form.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }
  }, [focusHeading])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      aria-labelledby={headingId}
      className="flex scroll-mt-28 flex-col gap-8"
    >
      <ErrorSummary errors={errors} focusKey={attempt} />

      <header className="flex flex-col gap-2">
        <h2
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="rounded-md text-2xl font-extrabold tracking-tight text-ink focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-focus sm:text-3xl"
        >
          {title}
        </h2>
        {description && <div className="text-base text-ink-muted">{description}</div>}
        {showRequiredNote && (
          <p className="text-sm text-ink-muted">
            Campos com <span className="font-bold text-danger">*</span> são obrigatórios.
          </p>
        )}
      </header>

      <div className="flex flex-col gap-7">{children}</div>

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} className="sm:-ml-3">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.4 10l4.3 4.3a1 1 0 0 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z" />
            </svg>
            Voltar
          </Button>
        ) : (
          <span className="hidden sm:block" />
        )}
        <Button type="submit" size="lg" disabled={submitDisabled} className="w-full sm:w-auto">
          {submitLabel}
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </Button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Bloco de revisão                                                    */
/* ------------------------------------------------------------------ */

interface ReviewSectionProps {
  title: string
  onEdit: () => void
  children: ReactNode
}

export function ReviewSection({ title, onEdit, children }: ReviewSectionProps) {
  return (
    <section className="rounded-2xl border-2 border-navy-100 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-full px-4 font-semibold text-primary hover:bg-primary-soft focus-ring"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <path d="M13.6 2.6a2 2 0 0 1 2.8 2.8l-8.7 8.7-3.7.9.9-3.7 8.7-8.7Z" />
          </svg>
          Editar<span className="sr-only"> {title.toLocaleLowerCase('pt-BR')}</span>
        </button>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>
  )
}

export function ReviewItem({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className="mt-0.5 break-words text-base font-semibold text-ink">{children}</dd>
    </div>
  )
}
