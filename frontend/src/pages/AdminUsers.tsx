import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { User, Role } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Badge } from '../components/Badge'
import { IconUsers, IconPlus, IconX } from '../components/Icons'

interface ExtendedUser extends User {
  manager?: {
    id: string
    firstName: string
    lastName: string
  } | null
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // State Modal สร้างผู้ใช้ใหม่
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    employeeCode: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE' as Role,
    managerId: '',
  })
  const [isCreating, setIsCreating] = useState(false)

  // State Modal แก้ไขผู้ใช้
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE' as Role,
    managerId: '',
    isActive: true,
    password: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)

  // โหลดรายชื่อผู้ใช้
  async function loadUsers() {
    try {
      setIsLoading(true)
      const data = await api.get<ExtendedUser[]>('/users')
      setUsers(data)
    } catch (err: any) {
      setMessage({ text: err.message || 'ไม่สามารถโหลดรายชื่อผู้ใช้ได้', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // ส่งฟอร์มสร้างผู้ใช้ใหม่
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)
    setMessage(null)
    try {
      await api.post('/users', {
        ...createForm,
        managerId: createForm.managerId || null,
      })
      setMessage({ text: 'สร้างผู้ใช้ใหม่และกำหนดโควตาปีปัจจุบันเรียบร้อยแล้ว', type: 'success' })
      setShowCreateModal(false)
      setCreateForm({
        employeeCode: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'EMPLOYEE',
        managerId: '',
      })
      loadUsers()
    } catch (err: any) {
      setMessage({ text: err.message || 'สร้างผู้ใช้ไม่สำเร็จ', type: 'error' })
    } finally {
      setIsCreating(false)
    }
  }

  // เปิด Modal แก้ไขผู้ใช้
  function openEditModal(u: ExtendedUser) {
    setEditingUser(u)
    setEditForm({
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      managerId: u.managerId || '',
      isActive: u.isActive,
      password: '',
    })
  }

  // ส่งฟอร์มแก้ไขผู้ใช้
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingUser) return

    setIsUpdating(true)
    setMessage(null)
    try {
      const payload: any = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        role: editForm.role,
        managerId: editForm.managerId || null,
        isActive: editForm.isActive,
      }
      if (editForm.password) {
        payload.password = editForm.password
      }

      await api.patch(`/users/${editingUser.id}`, payload)
      setMessage({ text: 'แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว', type: 'success' })
      setEditingUser(null)
      loadUsers()
    } catch (err: any) {
      setMessage({ text: err.message || 'แก้ไขข้อมูลผู้ใช้ไม่สำเร็จ', type: 'error' })
    } finally {
      setIsUpdating(false)
    }
  }

  const managerOptions = users.filter((u) => u.role === 'MANAGER' || u.role === 'ADMIN')

  const columns = [
    {
      header: 'รหัสพนักงาน',
      render: (u: ExtendedUser) => (
        <span className="font-mono font-semibold text-primary">{u.employeeCode}</span>
      ),
    },
    {
      header: 'ชื่อ-นามสกุล',
      render: (u: ExtendedUser) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg border border-border text-primary font-bold text-xs flex items-center justify-center shrink-0">
            {u.firstName?.[0] || 'U'}
          </div>
          <div>
            <div className="font-semibold text-txt">
              {u.firstName} {u.lastName}
            </div>
            <div className="text-xs text-txt-muted">{u.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'บทบาท',
      render: (u: ExtendedUser) => {
        if (u.role === 'ADMIN') {
          return (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-light text-primary border border-primary/20">
              ADMIN
            </span>
          )
        }
        if (u.role === 'MANAGER') {
          return <Badge variant="info">MANAGER</Badge>
        }
        return <Badge variant="neutral">EMPLOYEE</Badge>
      },
    },
    {
      header: 'หัวหน้างาน',
      render: (u: ExtendedUser) =>
        u.manager ? (
          <span className="text-xs font-medium text-txt">
            {u.manager.firstName} {u.manager.lastName}
          </span>
        ) : (
          <span className="text-xs text-txt-light">-</span>
        ),
    },
    {
      header: 'สถานะ',
      render: (u: ExtendedUser) =>
        u.isActive ? (
          <Badge variant="success">ใช้งานปกติ</Badge>
        ) : (
          <Badge variant="rejected">ระงับใช้งาน</Badge>
        ),
    },
    {
      header: 'จัดการ',
      render: (u: ExtendedUser) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => openEditModal(u)}
        >
          แก้ไข
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-txt">จัดการผู้ใช้ในระบบ</h1>
          <p className="text-sm text-txt-muted mt-0.5">
            เพิ่ม แก้ไขข้อมูล กำหนดหัวหน้างาน และบทบาทสิทธิ์ผู้ใช้งาน
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          leftIcon={<IconPlus className="w-4 h-4" />}
        >
          เพิ่มผู้ใช้ใหม่
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
          กำลังโหลดรายชื่อผู้ใช้...
        </div>
      ) : (
        <Table
          columns={columns}
          data={users}
          keyExtractor={(item) => item.id}
          emptyMessage="ไม่พบผู้ใช้ในระบบ"
        />
      )}

      {/* Modal เพิ่มผู้ใช้ใหม่ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-surface rounded-3xl border border-border shadow-float max-w-md w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-txt">เพิ่มผู้ใช้ใหม่</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-txt-muted hover:text-txt p-1 rounded-lg"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <Input
                label="รหัสพนักงาน"
                value={createForm.employeeCode}
                onChange={(e) => setCreateForm({ ...createForm, employeeCode: e.target.value })}
                placeholder="เช่น EMP005"
                required
              />
              <Input
                label="อีเมล"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="user@crewly.test"
                required
              />
              <Input
                label="รหัสผ่านเริ่มต้น"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="ขั้นต่ำ 6 ตัวอักษร"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="ชื่อ"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  required
                />
                <Input
                  label="นามสกุล"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-txt">บทบาท (Role)</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                  className="bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="EMPLOYEE">EMPLOYEE (พนักงานทั่วไป)</option>
                  <option value="MANAGER">MANAGER (หัวหน้างาน)</option>
                  <option value="ADMIN">ADMIN (ฝ่ายบุคคล / ผู้ดูแลระบบ)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-txt">หัวหน้างาน (Manager)</label>
                <select
                  value={createForm.managerId}
                  onChange={(e) => setCreateForm({ ...createForm, managerId: e.target.value })}
                  className="bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">-- ไม่มีหัวหน้างานตรง --</option>
                  {managerOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.employeeCode} - {m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit" variant="primary" isLoading={isCreating}>
                  บันทึกผู้ใช้
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal แก้ไขผู้ใช้ */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-txt/40 backdrop-blur-sm transition-opacity"
            onClick={() => setEditingUser(null)}
          />
          <div className="relative bg-surface rounded-3xl border border-border shadow-float max-w-md w-full p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-lg font-bold text-txt">
                แก้ไขข้อมูล: {editingUser.employeeCode}
              </h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-txt-muted hover:text-txt p-1 rounded-lg"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="ชื่อ"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  required
                />
                <Input
                  label="นามสกุล"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-txt">บทบาท (Role)</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                  className="bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-txt">หัวหน้างาน (Manager)</label>
                <select
                  value={editForm.managerId}
                  onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
                  className="bg-surface border border-border rounded-xl px-3.5 py-2 text-sm text-txt focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">-- ไม่มีหัวหน้างานตรง --</option>
                  {managerOptions
                    .filter((m) => m.id !== editingUser.id)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.firstName} {m.lastName} ({m.employeeCode})
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActiveCheck" className="text-sm font-medium text-txt cursor-pointer">
                  เปิดให้เข้าสู่ระบบและใช้งาน (Active)
                </label>
              </div>

              <Input
                label="เปลี่ยนรหัสผ่านใหม่ (เว้นว่างไว้ถ้าไม่เปลี่ยน)"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder="กรอกเฉพาะเมื่อต้องการรีเซ็ต"
              />

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
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
