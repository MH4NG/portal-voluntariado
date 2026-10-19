import { useLocation, useSearchParams } from 'react-router-dom'
import { BeneficiaryForm } from '../components/onboarding/BeneficiaryForm'
import { ProfileChooser } from '../components/onboarding/ProfileChooser'
import { SessionNotice } from '../components/onboarding/SessionNotice'
import { VolunteerForm } from '../components/onboarding/VolunteerForm'
import { usePageTitle } from '../lib/usePageTitle'

type Perfil = 'voluntario' | 'beneficiario'

function parsePerfil(value: string | null): Perfil | null {
  return value === 'voluntario' || value === 'beneficiario' ? value : null
}

/**
 * /cadastro — onboarding com duplo perfil.
 * Sem ?perfil → escolha do perfil; ?perfil=voluntario|beneficiario → formulário em etapas.
 * O perfil fica na URL para que o botão "voltar" do navegador funcione.
 */
export function SignupPage() {
  const [params] = useSearchParams()
  const perfil = parsePerfil(params.get('perfil'))
  usePageTitle(
    perfil === 'voluntario'
      ? 'Cadastro de voluntário(a)'
      : perfil === 'beneficiario'
        ? 'Cadastro de pedido de ajuda'
        : 'Cadastro',
  )

  // Só move o foco para o formulário quando a pessoa acabou de escolher o perfil
  const location = useLocation()
  const autoFocus = Boolean((location.state as { fromChooser?: boolean } | null)?.fromChooser)

  if (perfil === 'voluntario') return <VolunteerForm key="voluntario" autoFocus={autoFocus} notice={<SessionNotice />} />
  if (perfil === 'beneficiario') {
    return <BeneficiaryForm key="beneficiario" autoFocus={autoFocus} notice={<SessionNotice />} />
  }
  return <ProfileChooser notice={<SessionNotice />} />
}
