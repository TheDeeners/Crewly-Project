import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { AttendanceRecord, LeaveBalance, Holiday, LeaveRequest } from '../types'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { AttendanceModal } from '../components/AttendanceModal'
import { CalendarWidget } from '../components/CalendarWidget'
import {
  IconClock,
  IconCalendar,
  IconPlus,
  IconArrowRight,
} from '../components/Icons'

export function DashboardPage() {
  const { user } = useAuth()

  // State สำหรับเวลาและสถานะเข้างานวันนี้
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [allHolidays, setAllHolidays] = useState<Holiday[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')

  // State สำหรับ Modal Check-in / Check-out
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [modalMessage, setModalMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

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

  // ดึงข้อมูลสถานะการเข้างานวันนี้, ปฏิทินวันหยุด, ประวัติการลา และบันทึกเวลา
  async function loadDashboardData() {
    try {
      setIsLoading(true)
      const [attData, balData, holidayData, leaveReqData, attRecordsData] = await Promise.allSettled([
        api.get<AttendanceRecord | null>('/attendance/today'),
        api.get<LeaveBalance[]>('/leave-balances/me'),
        api.get<Holiday[]>('/holidays'),
        api.get<LeaveRequest[]>('/leave-requests/me'),
        api.get<AttendanceRecord[]>('/attendance/me'),
      ])

      if (attData.status === 'fulfilled') {
        setTodayAttendance(attData.value)
      }
      if (balData.status === 'fulfilled') {
        setLeaveBalances(balData.value || [])
      }
      if (leaveReqData.status === 'fulfilled') {
        setLeaveRequests(leaveReqData.value || [])
      }
      if (attRecordsData.status === 'fulfilled') {
        setAttendances(attRecordsData.value || [])
      }
      if (holidayData.status === 'fulfilled') {
        setAllHolidays(holidayData.value || [])
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
    setModalMessage(null)
    try {
      const result = await api.post<AttendanceRecord>('/attendance/check-in', {})
      setTodayAttendance(result)
      const successMsg = 'เช็คอินเข้างานสำเร็จเรียบร้อยแล้ว!'
      setMessage({ text: successMsg, type: 'success' })
      setModalMessage({ text: successMsg, type: 'success' })
    } catch (err: any) {
      const errorMsg = err.message || 'เช็คอินไม่สำเร็จ'
      setMessage({ text: errorMsg, type: 'error' })
      setModalMessage({ text: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  // ฟังก์ชันกดเช็คเอาต์
  async function handleCheckOut() {
    setActionLoading(true)
    setMessage(null)
    setModalMessage(null)
    try {
      const result = await api.post<AttendanceRecord>('/attendance/check-out', {})
      setTodayAttendance(result)
      const successMsg = 'เช็คเอาต์ออกงานสำเร็จเรียบร้อยแล้ว!'
      setMessage({ text: successMsg, type: 'success' })
      setModalMessage({ text: successMsg, type: 'success' })
    } catch (err: any) {
      const errorMsg = err.message || 'เช็คเอาต์ไม่สำเร็จ'
      setMessage({ text: errorMsg, type: 'error' })
      setModalMessage({ text: errorMsg, type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  function formatTime(isoString: string | null) {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  // คำนวณสรุปโควตาคงเหลือรวม
  const totalQuota = leaveBalances.reduce((sum, b) => sum + b.quotaDays, 0)
  const totalUsed = leaveBalances.reduce((sum, b) => sum + b.usedDays, 0)
  const totalRemaining = totalQuota - totalUsed

  return (
    <div className="space-y-4">
      {/* ส่วนต้อนรับ (Hero Banner) พร้อมปุ่ม Check-in/out Modal ทางขวา */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-[#8C2341] to-secondary text-white rounded-2xl p-5 sm:p-6 shadow-card">
        {/* Soft decorative background circles */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-10 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* ข้อมูลทักทายสวัสดีชื่อ */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-medium text-white/90 mb-2">
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

          {/* ปุ่ม Check-in / Out แทนที่กล่องรหัสพนักงาน/สิทธิ์เดิม เพื่อเปิด Modal */}
          <button
            onClick={() => {
              setModalMessage(null)
              setShowAttendanceModal(true)
            }}
            className="flex items-center gap-3 bg-surface text-txt hover:bg-[#FAF7F5] px-4 py-3 rounded-xl font-bold shadow-card hover:shadow-float transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 group self-start md:self-auto border border-white/20"
          >
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm">
              <IconClock className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="text-[11px] uppercase tracking-wider text-txt-muted block font-medium">
                {todayAttendance?.checkOutAt
                  ? 'บันทึกเวลาครบแล้ว'
                  : todayAttendance
                  ? 'เข้างานเรียบร้อยแล้ว'
                  : 'ยังไม่ได้บันทึกเวลา'}
              </span>
              <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                {todayAttendance?.checkOutAt
                  ? 'ดูบันทึกเวลาวันนี้'
                  : todayAttendance
                  ? 'บันทึกเวลาออกงาน (Check-out)'
                  : 'บันทึกเวลาเข้างาน (Check-in)'}
                <IconArrowRight className="w-3.5 h-3.5 text-primary group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* แจ้งเตือนสถานะสำเร็จหรือข้อผิดพลาด */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-sm font-medium flex items-center justify-between gap-3 border shadow-subtle ${
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
            className="text-xs hover:opacity-75 font-semibold text-txt-muted hover:text-txt"
          >
            ปิด
          </button>
        </div>
      )}

      {/* Main Grid: แบ่ง 2 คอลัมน์ (Col 2 ซ้าย: การเข้างานวันนี้ + ปฏิทิน | Col 1 ขวา: สิทธิ์วันลาคงเหลือ) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        {/* Left Section (2 Columns: กว้างเท่ากันระหว่าง การเข้างานวันนี้ และ ปฏิทิน) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Card: การเข้างานวันนี้ (ขยายความกว้างเท่ากับปฏิทิน: col-span-2) */}
          <div className="bg-surface rounded-2xl border border-border p-4 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-border/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center">
                  <IconClock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-txt">การเข้างานวันนี้</h2>
                  <p className="text-xs text-txt-muted">{todayDateThai}</p>
                </div>
              </div>

              <div>
                {todayAttendance?.checkOutAt ? (
                  <Badge variant="info">ออกงานแล้ว</Badge>
                ) : todayAttendance ? (
                  <Badge variant="success">กำลังปฏิบัติงาน</Badge>
                ) : (
                  <Badge variant="pending">ยังไม่เข้างาน</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Box 1: เวลาเข้างาน */}
              <div className="p-3 rounded-xl bg-bg border border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-txt-muted block mb-0.5">เวลาเข้างาน (Check-in)</span>
                  <span className="text-sm font-bold text-txt">
                    {todayAttendance?.checkInAt ? `${formatTime(todayAttendance.checkInAt)} น.` : '-'}
                  </span>
                </div>
                {todayAttendance ? (
                  <span className="text-xs font-semibold text-status-success">✓ บันทึกแล้ว</span>
                ) : (
                  <span className="text-xs text-txt-muted">-</span>
                )}
              </div>

              {/* Box 2: เวลาออกงาน */}
              <div className="p-3 rounded-xl bg-bg border border-border flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-txt-muted block mb-0.5">เวลาออกงาน (Check-out)</span>
                  <span className="text-sm font-bold text-txt">
                    {todayAttendance?.checkOutAt ? `${formatTime(todayAttendance.checkOutAt)} น.` : '-'}
                  </span>
                </div>
                {todayAttendance?.checkOutAt ? (
                  <span className="text-xs font-semibold text-status-info">✓ บันทึกแล้ว</span>
                ) : (
                  <span className="text-xs text-txt-muted">-</span>
                )}
              </div>
            </div>
          </div>

          {/* ปฏิทินตารางงานและวันหยุด (กว้างเท่ากับ การเข้างานวันนี้: col-span-2) */}
          <CalendarWidget
            holidays={allHolidays}
            leaveRequests={leaveRequests}
            attendances={attendances}
          />
        </div>

        {/* Right Section: สิทธิ์วันลาคงเหลือ (ย้ายมาแทนที่ วันหยุดบริษัทเร็วๆ นี้: col-span-1) */}
        <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-border/80">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                  <IconCalendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-txt">สิทธิ์วันลาคงเหลือ</h3>
              </div>
              <Badge variant="success" size="sm">ปี {new Date().getFullYear() + 543}</Badge>
            </div>

            {/* Total Balance Overview Box */}
            <div className="p-3.5 rounded-xl bg-bg border border-border">
              <div className="flex items-baseline justify-between mb-1">
                <div>
                  <span className="text-2xl font-extrabold text-primary">{totalRemaining}</span>
                  <span className="text-xs text-txt-muted ml-1.5 font-medium">/ {totalQuota} วัน</span>
                </div>
                <span className="text-xs font-semibold text-txt-muted">
                  ใช้ไปแล้ว {totalUsed} วัน
                </span>
              </div>
              <div className="w-full bg-[#E8DDD9] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: `${totalQuota > 0 ? Math.min(100, (totalUsed / totalQuota) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Breakdown per Leave Type */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-txt-muted block">
                โควตาแยกตามประเภท
              </span>

              {leaveBalances.length === 0 ? (
                <p className="text-xs text-txt-muted py-2 text-center">ไม่มีข้อมูลโควตา</p>
              ) : (
                leaveBalances.map((b) => {
                  const remaining = b.quotaDays - b.usedDays
                  const pct = Math.min(100, Math.round((b.usedDays / b.quotaDays) * 100))
                  return (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl bg-bg/60 border border-border/80 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-txt truncate mr-2">{b.leaveType.name}</span>
                        <span className="font-bold text-primary shrink-0">
                          {remaining} <span className="text-[10px] text-txt-muted font-normal">/ {b.quotaDays} วัน</span>
                        </span>
                      </div>
                      <div className="w-full bg-[#E8DDD9] h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-4 pt-3 border-t border-border flex flex-col gap-2">
            <Link to="/leave-form" className="w-full">
              <Button variant="primary" size="sm" className="w-full" leftIcon={<IconPlus className="w-3.5 h-3.5" />}>
                ยื่นคำขอลาใหม่
              </Button>
            </Link>
            <Link
              to="/my-leaves"
              className="text-xs text-center font-semibold text-primary hover:underline block pt-1"
            >
              ดูประวัติและรายละเอียดการลาทั้งหมด →
            </Link>
          </div>
        </div>
      </div>

      {/* Modal บันทึกเวลาเข้า-ออกงาน (Attendance Check-in / Check-out Modal Component) */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        todayAttendance={todayAttendance}
        onCheckIn={handleCheckIn}
        onCheckOut={handleCheckOut}
        actionLoading={actionLoading}
        currentTime={currentTime}
        todayDateThai={todayDateThai}
        formatTime={formatTime}
        modalMessage={modalMessage}
      />
    </div>
  )
}
