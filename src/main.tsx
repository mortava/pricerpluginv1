import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from '@/contexts/AuthContext'

const AdminChatPage = lazy(() => import('@/pages/AdminChatPage'))
const UserChatPage = lazy(() => import('@/pages/UserChatPage'))

function Router() {
  const path = window.location.pathname

  if (path === '/adminchat') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#A1A1AA] text-sm">Loading...</div>}>
        <AdminChatPage />
      </Suspense>
    )
  }

  if (path === '/userchat') {
    return (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#A1A1AA] text-sm">Loading...</div>}>
        <UserChatPage />
      </Suspense>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <Router />
    </AuthProvider>
  </StrictMode>,
)
