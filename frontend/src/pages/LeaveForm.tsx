import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { LeaveType, LeaveBalance } from '../types'
import { Button } from '../components/Button'
import { Badge } from '../components/Badge'
import { IconCalendar, IconArrowRight } from '../components/Icons'

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
  const remainingDays = selectedBalance
    ? selectedBalance.quotaDays - selectedBalance.usedDays
    : null

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
      navigate('/my-leaves')
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการยื่นใบลา')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-txt">ยื่นใบลา</h1>
          <p className="text-xs text-txt-muted mt-0.5">กรอกรายละเอียดเพื่อขออนุมัติการลา</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/my-leaves')}>
          ย้อนกลับ
        </Button>
      </div>

      {error && (
        <div className="p-3.5 bg-[#FEF2F2] text-[#B91C1C] rounded-xl text-xs font-medium border border-[#FECACA]">
          {error}
        </div>
      )}

      {isLoadingData ? (
        <div className="bg-surface p-8 rounded-xl border border-border text-center text-txt-muted text-sm shadow-subtle">
          กำลังโหลดข้อมูล...
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-surface p-5 sm:p-6 rounded-xl border border-border shadow-card space-y-4"
        >
          {/* เลือกประเภทการลา */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-txt">ประเภทการลา</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(e.target.value)}
              className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              required
            >
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.isPaid ? 'ได้รับค่าจ้าง' : 'ไม่ได้รับค่าจ้าง'})
                </option>
              ))}
            </select>

            {/* Quota preview banner */}
            {remainingDays !== null && (
              <div className="mt-2 p-3.5 rounded-2xl bg-bg border border-border flex items-center justify-between">
                <span className="text-xs text-txt-muted">โควตาคงเหลือประเภทนี้:</span>
                <span className="text-xs font-bold text-primary">
                  {remainingDays} วัน (จากสิทธิ์ทั้งหมด {selectedBalance?.quotaDays} วัน)
                </span>
              </div>
            )}
          </div>

          {/* ช่วงวันที่ลา */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-txt">ตั้งแต่วันที่</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-txt">ถึงวันที่</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-bg rounded-xl border border-border text-xs text-txt-muted flex items-center gap-2">
            <span className="text-primary font-bold">ℹ</span>
            <span>ระบบจะไม่นับวันเสาร์-อาทิตย์ และวันหยุดนักขัตฤกษ์ของบริษัทเป็นวันลา</span>
          </div>

          {/* เหตุผลการลา */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-txt">เหตุผลการลา</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลในการลา เช่น ลาพักผ่อนประจำปี, มีนัดตรวจสุขภาพ..."
              className="bg-surface border border-border rounded-xl px-3.5 py-2.5 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/my-leaves')}
            >
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
