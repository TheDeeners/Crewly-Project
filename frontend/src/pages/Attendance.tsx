import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { AttendanceRecord } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'

export function AttendancePage() {
  const { user } = useAuth()
  const isManagerOrAdmin = user?.role === 'MANAGER' || user?.role === 'ADMIN'

  // แท็บปัจจุบัน: 'me' หรือ 'team'
  const [activeTab, setActiveTab] = useState<'me' | 'team'>('me')

  // ข้อมูลประวัติ
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([])
  const [teamRecords, setTeamRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // ตัวกรองช่วงวันที่
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // โหลดข้อมูลประวัติของฉัน
  async function fetchMyAttendance() {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      const query = params.toString() ? `?${params.toString()}` : ''

      const data = await api.get<AttendanceRecord[]>(`/attendance/me${query}`)
      setMyRecords(data)
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดประวัติการเข้างานได้')
    } finally {
      setIsLoading(false)
    }
  }

  // โหลดข้อมูลประวัติของทีมงาน (Manager / Admin)
  async function fetchTeamAttendance() {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      const query = params.toString() ? `?${params.toString()}` : ''

      const data = await api.get<AttendanceRecord[]>(`/attendance/team${query}`)
      setTeamRecords(data)
    } catch (err: any) {
      setError(err.message || 'ไม่สามารถโหลดประวัติของทีมงานได้')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'me') {
      fetchMyAttendance()
    } else if (activeTab === 'team' && isManagerOrAdmin) {
      fetchTeamAttendance()
    }
  }, [activeTab])

  function handleFilterSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (activeTab === 'me') {
      fetchMyAttendance()
    } else {
      fetchTeamAttendance()
    }
  }

  function handleResetFilter() {
    setStartDate('')
    setEndDate('')
    // รีเซ็ตแล้วโหลดใหม่
    if (activeTab === 'me') {
      api.get<AttendanceRecord[]>('/attendance/me').then(setMyRecords)
    } else {
      api.get<AttendanceRecord[]>('/attendance/team').then(setTeamRecords)
    }
  }

  function formatDateTime(isoString: string | null) {
    if (!isoString) return '-'
    const date = new Date(isoString)
    return date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
  }

  // คอลัมน์สำหรับประวัติของฉัน
  const myColumns = [
    {
      header: 'วันที่ปฏิบัติงาน',
      render: (r: AttendanceRecord) => <span className="font-medium text-gray-800">{r.workDate}</span>,
    },
    {
      header: 'เวลาเช็คอิน',
      render: (r: AttendanceRecord) => (
        <span className="text-green-600 font-semibold">{formatDateTime(r.checkInAt)} น.</span>
      ),
    },
    {
      header: 'เวลาเช็คเอาต์',
      render: (r: AttendanceRecord) => (
        r.checkOutAt ? (
          <span className="text-blue-600 font-semibold">{formatDateTime(r.checkOutAt)} น.</span>
        ) : (
          <span className="text-gray-400 italic">ยังไม่เช็คเอาต์</span>
        )
      ),
    },
    {
      header: 'สถานะ',
      render: (r: AttendanceRecord) => (
        r.checkOutAt ? (
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            สมบูรณ์
          </span>
        ) : (
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            กำลังปฏิบัติงาน
          </span>
        )
      ),
    },
  ]

  // คอลัมน์สำหรับประวัติของทีมงาน
  const teamColumns = [
    {
      header: 'พนักงาน',
      render: (r: AttendanceRecord) => (
        <div>
          <div className="font-semibold text-gray-800">
            {r.user?.firstName} {r.user?.lastName}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            {r.user?.employeeCode} • {r.user?.role}
          </div>
        </div>
      ),
    },
    {
      header: 'วันที่',
      render: (r: AttendanceRecord) => <span className="font-medium">{r.workDate}</span>,
    },
    {
      header: 'เวลาเช็คอิน',
      render: (r: AttendanceRecord) => (
        <span className="text-green-600 font-semibold">{formatDateTime(r.checkInAt)} น.</span>
      ),
    },
    {
      header: 'เวลาเช็คเอาต์',
      render: (r: AttendanceRecord) => (
        r.checkOutAt ? (
          <span className="text-blue-600 font-semibold">{formatDateTime(r.checkOutAt)} น.</span>
        ) : (
          <span className="text-gray-400 italic">ยังไม่เช็คเอาต์</span>
        )
      ),
    },
    {
      header: 'สถานะ',
      render: (r: AttendanceRecord) => (
        r.checkOutAt ? (
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            สมบูรณ์
          </span>
        ) : (
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            กำลังปฏิบัติงาน
          </span>
        )
      ),
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📋 ประวัติการเข้างาน</h1>
          <p className="text-sm text-gray-500 mt-1">ดูประวัติการเช็คอินและเช็คเอาต์ย้อนหลัง</p>
        </div>

        {/* แท็บสลับดูของตัวเอง หรือดูของทีม (ถ้ามีสิทธิ์) */}
        {isManagerOrAdmin && (
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('me')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'me'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ของฉัน
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'team'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ของทีมงาน {user?.role === 'ADMIN' ? '(ทุกคน)' : '(ลูกทีม)'}
            </button>
          </div>
        )}
      </div>

      {/* ฟอร์มกรองวันที่ */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-end gap-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">ตั้งแต่วันที่</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">ถึงวันที่</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" variant="primary" isLoading={isLoading} className="py-2">
            ค้นหา
          </Button>
          {(startDate || endDate) && (
            <Button type="button" variant="secondary" onClick={handleResetFilter} className="py-2">
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </form>

      {/* ข้อความ Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* ตารางแสดงข้อมูล */}
      {isLoading ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
          กำลังโหลดประวัติ...
        </div>
      ) : activeTab === 'me' ? (
        <Table
          columns={myColumns}
          data={myRecords}
          keyExtractor={(item) => item.id}
          emptyMessage="ไม่พบประวัติการเข้างานของคุณ"
        />
      ) : (
        <Table
          columns={teamColumns}
          data={teamRecords}
          keyExtractor={(item) => item.id}
          emptyMessage="ไม่พบประวัติการเข้างานของทีมงาน"
        />
      )}
    </div>
  )
}
