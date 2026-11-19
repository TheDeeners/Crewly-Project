// User role enum — must match backend Role enum
export type Role = 'ADMIN' | 'MANAGER' | 'EMPLOYEE'

// Leave request status enum — must match backend LeaveStatus enum
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export interface User {
  id: string
  employeeCode: string
  email: string
  firstName: string
  lastName: string
  role: Role
  managerId: string | null
  isActive: boolean
  createdAt: string
}

export interface AttendanceRecord {
  id: string
  userId: string
  workDate: string
  checkInAt: string
  checkOutAt: string | null
  user?: {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    role: Role
  }
}

export interface LeaveType {
  id: string
  name: string
  defaultQuotaDays: number
  isPaid: boolean
}

export interface LeaveBalance {
  id: string
  userId: string
  leaveTypeId: string
  year: number
  quotaDays: number
  usedDays: number
  leaveType: LeaveType
}

export interface LeaveRequest {
  id: string
  userId: string
  leaveTypeId: string
  approverId: string | null
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  decidedAt: string | null
  createdAt: string
  user?: User
  leaveType?: LeaveType
  approver?: User | null
}

export interface Holiday {
  id: string
  holidayDate: string
  name: string
}
