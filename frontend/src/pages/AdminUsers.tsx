import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { User, Role } from '../types'
import { Table } from '../components/Table'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

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

  // State สำหรับ Modal เพิ่มผู้ใช้ใหม่
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

  // State สำหรับ Modal แก้ไขผู้ใช้
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

  // ตัวเลือก Manager สำหรับ dropdown (คนที่เป็น MANAGER หรือ ADMIN)
  const managerOptions = users.filter((u) => u.role === 'MANAGER' || u.role === 'ADMIN')

  const columns = [
    {
      header: 'รหัสพนักงาน',
      render: (u: ExtendedUser) => <span className="font-mono font-semibold">{u.employeeCode}</span>,
    },
    {
      header: 'ชื่อ-นามสกุล',
      render: (u: ExtendedUser) => (
        <div>
          <div className="font-semibold text-gray-800">{u.firstName} {u.lastName}</div>
          <div className="text-xs text-gray-500">{u.email}</div>
        </div>
      ),
    },
    {
      header: 'บทบาท',
      render: (u: ExtendedUser) => {
        const badgeColors = {
          ADMIN: 'bg-purple-100 text-purple-700',
          MANAGER: 'bg-blue-100 text-blue-700',
          EMPLOYEE: 'bg-gray-100 text-gray-700',
        }
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColors[u.role]}`}>
            {u.role}
          </span>
        )
      },
    },
    {
      header: 'หัวหน้างาน',
      render: (u: ExtendedUser) => (
        u.manager ? (
          <span className="text-xs font-medium text-gray-700">
            {u.manager.firstName} {u.manager.lastName}
          </span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )
      ),
    },
    {
      header: 'สถานะ',
      render: (u: ExtendedUser) => (
        u.isActive ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">
            ใช้งานปกติ
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
            ระงับใช้งาน
          </span>
        )
      ),
    },
    {
      header: 'จัดการ',
      render: (u: ExtendedUser) => (
        <Button
          variant="secondary"
          onClick={() => openEditModal(u)}
          className="text-xs py-1 px-3"
        >
          แก้ไข
        </Button>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการผู้ใช้ในระบบ</h1>
          <p className="text-sm text-gray-500 mt-1">เพิ่ม แก้ไขข้อมูล กำหนดหัวหน้างาน และบทบาทผู้ใช้</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + เพิ่มผู้ใช้ใหม่
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800">เพิ่มผู้ใช้ใหม่</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-3">
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
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">บทบาท (Role)</label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as Role })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="EMPLOYEE">EMPLOYEE (พนักงานทั่วไป)</option>
                  <option value="MANAGER">MANAGER (หัวหน้างาน)</option>
                  <option value="ADMIN">ADMIN (ฝ่ายบุคคล / ผู้ดูแลระบบ)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">หัวหน้างาน (Manager)</label>
                <select
                  value={createForm.managerId}
                  onChange={(e) => setCreateForm({ ...createForm, managerId: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- ไม่มีหัวหน้างานตรง --</option>
                  {managerOptions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.employeeCode} - {m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowCreateModal(false)}>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800">
              แก้ไขข้อมูล: {editingUser.employeeCode}
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
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
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">บทบาท (Role)</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as Role })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">หัวหน้างาน (Manager)</label>
                <select
                  value={editForm.managerId}
                  onChange={(e) => setEditForm({ ...editForm, managerId: e.target.value })}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- ไม่มีหัวหน้างานตรง --</option>
                  {managerOptions
                    .filter((m) => m.id !== editingUser.id) // ห้ามเลือกตัวเองเป็นหัวหน้า
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
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <label htmlFor="isActiveCheck" className="text-sm font-medium text-gray-700">
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

              <div className="pt-3 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setEditingUser(null)}>
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
