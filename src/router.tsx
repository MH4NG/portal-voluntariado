import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './components/layout/RootLayout'
import { RouteFallback } from './components/layout/RouteFallback'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { RouteErrorPage } from './pages/RouteErrorPage'

/**
 * Rotas:
 *   /                 Home (Hero, Impacto, Como Funciona, Mural)
 *   /acoes            Mapa interativo + lista filtrável
 *   /acoes/nova       Novo pedido de ajuda (beneficiário logado)
 *   /acoes/:id        Detalhes da ação + canais de contato
 *   /cadastro         Onboarding com duplo perfil (?perfil=voluntario|beneficiario)
 *   /entrar           Login (simulado)
 * Páginas pesadas (Google Maps, formulários) são carregadas sob demanda.
 * hydrateFallbackElement mantém cabeçalho e rodapé visíveis enquanto a primeira página
 * sob demanda é baixada; o errorElement da rota sem caminho mostra falhas dentro do layout.
 */
const fallback = <RouteFallback />

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage standalone />,
    children: [
      {
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <HomePage /> },
          {
            path: 'acoes',
            hydrateFallbackElement: fallback,
            lazy: async () => ({ Component: (await import('./pages/ActionsPage')).ActionsPage }),
          },
          {
            path: 'acoes/nova',
            hydrateFallbackElement: fallback,
            lazy: async () => ({ Component: (await import('./pages/NewRequestPage')).NewRequestPage }),
          },
          {
            path: 'acoes/:id',
            hydrateFallbackElement: fallback,
            lazy: async () => ({
              Component: (await import('./pages/RequestDetailPage')).RequestDetailPage,
            }),
          },
          {
            path: 'cadastro',
            hydrateFallbackElement: fallback,
            lazy: async () => ({ Component: (await import('./pages/SignupPage')).SignupPage }),
          },
          {
            path: 'entrar',
            hydrateFallbackElement: fallback,
            lazy: async () => ({ Component: (await import('./pages/LoginPage')).LoginPage }),
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
