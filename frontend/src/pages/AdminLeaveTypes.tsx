import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { LeaveType } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

export function AdminLeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // State Modal สร้าง
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    defaultQuotaDays: 10,
    isPaid: true,
  })
  const [isCreating, setIsCreating] = useState(false)

  // State Modal แก้ไข
  const [editingType, setEditingType] = useState<LeaveType | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    defaultQuotaDays: 10,
    isPaid: true,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  async function loadLeaveTypes() {
    try {
      setIsLoading(true)
      const data = await api.get<LeaveType[]>('/leave-types')
      setLeaveTypes(data)
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถโหลดประเภทการลาได้', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadLeaveTypes()
  }, [])

  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setMessage(null)
    try {
      await api.post('/leave-types', createForm)
      setMessage({ text: 'เพิ่มประเภทการลาใหม่เรียบร้อยแล้ว', type: 'success' })
      setShowCreateModal(false)
      setCreateForm({ name: '', defaultQuotaDays: 10, isPaid: true })
      loadLeaveTypes()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถสร้างประเภทการลาได้', type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  function openEditModal(lt: LeaveType) {
    setEditingType(lt)
    setEditForm({
      name: lt.name,
      defaultQuotaDays: lt.defaultQuotaDays,
      isPaid: lt.isPaid,
    })
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingType) return

    setIsUpdating(true)
    setMessage(null)
    try {
      await api.patch(`/leave-types/${editingType.id}`, editForm)
      setMessage({ text: 'แก้ไขประเภทการลาเรียบร้อยแล้ว', type: 'success' })
      setEditingType(null)
      loadLeaveTypes()
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถแก้ไขได้', type: 'error' })
    } finally {
      setIsUpdating(false)
    }
  }

  const columns = [
    {
      header: 'ชื่อประเภทการลา',
      render: (lt: LeaveType) => <span className="font-semibold text-gray-800">{lt.name}</span>,
    },
    {
      header: 'โควตาเริ่มต้นต่อปี (วัน)',
      render: (lt: LeaveType) => (
        <span className="font-mono font-medium text-blue-600">{lt.defaultQuotaDays} วัน</span>
      ),
    },
    {
      header: 'การจ่ายค่าจ้าง',
      render: (lt: LeaveType) => (
        lt.isPaid ? (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
            ได้รับค่าจ้าง
          </span>
        ) : (
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">
            ไม่ได้รับค่าจ้าง
          </span>
        )
      ),
    },
    {
      header: 'จัดการ',
      render: (lt: LeaveType) => (
        <Button variant="secondary" onClick={() => openEditModal(lt)} className="text-xs py-1 px-3">
          แก้ไข
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 จัดการประเภทการลา</h1>
          <p className="text-sm text-gray-500 mt-1">กำหนดประเภทการลา โควตาวันลาต่อปี และเงื่อนไขค่าจ้าง</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + เพิ่มประเภทการลา
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
          data={leaveTypes}
          keyExtractor={(item) => item.id}
          emptyMessage="ยังไม่มีประเภทการลาในระบบ"
        />
      )}

      {/* Modal สร้างใหม่ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">เพิ่มประเภทการลาใหม่</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="ชื่อประเภทการลา"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="เช่น ลาคลอดบุตร"
                required
              />
              <Input
                label="โควตาเริ่มต้นต่อปี (วัน)"
                type="number"
                min={1}
                value={createForm.defaultQuotaDays}
                onChange={(e) => setCreateForm({ ...createForm, defaultQuotaDays: parseInt(e.target.value, 10) || 1 })}
                required
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="createIsPaid"
                  checked={createForm.isPaid}
                  onChange={(e) => setCreateForm({ ...createForm, isPaid: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="createIsPaid" className="text-sm font-medium text-gray-700">
                  จ่ายค่าจ้างตามปกติ (Paid Leave)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" isLoading={isCreating}>
                  บันทึก
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal แก้ไข */}
      {editingType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">แก้ไข: {editingType.name}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <Input
                label="ชื่อประเภทการลา"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
              <Input
                label="โควตาเริ่มต้นต่อปี (วัน)"
                type="number"
                min={1}
                value={editForm.defaultQuotaDays}
                onChange={(e) => setEditForm({ ...editForm, defaultQuotaDays: parseInt(e.target.value, 10) || 1 })}
                required
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsPaid"
                  checked={editForm.isPaid}
                  onChange={(e) => setEditForm({ ...editForm, isPaid: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="editIsPaid" className="text-sm font-medium text-gray-700">
                  จ่ายค่าจ้างตามปกติ (Paid Leave)
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setEditingType(null)}>
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" isLoading={isUpdating}>
                  บันทึกการแก้ไข
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
