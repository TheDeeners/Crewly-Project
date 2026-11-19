import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Redirect unauthenticated users to /login
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  // Show nothing while we're checking localStorage (avoids flash of login page)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
