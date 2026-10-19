import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

/**
 * Rotas:
 *   /                 Home (Hero, Impacto, Como Funciona, Mural)
 *   /acoes            Mapa interativo + lista filtrável
 *   /acoes/nova       Novo pedido de ajuda (beneficiário logado)
 *   /acoes/:id        Detalhes da ação + canais de contato
 *   /cadastro         Onboarding com duplo perfil (?perfil=voluntario|beneficiario)
 *   /entrar           Login (simulado)
 * Páginas pesadas (Google Maps, formulários) são carregadas sob demanda.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'acoes',
        lazy: async () => ({ Component: (await import('./pages/ActionsPage')).ActionsPage }),
      },
      {
        path: 'acoes/nova',
        lazy: async () => ({ Component: (await import('./pages/NewRequestPage')).NewRequestPage }),
      },
      {
        path: 'acoes/:id',
        lazy: async () => ({
          Component: (await import('./pages/RequestDetailPage')).RequestDetailPage,
        }),
      },
      {
        path: 'cadastro',
        lazy: async () => ({ Component: (await import('./pages/SignupPage')).SignupPage }),
      },
      {
        path: 'entrar',
        lazy: async () => ({ Component: (await import('./pages/LoginPage')).LoginPage }),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
