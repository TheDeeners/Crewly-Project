import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { LeaveRequest, LeaveBalance } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'

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
      // รีโหลดข้อมูลใหม่
      loadData()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถยกเลิกคำขอลาได้', type: 'error' })
    } finally {
      setActionLoadingId(null)
    }
  }

  // แปลงสถานะเป็น badge สีสวยงาม
  function renderStatusBadge(status: string) {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            รออนุมัติ
          </span>
        )
      case 'APPROVED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            อนุมัติแล้ว
          </span>
        )
      case 'REJECTED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            ปฏิเสธ
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            ยกเลิกแล้ว
          </span>
        )
      default:
        return <span>{status}</span>
    }
  }

  const columns = [
    {
      header: 'ประเภทการลา',
      render: (r: LeaveRequest) => (
        <span className="font-semibold text-gray-800">{r.leaveType?.name || 'การลา'}</span>
      ),
    },
    {
      header: 'ช่วงวันที่ลา',
      render: (r: LeaveRequest) => (
        <div>
          <span className="font-medium text-gray-700">{r.startDate} ถึง {r.endDate}</span>
          <span className="text-xs text-gray-500 block">({r.totalDays} วันทำงาน)</span>
        </div>
      ),
    },
    {
      header: 'เหตุผล',
      render: (r: LeaveRequest) => (
        <span className="text-gray-600 text-xs line-clamp-2 max-w-xs">{r.reason}</span>
      ),
    },
    {
      header: 'สถานะ',
      render: (r: LeaveRequest) => renderStatusBadge(r.status),
    },
    {
      header: 'ผู้อนุมัติ',
      render: (r: LeaveRequest) => (
        r.approver ? (
          <span className="text-xs text-gray-600">
            {r.approver.firstName} {r.approver.lastName}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )
      ),
    },
    {
      header: 'การจัดการ',
      render: (r: LeaveRequest) => (
        r.status === 'PENDING' ? (
          <Button
            variant="danger"
            onClick={() => handleCancel(r.id)}
            isLoading={actionLoadingId === r.id}
            className="text-xs py-1 px-2.5"
          >
            ยกเลิก
          </Button>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )
      ),
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🗓️ ใบลาของฉัน</h1>
          <p className="text-sm text-gray-500 mt-1">ตรวจสอบโควตาและติดตามสถานะคำขอลา</p>
        </div>

        <Button variant="primary" onClick={() => navigate('/leave-form')}>
          + ยื่นคำขอลาใหม่
        </Button>
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

      {/* สรุปโควตาคงเหลือ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {balances.map((b) => {
          const remaining = b.quotaDays - b.usedDays
          return (
            <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-xs font-semibold uppercase text-gray-400">{b.leaveType.name}</span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-blue-600">{remaining}</span>
                <span className="text-xs text-gray-500">คงเหลือ / {b.quotaDays} วัน</span>
              </div>
              <span className="text-xs text-gray-400 mt-1 block">ใช้ไป {b.usedDays} วัน</span>
            </div>
          )
        })}
      </div>

      {/* รายการคำขอลา */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800">ประวัติการขอลา</h2>
        {isLoading ? (
          <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
            กำลังโหลดรายการ...
          </div>
        ) : (
          <Table
            columns={columns}
            data={requests}
            keyExtractor={(item) => item.id}
            emptyMessage="ยังไม่มีประวัติการยื่นใบลา"
          />
        )}
      </div>
    </div>
  )
}
