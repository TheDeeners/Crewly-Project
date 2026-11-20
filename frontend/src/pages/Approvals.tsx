import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { LeaveRequest } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'

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
      setMessage({ text: 'อนุมัติคำขอลาเรียบร้อยแล้ว และระบบได้หักโควตาแล้ว', type: 'success' })
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
      header: 'ประเภทการลา',
      render: (r: LeaveRequest) => (
        <span className="font-medium text-gray-800">{r.leaveType?.name}</span>
      ),
    },
    {
      header: 'ช่วงวันที่ลา',
      render: (r: LeaveRequest) => (
        <div>
          <span className="font-medium">{r.startDate} ถึง {r.endDate}</span>
          <span className="text-xs text-blue-600 font-semibold block">({r.totalDays} วันทำงาน)</span>
        </div>
      ),
    },
    {
      header: 'เหตุผล',
      render: (r: LeaveRequest) => (
        <span className="text-gray-600 text-xs max-w-xs block">{r.reason}</span>
      ),
    },
    {
      header: 'ยื่นเมื่อ',
      render: (r: LeaveRequest) => {
        const d = new Date(r.createdAt)
        return (
          <span className="text-xs text-gray-500">
            {d.toLocaleDateString('th-TH')} {d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )
      },
    },
    {
      header: 'การตัดสินใจ',
      render: (r: LeaveRequest) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => handleApprove(r.id)}
            disabled={actionLoadingId === r.id}
            isLoading={actionLoadingId === r.id}
            className="text-xs py-1 px-3 bg-emerald-600 hover:bg-emerald-700"
          >
            อนุมัติ
          </Button>
          <Button
            variant="danger"
            onClick={() => handleReject(r.id)}
            disabled={actionLoadingId === r.id}
            className="text-xs py-1 px-3"
          >
            ปฏิเสธ
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">พิจารณาอนุมัติใบลา</h1>
        <p className="text-sm text-gray-500 mt-1">
          ตรวจสอบและอนุมัติหรือปฏิเสธคำขอลาของทีมงาน
        </p>
      </div>

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

      {isLoading ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
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
