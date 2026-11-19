import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { RoleRoute } from './routes/RoleRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/Login'
import { DashboardPage } from './pages/Dashboard'
import { AttendancePage } from './pages/Attendance'
import { MyLeavesPage } from './pages/MyLeaves'
import { LeaveFormPage } from './pages/LeaveForm'
import { ApprovalsPage } from './pages/Approvals'
import { AdminUsersPage } from './pages/AdminUsers'
import { AdminLeaveTypesPage } from './pages/AdminLeaveTypes'
import { AdminHolidaysPage } from './pages/AdminHolidays'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — require login */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttendancePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-leaves"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyLeavesPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-form"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeaveFormPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Manager + Admin only */}
          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['MANAGER', 'ADMIN']}>
                  <Layout>
                    <ApprovalsPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminUsersPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/leave-types"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminLeaveTypesPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/holidays"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Layout>
                    <AdminHolidaysPage />
                  </Layout>
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all: redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
