import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import LoadingState from './LoadingState'

/* ВОССТАНОВЛЕНО: файл не дошёл в дампе. Контракт взят из routes.tsx —
   <ProtectedRoute><PostEditor /></ProtectedRoute> для /editor и /editor/:id. */

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingState label="Проверяем доступ…" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute