import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { AttendanceRecord, LeaveBalance } from '../types'
import { Button } from '../components/Button'

export function DashboardPage() {
  const { user } = useAuth()

  // State สำหรับเวลาและสถานะเข้างานวันนี้
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // ดึงข้อมูลสถานะการเข้างานวันนี้ และโควตาคงเหลือ
  async function loadDashboardData() {
    try {
      setIsLoading(true)
      // เรียกดูสถานะเข้างานวันนี้
      const attData = await api.get<AttendanceRecord | null>('/attendance/today')
      setTodayAttendance(attData)

      // เรียกดูโควตาการลาคงเหลือ (ถ้ามี API เปิดใช้งานแล้ว)
      try {
        const balData = await api.get<LeaveBalance[]>('/leave-balances/me')
        setLeaveBalances(balData)
      } catch {
        // อาจยังไม่เปิดใน Phase 3
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
      setMessage({ text: 'เช็คอินสำเร็จเรียบร้อยแล้ว!', type: 'success' })
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
      setMessage({ text: 'เช็คเอาต์สำเร็จเรียบร้อยแล้ว!', type: 'success' })
    } catch (err: any) {
      setMessage({ text: err.message || 'เช็คเอาต์ไม่สำเร็จ', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  // แปลง ISO string ให้แสดงเป็นเวลาท้องถิ่นแบบอ่านง่าย
  function formatTime(isoString: string | null) {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* ส่วนต้อนรับ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            ยินดีต้อนรับ, {user?.firstName} {user?.lastName} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            รหัสพนักงาน: <span className="font-semibold text-gray-700">{user?.employeeCode}</span> | บทบาท: <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold">{user?.role}</span>
          </p>
        </div>
      </div>

      {/* แจ้งเตือนสถานะสำเร็จหรือข้อผิดพลาด */}
      {message && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* การ์ดบันทึกเวลาทำงาน (Attendance Card) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⏰ บันทึกเวลาเข้า-ออกงานวันนี้
        </h2>

        {isLoading ? (
          <p className="text-gray-400 text-sm">กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* กล่องแสดงเวลาวันนี้ */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">สถานะเช็คอิน:</span>
                <span className="font-semibold text-gray-800">
                  {todayAttendance ? (
                    <span className="text-green-600">✓ เช็คอินแล้ว ({formatTime(todayAttendance.checkInAt)})</span>
                  ) : (
                    <span className="text-amber-600">ยังไม่เช็คอิน</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">สถานะเช็คเอาต์:</span>
                <span className="font-semibold text-gray-800">
                  {todayAttendance?.checkOutAt ? (
                    <span className="text-blue-600">✓ เช็คเอาต์แล้ว ({formatTime(todayAttendance.checkOutAt)})</span>
                  ) : (
                    <span className="text-gray-400">ยังไม่เช็คเอาต์</span>
                  )}
                </span>
              </div>
            </div>

            {/* ปุ่มกดเช็คอิน / เช็คเอาต์ */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="primary"
                onClick={handleCheckIn}
                disabled={Boolean(todayAttendance) || actionLoading}
                className="w-full sm:w-auto py-3 px-6 text-base"
              >
                {todayAttendance ? '✓ เช็คอินแล้ว' : '📍 เช็คอิน (Check-in)'}
              </Button>

              <Button
                variant="secondary"
                onClick={handleCheckOut}
                disabled={!todayAttendance || Boolean(todayAttendance.checkOutAt) || actionLoading}
                className="w-full sm:w-auto py-3 px-6 text-base bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {todayAttendance?.checkOutAt ? '✓ เช็คเอาต์แล้ว' : '🚪 เช็คเอาต์ (Check-out)'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* สรุปโควตาการลา (Leave Quota Summary) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          🗓️ โควตาการลาคงเหลือประจำปี
        </h2>
        {leaveBalances.length === 0 ? (
          <p className="text-sm text-gray-400">ยังไม่มีข้อมูลโควตาการลา</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {leaveBalances.map((b) => {
              const remaining = b.quotaDays - b.usedDays
              return (
                <div key={b.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">{b.leaveType.name}</h3>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-bold text-blue-600">{remaining}</span>
                    <span className="text-xs text-gray-500">คงเหลือ / {b.quotaDays} วัน</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, (b.usedDays / b.quotaDays) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1 block">ใช้ไปแล้ว {b.usedDays} วัน</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
