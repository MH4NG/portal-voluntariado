import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { focusElement } from '../layout/useRouteEffects'
import { Button, ButtonLink } from '../ui/Button'

/** Aviso exibido no cadastro quando já existe uma sessão ativa. */
export function SessionNotice() {
  const { user, logout } = useAuth()
  const [loggedOut, setLoggedOut] = useState(false)

  function handleLogout() {
    logout()
    setLoggedOut(true)
    // o botão some com o aviso: leva o foco ao título da página
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('main h1')
      if (heading) focusElement(heading)
    })
  }

  const isBeneficiary = user?.kind === 'beneficiario'

  return (
    // Região sempre montada: anuncia a saída da conta mesmo depois que o aviso desaparece
    <div role="status">
      {user ? (
        <div className="mb-8 flex flex-col gap-4 rounded-card bg-navy-900 p-5 text-ink-inverse shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-400 font-display text-lg font-bold text-navy-950"
            >
              {user.name.trim().charAt(0).toUpperCase() || '?'}
            </span>
            <div>
              <p className="font-display font-bold">Você já está conectado(a) como {user.name}.</p>
              <p className="mt-1 text-sm text-ink-inverse-muted">
                {isBeneficiary
                  ? 'Quer publicar outro pedido? Use o botão ao lado. Para criar um cadastro diferente, saia da conta atual.'
                  : 'Para criar um cadastro diferente, saia da conta atual. Um novo cadastro substitui a sessão neste navegador.'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {isBeneficiary && (
              <ButtonLink to="/acoes/nova" variant="inverse">
                Criar novo pedido
              </ButtonLink>
            )}
            <Button variant="inverse" onClick={handleLogout}>
              Sair da conta
            </Button>
          </div>
        </div>
      ) : (
        loggedOut && <p className="sr-only">Você saiu da sua conta. Agora você pode criar um novo cadastro.</p>
      )}
    </div>
  )
}
