import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
      <span className="font-bold text-lg tracking-wide">Crewly HRM</span>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {user.firstName} {user.lastName}
            <span className="ml-2 bg-blue-800 text-xs px-2 py-0.5 rounded-full">
              {user.role}
            </span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
          >
            ออกจากระบบ
          </button>
        </div>
      )}
    </nav>
  )
}
