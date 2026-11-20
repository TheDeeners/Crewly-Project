import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Holiday } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { IconPlus, IconCalendar, IconX } from '../components/Icons'

export function AdminHolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // State Modal สร้างวันหยุด
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    holidayDate: '',
    name: '',
  })
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadHolidays() {
    try {
      setIsLoading(true)
      const data = await api.get<Holiday[]>('/holidays')
      setHolidays(data)
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถโหลดวันหยุดได้', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHolidays()
  }, [])

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setMessage(null)
    try {
      await api.post('/holidays', createForm)
      setMessage({ text: 'เพิ่มวันหยุดเรียบร้อยแล้ว', type: 'success' })
      setShowCreateModal(false)
      setCreateForm({ holidayDate: '', name: '' })
      loadHolidays()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถเพิ่มวันหยุดได้', type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(h: Holiday) {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวันหยุด "${h.name}" (${h.holidayDate})?`)) {
      return
    }

    setDeletingId(h.id)
    setMessage(null)
    try {
      await api.delete(`/holidays/${h.id}`)
      setMessage({ text: 'ลบวันหยุดเรียบร้อยแล้ว', type: 'success' })
      loadHolidays()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถลบวันหยุดได้', type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      header: 'วันที่',
      render: (h: Holiday) => (
        <div className="flex items-center gap-2">
          <IconCalendar className="w-4 h-4 text-primary shrink-0" />
          <span className="font-mono font-semibold text-txt">{h.holidayDate}</span>
        </div>
      ),
    },
    {
      header: 'ชื่อวันหยุด',
      render: (h: Holiday) => <span className="font-semibold text-txt">{h.name}</span>,
    },
    {
      header: 'จัดการ',
      render: (h: Holiday) => (
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDelete(h)}
          isLoading={deletingId === h.id}
        >
          ลบ
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt">จัดการวันหยุดบริษัท</h1>
          <p className="text-sm text-txt-muted mt-0.5">
            กำหนดวันหยุดตามประเพณีของบริษัท (ซึ่งระบบจะไม่นับเป็นวันลาของพนักงาน)
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<IconPlus className="w-4 h-4" />}
        >
          เพิ่มวันหยุด
        </Button>
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

      {isLoading ? (
        <div className="bg-surface p-12 rounded-3xl border border-border text-center text-txt-muted text-sm shadow-subtle">
          กำลังโหลดวันหยุด...
        </div>
      ) : (
        <Table
          columns={columns}
          data={holidays}
          keyExtractor={(item) => item.id}
          emptyMessage="ยังไม่มีวันหยุดในระบบ"
        />
      )}

      {/* Modal เพิ่มวันหยุดใหม่ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-surface rounded-3xl border border-border shadow-float max-w-md w-full p-6 sm:p-7 space-y-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-txt">เพิ่มวันหยุดบริษัท</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-txt-muted hover:text-txt p-1 rounded-lg"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-txt">วันที่</label>
                <input
                  type="date"
                  value={createForm.holidayDate}
                  onChange={(e) => setCreateForm({ ...createForm, holidayDate: e.target.value })}
                  className="bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <Input
                label="ชื่อวันหยุด"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="เช่น วันสงกรานต์, วันขึ้นปีใหม่"
                required
              />

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" isLoading={isCreating}>
                  บันทึกวันหยุด
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
