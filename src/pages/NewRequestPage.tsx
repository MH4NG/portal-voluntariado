import { useNavigate } from 'react-router-dom'
import { BeneficiaryIllustration } from '../components/onboarding/Illustrations'
import { NewRequestForm } from '../components/onboarding/NewRequestForm'
import { Button, ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { useAuth } from '../context/AuthContext'
import { usePageTitle } from '../lib/usePageTitle'

/**
 * /acoes/nova — novo pedido de ajuda. Exige sessão de beneficiário (pessoa ou instituição).
 */
export function NewRequestPage() {
  usePageTitle('Novo pedido de ajuda')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (user?.kind === 'beneficiario') return <NewRequestForm key={user.id} user={user} />

  const isVolunteer = user?.kind === 'voluntario'

  return (
    <div className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-48 left-1/2 size-144 -translate-x-1/2 rounded-full bg-teal-100/50 blur-3xl"
      />
      <Container className="relative py-12 sm:py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-card bg-surface-raised p-6 text-center shadow-card ring-1 ring-border sm:p-10">
          <BeneficiaryIllustration className="max-w-60" />
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Novo pedido de ajuda</h1>
          {isVolunteer ? (
            <>
              <p className="mt-4 text-lg text-ink-muted">
                Você está conectado(a) como voluntário(a). A publicação de pedidos é feita por pessoas e
                instituições que precisam de ajuda.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                <ButtonLink to="/acoes" size="lg">
                  Ver ações para ajudar
                </ButtonLink>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    logout()
                    navigate('/cadastro?perfil=beneficiario', { state: { fromChooser: true } })
                  }}
                >
                  Sair e criar perfil de pedido
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 text-lg text-ink-muted">
                Para publicar um pedido, entre na sua conta de pessoa ou instituição. Ainda não tem cadastro? Ele
                é gratuito e já inclui o seu primeiro pedido.
              </p>
              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
                <ButtonLink to={`/entrar?next=${encodeURIComponent('/acoes/nova')}`} size="lg">
                  Entrar
                </ButtonLink>
                <ButtonLink to="/cadastro?perfil=beneficiario" variant="secondary" size="lg">
                  Criar cadastro
                </ButtonLink>
              </div>
            </>
          )}
        </div>
      </Container>
    </div>
  )
}
