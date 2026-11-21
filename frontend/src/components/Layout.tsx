import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-bg text-txt antialiased overflow-hidden selection:bg-primary-light selection:text-primary">
      <Navbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Backdrop & Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-64 bg-surface z-50 shadow-float h-full">
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-bg overflow-y-auto h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
