import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Input } from '../components/Input'
import { Button } from '../components/Button'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  // Controlled form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blurs in Burgundy and Cream */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-surface rounded-3xl border border-border shadow-float p-8 sm:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-extrabold text-2xl items-center justify-center shadow-md mb-4">
              C
            </div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">Crewly HRM</h1>
            <p className="text-txt-muted text-sm mt-1.5">
              ระบบบริหารจัดการบุคลากรและการเข้างาน
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="อีเมล (Email)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              required
            />

            <Input
              label="รหัสผ่าน (Password)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {/* Error Message Alert */}
            {error && (
              <div className="p-3.5 rounded-xl text-xs font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              เข้าสู่ระบบ
            </Button>
          </form>

          {/* Footer note */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-txt-light">
              © {new Date().getFullYear()} Crewly HRM. สงวนลิขสิทธิ์
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
