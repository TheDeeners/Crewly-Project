import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { LeaveRequest } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { IconCheck, IconX, IconCheckSquare } from '../components/Icons'

export function ApprovalsPage() {
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // ดึงรายการใบลาที่รออนุมัติ
  async function loadPendingRequests() {
    try {
      setIsLoading(true)
      const data = await api.get<LeaveRequest[]>('/leave-requests/pending')
      setPendingRequests(data)
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถโหลดรายการรออนุมัติได้', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPendingRequests()
  }, [])

  // ฟังก์ชันอนุมัติใบลา
  async function handleApprove(id: string) {
    if (!window.confirm('คุณต้องการอนุมัติคำขอลานี้ใช่หรือไม่?')) {
      return
    }

    setActionLoadingId(id)
    setMessage(null)
    try {
      await api.patch(`/leave-requests/${id}/approve`, {})
      setMessage({ text: 'อนุมัติคำขอลาเรียบร้อยแล้ว ระบบได้ตัดโควตาวันลาแล้ว', type: 'success' })
      loadPendingRequests()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถอนุมัติคำขอลาได้', type: 'error' })
    } finally {
      setActionLoadingId(null)
    }
  }

  // ฟังก์ชันปฏิเสธใบลา
  async function handleReject(id: string) {
    if (!window.confirm('คุณต้องการปฏิเสธคำขอลานี้ใช่หรือไม่?')) {
      return
    }

    setActionLoadingId(id)
    setMessage(null)
    try {
      await api.patch(`/leave-requests/${id}/reject`, {})
      setMessage({ text: 'ปฏิเสธคำขอลาเรียบร้อยแล้ว', type: 'success' })
      loadPendingRequests()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถปฏิเสธคำขอลาได้', type: 'error' })
    } finally {
      setActionLoadingId(null)
    }
  }

  const columns = [
    {
      header: 'ผู้ยื่นคำขอ',
      render: (r: LeaveRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {r.user?.firstName?.[0] || 'U'}
          </div>
          <div>
            <div className="font-semibold text-txt">
              {r.user?.firstName} {r.user?.lastName}
            </div>
            <div className="text-xs text-txt-muted">
              {r.user?.employeeCode} • {r.user?.role}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'ประเภทการลา',
      render: (r: LeaveRequest) => (
        <span className="font-semibold text-txt">{r.leaveType?.name}</span>
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
        <span className="text-txt-muted text-xs max-w-xs block line-clamp-2">{r.reason}</span>
      ),
    },
    {
      header: 'ยื่นเมื่อ',
      render: (r: LeaveRequest) => {
        const d = new Date(r.createdAt)
        return (
          <span className="text-xs text-txt-light">
            {d.toLocaleDateString('th-TH')} {d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      },
    },
    {
      header: 'การตัดสินใจ',
      render: (r: LeaveRequest) => (
        <div className="flex items-center gap-2">
          <Button
            variant="success"
            size="sm"
            onClick={() => handleApprove(r.id)}
            disabled={actionLoadingId === r.id}
            isLoading={actionLoadingId === r.id}
            leftIcon={<IconCheck className="w-3.5 h-3.5" />}
          >
            อนุมัติ
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleReject(r.id)}
            disabled={actionLoadingId === r.id}
            leftIcon={<IconX className="w-3.5 h-3.5" />}
          >
            ปฏิเสธ
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-txt">พิจารณาอนุมัติใบลา</h1>
            {pendingRequests.length > 0 && (
              <Badge variant="pending">{pendingRequests.length} รายการรอพิจารณา</Badge>
            )}
          </div>
          <p className="text-xs text-txt-muted mt-0.5">
            ตรวจสอบและพิจารณาอนุมัติหรือปฏิเสธคำขอลาของทีมงาน
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium border shadow-subtle ${
            message.type === 'success'
              ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
              : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="bg-surface p-8 rounded-xl border border-border text-center text-txt-muted text-sm shadow-subtle">
          กำลังโหลดรายการรออนุมัติ...
        </div>
      ) : (
        <Table
          columns={columns}
          data={pendingRequests}
          keyExtractor={(item) => item.id}
          emptyMessage="ไม่มีคำขอลาที่รอการอนุมัติในขณะนี้"
        />
      )}
    </div>
  )
}
