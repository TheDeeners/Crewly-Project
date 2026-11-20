import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { Holiday } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

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
      render: (h: Holiday) => <span className="font-mono font-medium text-gray-800">{h.holidayDate}</span>,
    },
    {
      header: 'ชื่อวันหยุด',
      render: (h: Holiday) => <span className="font-semibold text-gray-800">{h.name}</span>,
    },
    {
      header: 'จัดการ',
      render: (h: Holiday) => (
        <Button
          variant="danger"
          onClick={() => handleDelete(h)}
          isLoading={deletingId === h.id}
          className="text-xs py-1 px-3"
        >
          ลบ
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการวันหยุดบริษัท</h1>
          <p className="text-sm text-gray-500 mt-1">กำหนดวันหยุดตามประเพณีของบริษัท (จะไม่ถูกนับเป็นวันลา)</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + เพิ่มวันหยุด
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

      {isLoading ? (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
          กำลังโหลด...
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">เพิ่มวันหยุดบริษัท</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">วันที่</label>
                <input
                  type="date"
                  value={createForm.holidayDate}
                  onChange={(e) => setCreateForm({ ...createForm, holidayDate: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <Input
                label="ชื่อวันหยุด"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="เช่น วันสงกรานต์"
                required
              />

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
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
