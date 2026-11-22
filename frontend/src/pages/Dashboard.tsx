import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { AttendanceRecord, LeaveBalance } from '../types'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { IconClock, IconCalendar, IconPlus, IconCheck, IconArrowRight } from '../components/Icons'

export function DashboardPage() {
  const { user } = useAuth()

  // State สำหรับเวลาและสถานะเข้างานวันนี้
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')

  // อัปเดตเวลานาฬิกาแบบเรียลไทม์
  useEffect(() => {
    function updateClock() {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      )
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  // วันที่ปัจจุบันแบบไทย
  const todayDateThai = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // ดึงข้อมูลสถานะการเข้างานวันนี้ และโควตาคงเหลือ
  async function loadDashboardData() {
    try {
      setIsLoading(true)
      const attData = await api.get<AttendanceRecord | null>('/attendance/today')
      setTodayAttendance(attData)

      try {
        const balData = await api.get<LeaveBalance[]>('/leave-balances/me')
        setLeaveBalances(balData)
      } catch {
        // อาจยังไม่มีข้อมูลโควตา
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  // ฟังก์ชันกดเช็คอิน
  async function handleCheckIn() {
    setActionLoading(true)
    setMessage(null)
    try {
      const result = await api.post<AttendanceRecord>('/attendance/check-in', {})
      setTodayAttendance(result)
      setMessage({ text: 'เช็คอินเข้างานสำเร็จเรียบร้อยแล้ว!', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message || 'เช็คอินไม่สำเร็จ', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  // ฟังก์ชันกดเช็คเอาต์
  async function handleCheckOut() {
    setActionLoading(true)
    setMessage(null)
    try {
      const result = await api.post<AttendanceRecord>('/attendance/check-out', {})
      setTodayAttendance(result)
      setMessage({ text: 'เช็คเอาต์ออกงานสำเร็จเรียบร้อยแล้ว!', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message || 'เช็คเอาต์ไม่สำเร็จ', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  function formatTime(isoString: string | null) {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* ส่วนต้อนรับ (Hero Banner) */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-[#8C2341] to-secondary text-white rounded-3xl p-6 sm:p-8 shadow-card">
        {/* Soft decorative background circles */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white/90 mb-3">
              <IconCalendar className="w-3.5 h-3.5" />
              <span>{todayDateThai}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              สวัสดี, คุณ{user?.firstName} {user?.lastName}
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-lg">
              ยินดีต้อนรับสู่ระบบ Crewly HRM ขอให้เป็นวันที่การทำงานราบรื่นและมีประสิทธิภาพ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 bg-black/15 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 self-start md:self-auto">
            <div>
              <p className="text-[11px] text-white/70 uppercase font-medium">รหัสพนักงาน</p>
              <p className="text-sm font-semibold tracking-wide">{user?.employeeCode}</p>
            </div>
            <div className="h-8 w-px bg-white/20 mx-1" />
            <div>
              <p className="text-[11px] text-white/70 uppercase font-medium">ตำแหน่ง / สิทธิ์</p>
              <span className="inline-block mt-0.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-primary">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* แจ้งเตือนสถานะสำเร็จหรือข้อผิดพลาด */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-center justify-between gap-3 border shadow-subtle ${
            message.type === 'success'
              ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
              : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full ${
                message.type === 'success' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'
              }`}
            />
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs hover:opacity-75 font-semibold"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Main Grid: Attendance Card & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* การ์ดบันทึกเวลาทำงาน (Attendance Card) — 2 Columns */}
        <div className="lg:col-span-2 bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-card">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                <IconClock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-txt">บันทึกเวลาเข้า-ออกงานวันนี้</h2>
                <p className="text-xs text-txt-muted">กดปุ่มเพื่อบันทึกเวลาปฏิบัติงานประจำวัน</p>
              </div>
            </div>

            {/* Live Clock */}
            <div className="text-right">
              <div className="font-mono text-xl font-bold text-primary tracking-tight">
                {currentTime || '--:--:--'}
              </div>
              <p className="text-[10px] text-txt-muted uppercase tracking-wider">เวลาปัจจุบัน</p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-txt-muted text-sm">กำลังโหลดข้อมูลเวลา...</div>
          ) : (
            <div className="space-y-6">
              {/* Status summary boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* เช็คอิน box */}
                <div className="p-4 rounded-2xl bg-bg border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-txt-muted block mb-1">เวลาเข้างาน (Check-in)</span>
                    <span className="text-base font-bold text-txt">
                      {todayAttendance?.checkInAt ? formatTime(todayAttendance.checkInAt) : '-'}
                    </span>
                  </div>
                  <div>
                    {todayAttendance ? (
                      <Badge variant="success">เช็คอินแล้ว</Badge>
                    ) : (
                      <Badge variant="pending">ยังไม่เช็คอิน</Badge>
                    )}
                  </div>
                </div>

                {/* เช็คเอาต์ box */}
                <div className="p-4 rounded-2xl bg-bg border border-border flex items-center justify-between">
                  <div>
                    <span className="text-xs text-txt-muted block mb-1">เวลาออกงาน (Check-out)</span>
                    <span className="text-base font-bold text-txt">
                      {todayAttendance?.checkOutAt ? formatTime(todayAttendance.checkOutAt) : '-'}
                    </span>
                  </div>
                  <div>
                    {todayAttendance?.checkOutAt ? (
                      <Badge variant="info">เช็คเอาต์แล้ว</Badge>
                    ) : (
                      <Badge variant="neutral">ยังไม่เช็คเอาต์</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckIn}
                  disabled={Boolean(todayAttendance) || actionLoading}
                  className="flex-1"
                  leftIcon={<IconCheck className="w-5 h-5" />}
                >
                  {todayAttendance ? 'เช็คอินสำเร็จแล้ว' : 'บันทึกเวลาเข้างาน (Check-in)'}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleCheckOut}
                  disabled={!todayAttendance || Boolean(todayAttendance.checkOutAt) || actionLoading}
                  className="flex-1"
                  leftIcon={<IconClock className="w-5 h-5" />}
                >
                  {todayAttendance?.checkOutAt ? 'เช็คเอาต์สำเร็จแล้ว' : 'บันทึกเวลาออกงาน (Check-out)'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions / Shortcuts — 1 Column */}
        <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-txt mb-1">เมนูลัด</h3>
            <p className="text-xs text-txt-muted mb-4">ดำเนินการด่วนที่ใช้งานบ่อย</p>

            <div className="space-y-2.5">
              <Link
                to="/leave-form"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-bg hover:bg-primary-light border border-border hover:border-primary/20 transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
                    <IconPlus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-txt group-hover:text-primary transition-colors block">
                      ยื่นคำขอลา
                    </span>
                    <span className="text-xs text-txt-muted">สร้างคำขอลาพักร้อน ป่วย กิจ</span>
                  </div>
                </div>
                <IconArrowRight className="w-4 h-4 text-txt-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/my-leaves"
                className="group flex items-center justify-between p-3.5 rounded-2xl bg-bg hover:bg-secondary-light border border-border hover:border-secondary/20 transition-all duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary text-white flex items-center justify-center shrink-0">
                    <IconCalendar className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-semibold text-txt group-hover:text-secondary transition-colors block">
                      ประวัติการลา
                    </span>
                    <span className="text-xs text-txt-muted">ตรวจสอบสถานะใบลาที่ยื่น</span>
                  </div>
                </div>
                <IconArrowRight className="w-4 h-4 text-txt-muted group-hover:text-secondary group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <Link
              to="/attendance"
              className="text-xs text-primary font-semibold hover:underline flex items-center justify-between"
            >
              <span>ดูบันทึกเวลาการทำงานย้อนหลังทั้งหมด</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* สรุปโควตาการลา (Leave Quota Summary) */}
      <div className="bg-surface rounded-3xl border border-border p-6 sm:p-7 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/80">
          <div>
            <h2 className="text-base font-bold text-txt">โควตาการลาคงเหลือประจำปี</h2>
            <p className="text-xs text-txt-muted">จำนวนสิทธิ์วันลาคงเหลือและการใช้งานในปีนี้</p>
          </div>
          <Link to="/leave-form">
            <Button variant="outline" size="sm" leftIcon={<IconPlus className="w-3.5 h-3.5" />}>
              ยื่นใบลา
            </Button>
          </Link>
        </div>

        {leaveBalances.length === 0 ? (
          <div className="py-8 text-center text-txt-muted text-sm bg-bg rounded-2xl border border-border">
            ยังไม่มีข้อมูลโควตาการลาในระบบ
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {leaveBalances.map((b) => {
              const remaining = b.quotaDays - b.usedDays
              const usagePercent = Math.min(100, Math.round((b.usedDays / b.quotaDays) * 100))

              return (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl bg-bg border border-border hover:border-primary/30 transition-all duration-150 hover:shadow-cardHover"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-txt text-sm">{b.leaveType.name}</h3>
                    <Badge variant={remaining > 0 ? 'success' : 'neutral'} size="sm">
                      คงเหลือ {remaining} วัน
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-extrabold text-primary tracking-tight">
                        {remaining}
                      </span>
                      <span className="text-xs text-txt-muted ml-1.5 font-medium">/ {b.quotaDays} วัน</span>
                    </div>
                    <span className="text-xs font-semibold text-txt-muted">{usagePercent}% ใช้ไป</span>
                  </div>

                  {/* Progress Bar with Primary Burgundy gradient */}
                  <div className="w-full bg-[#E8DDD9] h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-txt-muted mt-2.5 pt-2 border-t border-border/60">
                    <span>ใช้ไปแล้ว {b.usedDays} วัน</span>
                    <span>สิทธิ์ทั้งหมด {b.quotaDays} วัน</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
