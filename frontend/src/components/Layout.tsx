import { useState } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-bg text-txt antialiased overflow-hidden selection:bg-primary-light selection:text-primary">
      <Navbar onToggleSidebar={() => setMobileSidebarOpen((prev) => !prev)} />

      {/* Main App Canvas: Scrollable Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6 items-start">
          {/* Desktop Floating Sidebar */}
          <div className="hidden md:block w-64 shrink-0 sticky top-6">
            <Sidebar />
          </div>

          {/* Mobile Sidebar Backdrop & Drawer */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div
                className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <div className="fixed inset-y-0 left-0 w-72 bg-surface z-50 p-4 shadow-float overflow-y-auto">
                <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
