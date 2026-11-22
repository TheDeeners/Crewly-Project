import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  IconDashboard,
  IconClock,
  IconCalendar,
  IconCheckSquare,
  IconUsers,
  IconTag,
  IconSun,
  IconChevronRight,
} from './Icons'

interface SidebarLinkProps {
  to: string
  label: string
  icon: React.ReactNode
  badge?: string | number
  onClick?: () => void
}

function SidebarLink({ to, label, icon, badge, onClick }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-primary text-white shadow-sm font-semibold'
            : 'text-txt-muted hover:text-txt hover:bg-bg'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <span
              className={`shrink-0 transition-colors ${
                isActive ? 'text-white' : 'text-txt-muted group-hover:text-primary'
              }`}
            >
              {icon}
            </span>
            <span>{label}</span>
          </div>
          {badge !== undefined && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-bg text-txt-muted'
              }`}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  )
}

interface SidebarProps {
  onCloseMobile?: () => void
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
  const { user } = useAuth()

  if (!user) return null

  return (
    <aside className="w-64 bg-surface rounded-3xl border border-border shadow-card p-4 sm:p-5 flex flex-col justify-between gap-6">
      <div className="space-y-6">
        {/* Main Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-txt-light uppercase tracking-wider mb-2">
            เมนูหลัก
          </p>
          <nav className="flex flex-col gap-1">
            <SidebarLink
              to="/dashboard"
              label="แดชบอร์ด"
              icon={<IconDashboard className="w-4 h-4" />}
              onClick={onCloseMobile}
            />
            <SidebarLink
              to="/attendance"
              label="ประวัติการเข้างาน"
              icon={<IconClock className="w-4 h-4" />}
              onClick={onCloseMobile}
            />
            <SidebarLink
              to="/my-leaves"
              label="ใบลาของฉัน"
              icon={<IconCalendar className="w-4 h-4" />}
              onClick={onCloseMobile}
            />
          </nav>
        </div>

        {/* Manager Section */}
        {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-txt-light uppercase tracking-wider mb-2">
              การจัดการทีม
            </p>
            <nav className="flex flex-col gap-1">
              <SidebarLink
                to="/approvals"
                label="อนุมัติใบลา"
                icon={<IconCheckSquare className="w-4 h-4" />}
                onClick={onCloseMobile}
              />
            </nav>
          </div>
        )}

        {/* Admin Section */}
        {user.role === 'ADMIN' && (
          <div>
            <p className="px-3 text-[11px] font-semibold text-txt-light uppercase tracking-wider mb-2">
              ผู้ดูแลระบบ (Admin)
            </p>
            <nav className="flex flex-col gap-1">
              <SidebarLink
                to="/admin/users"
                label="จัดการผู้ใช้"
                icon={<IconUsers className="w-4 h-4" />}
                onClick={onCloseMobile}
              />
              <SidebarLink
                to="/admin/leave-types"
                label="ประเภทการลา"
                icon={<IconTag className="w-4 h-4" />}
                onClick={onCloseMobile}
              />
              <SidebarLink
                to="/admin/holidays"
                label="ปฏิทินวันหยุด"
                icon={<IconSun className="w-4 h-4" />}
                onClick={onCloseMobile}
              />
            </nav>
          </div>
        )}
      </div>

      {/* Footer Info Card in Sidebar */}
      <div className="pt-4 border-t border-border mt-auto">
        <div className="p-3 rounded-xl bg-bg border border-border/80">
          <div className="flex items-center justify-between text-xs font-medium text-txt">
            <span>Crewly HRM v1.0</span>
            <span className="w-2 h-2 rounded-full bg-status-success inline-block" title="Online" />
          </div>
          <p className="text-[11px] text-txt-muted mt-0.5">ระบบจัดการงานบุคคล</p>
        </div>
      </div>
    </aside>
  )
}
