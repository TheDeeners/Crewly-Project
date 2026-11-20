import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-bg flex flex-col text-txt antialiased selection:bg-primary-light selection:text-primary">
      <Navbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Backdrop & Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-surface z-50 shadow-float">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-bg overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
