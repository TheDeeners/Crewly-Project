import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { LeaveRequest, LeaveBalance } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { IconCalendar, IconPlus } from '../components/Icons'

export function MyLeavesPage() {
  const navigate = useNavigate()

  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // โหลดข้อมูลโควตาคงเหลือและประวัติใบลา
  async function loadData() {
    try {
      setIsLoading(true)
      const [bData, rData] = await Promise.all([
        api.get<LeaveBalance[]>('/leave-balances/me'),
        api.get<LeaveRequest[]>('/leave-requests/me'),
      ])
      setBalances(bData)
      setRequests(rData)
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถโหลดข้อมูลใบลาได้', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ฟังก์ชันยกเลิกใบลา (เฉพาะสถานะ PENDING)
  async function handleCancel(id: string) {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำขอลานี้?')) {
      return
    }

    setActionLoadingId(id)
    setMessage(null)
    try {
      await api.patch(`/leave-requests/${id}/cancel`, {})
      setMessage({ text: 'ยกเลิกคำขอลาเรียบร้อยแล้ว', type: 'success' })
      loadData()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถยกเลิกคำขอลาได้', type: 'error' })
    } finally {
      setActionLoadingId(null)
    }
  }

  // แปลงสถานะเป็น badge สีของระบบที่ผู้ใช้กำหนด
  function renderStatusBadge(status: string) {
    switch (status) {
      case 'PENDING':
        return <Badge variant="pending">รออนุมัติ</Badge>
      case 'APPROVED':
        return <Badge variant="success">อนุมัติแล้ว</Badge>
      case 'REJECTED':
        return <Badge variant="rejected">ปฏิเสธ</Badge>
      case 'CANCELLED':
        return <Badge variant="neutral">ยกเลิกแล้ว</Badge>
      default:
        return <Badge variant="neutral">{status}</Badge>
    }
  }

  const columns = [
    {
      header: 'ประเภทการลา',
      render: (r: LeaveRequest) => (
        <span className="font-semibold text-txt">{r.leaveType?.name || 'การลา'}</span>
      ),
    },
    {
      header: 'ช่วงวันที่ลา',
      render: (r: LeaveRequest) => (
        <div>
          <span className="font-medium text-txt">{r.startDate} ถึง {r.endDate}</span>
          <span className="text-xs text-primary font-semibold block">({r.totalDays} วันทำงาน)</span>
        </div>
      ),
    },
    {
      header: 'เหตุผล',
      render: (r: LeaveRequest) => (
        <span className="text-txt-muted text-xs line-clamp-2 max-w-xs">{r.reason}</span>
      ),
    },
    {
      header: 'สถานะ',
      render: (r: LeaveRequest) => renderStatusBadge(r.status),
    },
    {
      header: 'ผู้อนุมัติ',
      render: (r: LeaveRequest) =>
        r.approver ? (
          <span className="text-xs text-txt font-medium">
            {r.approver.firstName} {r.approver.lastName}
          </span>
        ) : (
          <span className="text-xs text-txt-light">-</span>
        ),
    },
    {
      header: 'การจัดการ',
      render: (r: LeaveRequest) =>
        r.status === 'PENDING' ? (
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancel(r.id)}
            isLoading={actionLoadingId === r.id}
          >
            ยกเลิก
          </Button>
        ) : (
          <span className="text-xs text-txt-light">-</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt">ใบลาของฉัน</h1>
          <p className="text-sm text-txt-muted mt-0.5">
            ตรวจสอบโควตาวันลาคงเหลือ และติดตามสถานะคำขอลา
          </p>
        </div>

        <Link to="/leave-form">
          <Button variant="primary" leftIcon={<IconPlus className="w-4 h-4" />}>
            ยื่นคำขอลาใหม่
          </Button>
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium border shadow-subtle ${
            message.type === 'success'
              ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
              : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* สรุปโควตาคงเหลือ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {balances.map((b) => {
          const remaining = b.quotaDays - b.usedDays
          const usagePercent = Math.min(100, Math.round((b.usedDays / b.quotaDays) * 100))

          return (
            <div
              key={b.id}
              className="bg-surface p-5 rounded-2xl border border-border shadow-card hover:shadow-cardHover transition-all duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-txt-muted">
                  {b.leaveType.name}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-bg text-txt-muted">
                  สิทธิ์ {b.quotaDays} วัน
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-primary">{remaining}</span>
                <span className="text-xs text-txt-muted font-medium">วันคงเหลือ</span>
              </div>
              <div className="w-full bg-[#E8DDD9] h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <span className="text-xs text-txt-light mt-2 block">ใช้ไปแล้ว {b.usedDays} วัน</span>
            </div>
          )
        })}
      </div>

      {/* ประวัติคำขอลา */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-txt">ประวัติการยื่นคำขอลา</h2>
        {isLoading ? (
          <div className="bg-surface p-12 rounded-2xl border border-border text-center text-txt-muted text-sm shadow-subtle">
            กำลังโหลดรายการ...
          </div>
        ) : (
          <Table
            columns={columns}
            data={requests}
            keyExtractor={(item) => item.id}
            emptyMessage="ยังไม่มีประวัติการยื่นใบลาของคุณ"
          />
        )}
      </div>
    </div>
  )
}
