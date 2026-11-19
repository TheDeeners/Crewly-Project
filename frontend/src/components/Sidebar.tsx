import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// NavLink item component with active styling
function SidebarLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block px-4 py-2 rounded text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-600'
            : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 p-4 flex flex-col gap-1">
      <SidebarLink to="/dashboard" label="📊 แดชบอร์ด" />
      <SidebarLink to="/attendance" label="📋 ประวัติการเข้างาน" />
      <SidebarLink to="/my-leaves" label="🗓️ ใบลาของฉัน" />

      {/* Manager and Admin can see approvals */}
      {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
        <SidebarLink to="/approvals" label="✅ อนุมัติใบลา" />
      )}

      {/* Only Admin can see admin pages */}
      {user.role === 'ADMIN' && (
        <>
          <div className="mt-4 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider px-4">
            Admin
          </div>
          <SidebarLink to="/admin/users" label="👥 จัดการผู้ใช้" />
          <SidebarLink to="/admin/leave-types" label="📝 ประเภทการลา" />
          <SidebarLink to="/admin/holidays" label="🎉 วันหยุด" />
        </>
      )}
    </aside>
  )
}
