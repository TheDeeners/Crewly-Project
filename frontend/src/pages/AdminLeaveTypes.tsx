import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { LeaveType } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Badge } from '../components/Badge'
import { IconPlus, IconX } from '../components/Icons'

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
      render: (lt: LeaveType) => <span className="font-semibold text-txt">{lt.name}</span>,
    },
    {
      header: 'โควตาเริ่มต้นต่อปี',
      render: (lt: LeaveType) => (
        <span className="font-mono font-bold text-primary">{lt.defaultQuotaDays} วัน</span>
      ),
    },
    {
      header: 'เงื่อนไขค่าจ้าง',
      render: (lt: LeaveType) =>
        lt.isPaid ? (
          <Badge variant="success">ได้รับค่าจ้าง (Paid)</Badge>
        ) : (
          <Badge variant="neutral">ไม่ได้รับค่าจ้าง (Unpaid)</Badge>
        ),
    },
    {
      header: 'จัดการ',
      render: (lt: LeaveType) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openEditModal(lt)}
        >
          แก้ไข
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt">จัดการประเภทการลา</h1>
          <p className="text-sm text-txt-muted mt-0.5">
            กำหนดประเภทการลา โควตาวันลาเริ่มต้นต่อปี และเงื่อนไขค่าจ้าง
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<IconPlus className="w-4 h-4" />}
        >
          เพิ่มประเภทการลา
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
          กำลังโหลดประเภทการลา...
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-surface rounded-3xl border border-border shadow-float max-w-md w-full p-6 sm:p-7 space-y-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-txt">เพิ่มประเภทการลาใหม่</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-txt-muted hover:text-txt p-1 rounded-lg"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="ชื่อประเภทการลา"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="เช่น ลาคลอดบุตร, ลาบวช"
                required
              />
              <Input
                label="โควตาเริ่มต้นต่อปี (วัน)"
                type="number"
                min={1}
                value={createForm.defaultQuotaDays}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    defaultQuotaDays: parseInt(e.target.value, 10) || 1,
                  })
                }
                required
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createIsPaid"
                  checked={createForm.isPaid}
                  onChange={(e) => setCreateForm({ ...createForm, isPaid: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="createIsPaid" className="text-sm font-medium text-txt cursor-pointer">
                  จ่ายค่าจ้างตามปกติ (Paid Leave)
                </label>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" isLoading={isCreating}>
                  บันทึกประเภทการลา
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal แก้ไข */}
      {editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingType(null)}
          />
          <div className="relative bg-surface rounded-3xl border border-border shadow-float max-w-md w-full p-6 sm:p-7 space-y-5 z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-txt">แก้ไข: {editingType.name}</h2>
              <button
                onClick={() => setEditingType(null)}
                className="text-txt-muted hover:text-txt p-1 rounded-lg"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

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
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    defaultQuotaDays: parseInt(e.target.value, 10) || 1,
                  })
                }
                required
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsPaid"
                  checked={editForm.isPaid}
                  onChange={(e) => setEditForm({ ...editForm, isPaid: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="editIsPaid" className="text-sm font-medium text-txt cursor-pointer">
                  จ่ายค่าจ้างตามปกติ (Paid Leave)
                </label>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingType(null)}>
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
