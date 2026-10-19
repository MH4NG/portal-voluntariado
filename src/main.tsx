import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequestsProvider } from './context/RequestsContext'
import './index.css'
import { router } from './router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RequestsProvider>
        <RouterProvider router={router} />
      </RequestsProvider>
    </AuthProvider>
  </StrictMode>,
)
