import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

// Main layout wrapper — Navbar at top, Sidebar on left, content on right
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-gray-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
