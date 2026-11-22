import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { AttendanceRecord } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { IconClock, IconFilter, IconCalendar } from '../components/Icons'

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
      render: (r: AttendanceRecord) => (
        <div className="flex items-center gap-2">
          <IconCalendar className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-txt">{r.workDate}</span>
        </div>
      ),
    },
    {
      header: 'เวลาเข้างาน (Check-in)',
      render: (r: AttendanceRecord) => (
        <span className="text-status-success font-semibold tracking-wide">
          {formatDateTime(r.checkInAt)} น.
        </span>
      ),
    },
    {
      header: 'เวลาออกงาน (Check-out)',
      render: (r: AttendanceRecord) =>
        r.checkOutAt ? (
          <span className="text-status-info font-semibold tracking-wide">
            {formatDateTime(r.checkOutAt)} น.
          </span>
        ) : (
          <span className="text-txt-light italic text-xs">ยังไม่เช็คเอาต์</span>
        ),
    },
    {
      header: 'สถานะ',
      render: (r: AttendanceRecord) =>
        r.checkOutAt ? (
          <Badge variant="success">บันทึกเวลาครบถ้วน</Badge>
        ) : (
          <Badge variant="pending">กำลังปฏิบัติงาน</Badge>
        ),
    },
  ]

  // คอลัมน์สำหรับประวัติของทีมงาน
  const teamColumns = [
    {
      header: 'พนักงาน',
      render: (r: AttendanceRecord) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {r.user?.firstName?.[0] || 'U'}
          </div>
          <div>
            <div className="font-semibold text-txt text-sm">
              {r.user?.firstName} {r.user?.lastName}
            </div>
            <div className="text-[11px] text-txt-muted">
              {r.user?.employeeCode} • {r.user?.role}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'วันที่',
      render: (r: AttendanceRecord) => <span className="font-medium text-txt">{r.workDate}</span>,
    },
    {
      header: 'เวลาเช็คอิน',
      render: (r: AttendanceRecord) => (
        <span className="text-status-success font-semibold">
          {formatDateTime(r.checkInAt)} น.
        </span>
      ),
    },
    {
      header: 'เวลาเช็คเอาต์',
      render: (r: AttendanceRecord) =>
        r.checkOutAt ? (
          <span className="text-status-info font-semibold">
            {formatDateTime(r.checkOutAt)} น.
          </span>
        ) : (
          <span className="text-txt-light italic text-xs">ยังไม่เช็คเอาต์</span>
        ),
    },
    {
      header: 'สถานะ',
      render: (r: AttendanceRecord) =>
        r.checkOutAt ? (
          <Badge variant="success">ครบถ้วน</Badge>
        ) : (
          <Badge variant="pending">กำลังปฏิบัติงาน</Badge>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt">ประวัติการเข้างาน</h1>
          <p className="text-xs text-txt-muted mt-0.5">
            ตรวจสอบข้อมูลเวลาเข้า-ออกงานและการปฏิบัติงาน
          </p>
        </div>

        {/* แท็บสลับดูของตัวเอง หรือดูของทีม */}
        {isManagerOrAdmin && (
          <div className="flex bg-surface p-1 rounded-xl border border-border shadow-subtle">
            <button
              onClick={() => setActiveTab('me')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'me'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-txt-muted hover:text-txt'
              }`}
            >
              ประวัติของฉัน
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === 'team'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-txt-muted hover:text-txt'
              }`}
            >
              ประวัติทีมงาน {user?.role === 'ADMIN' ? '(ทุกคน)' : '(ลูกทีม)'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3.5 bg-[#FEF2F2] text-[#B91C1C] rounded-xl text-xs font-medium border border-[#FECACA]">
          {error}
        </div>
      )}

      {/* Filter Card */}
      <form
        onSubmit={handleFilterSubmit}
        className="bg-surface p-4 rounded-xl border border-border shadow-card flex flex-wrap items-end gap-3.5"
      >
        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-txt">ตั้งแต่วันที่</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-txt">ถึงวันที่</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<IconFilter className="w-4 h-4" />}
          >
            ค้นหา
          </Button>
          {(startDate || endDate) && (
            <Button type="button" variant="outline" onClick={handleResetFilter}>
              ล้างตัวกรอง
            </Button>
          )}
        </div>
      </form>

      {/* Table Section */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-surface p-12 rounded-2xl border border-border text-center text-txt-muted text-sm shadow-subtle">
            กำลังโหลดข้อมูลบันทึกเวลา...
          </div>
        ) : (
          <Table
            columns={activeTab === 'me' ? myColumns : teamColumns}
            data={activeTab === 'me' ? myRecords : teamRecords}
            keyExtractor={(item) => item.id}
            emptyMessage={
              activeTab === 'me'
                ? 'ยังไม่มีประวัติการเข้างานของคุณในช่วงเวลานี้'
                : 'ไม่พบประวัติการเข้างานของทีมงานในช่วงเวลานี้'
            }
          />
        )}
      </div>
    </div>
  )
}
