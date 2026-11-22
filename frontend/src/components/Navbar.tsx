import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { IconLogOut, IconMenu } from './Icons'

interface NavbarProps {
  onToggleSidebar?: () => void
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  // Get user initials
  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U'

  return (
    <header className="h-16 shrink-0 z-30 bg-surface border-b border-border shadow-subtle">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile burger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-bg transition-colors"
            aria-label="เมนู"
          >
            <IconMenu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-base shadow-sm">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-primary tracking-tight">Crewly</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary-light text-primary border border-primary/10">
                  HRM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Profile & Actions */}
        {user && (
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 bg-bg px-3 py-1.5 rounded-xl border border-border">
              {/* Avatar circle */}
              <div className="w-7 h-7 rounded-lg bg-primary text-white font-semibold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-txt leading-none">
                  {user.firstName} {user.lastName}
                </p>
                <span className="text-[10px] text-txt-muted font-medium">
                  {user.employeeCode}
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase">
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-medium text-txt-muted hover:text-status-rejected hover:bg-status-rejected-bg px-3 py-1.5 rounded-xl border border-transparent hover:border-status-rejected-border transition-all duration-150"
              title="ออกจากระบบ"
            >
              <IconLogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
