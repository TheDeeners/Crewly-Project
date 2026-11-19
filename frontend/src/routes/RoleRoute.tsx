import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Role } from '../types'

interface RoleRouteProps {
  children: React.ReactNode
  allowedRoles: Role[]
}

// Redirect users who don't have the required role to dashboard
export function RoleRoute({ children, allowedRoles }: RoleRouteProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
