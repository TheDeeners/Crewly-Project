import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { LeaveType, LeaveBalance } from '../types'
import { Button } from '../components/Button'

export function LeaveFormPage() {
  const navigate = useNavigate()

  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [balances, setBalances] = useState<LeaveBalance[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Controlled form state
  const [leaveTypeId, setLeaveTypeId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // โหลดประเภทการลาและโควตาคงเหลือ
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoadingData(true)
        const [types, userBalances] = await Promise.all([
          api.get<LeaveType[]>('/leave-types'),
          api.get<LeaveBalance[]>('/leave-balances/me'),
        ])
        setLeaveTypes(types)
        setBalances(userBalances)
        if (types.length > 0) {
          setLeaveTypeId(types[0].id)
        }
      } catch (err: any) {
        setError(err.message || 'ไม่สามารถโหลดข้อมูลประเภทการลาได้')
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

  // หาโควตาคงเหลือของประเภทการลาที่กำลังเลือก
  const selectedBalance = balances.find((b) => b.leaveTypeId === leaveTypeId)
  const remainingDays = selectedBalance ? selectedBalance.quotaDays - selectedBalance.usedDays : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await api.post('/leave-requests', {
        leaveTypeId,
        startDate,
        endDate,
        reason,
      })
      // ยื่นสำเร็จ กลับไปยังหน้าใบลาของฉัน
      navigate('/my-leaves')
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการยื่นใบลา')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ยื่นใบลา</h1>
          <p className="text-sm text-gray-500 mt-1">กรอกรายละเอียดเพื่อขออนุมัติการลา</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/my-leaves')}>
          ย้อนกลับ
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {isLoadingData ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
          กำลังโหลดข้อมูล...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          {/* เลือกประเภทการลา */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">ประเภทการลา</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              required
            >
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.isPaid ? 'ได้รับค่าจ้าง' : 'ไม่ได้รับค่าจ้าง'})
                </option>
              ))}
            </select>
            {remainingDays !== null && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                โควตาคงเหลือของคุณ: {remainingDays} วัน (จากทั้งหมด {selectedBalance?.quotaDays} วัน)
              </p>
            )}
          </div>

          {/* ช่วงวันที่ลา */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">ตั้งแต่วันที่</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">ถึงวันที่</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            * ระบบจะไม่นับวันเสาร์-อาทิตย์ และวันหยุดตามประเพณีของบริษัทลงในจำนวนวันลา
          </p>

          {/* เหตุผลการลา */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">เหตุผลการลา</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลในการลา เช่น มีนัดพบแพทย์, ธุระส่วนตัวต่างจังหวัด..."
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/my-leaves')}>
              ยกเลิก
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              ส่งคำขอลา
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
