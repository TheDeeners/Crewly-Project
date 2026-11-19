import prisma from '../../lib/prisma'
import { hashPassword } from '../../lib/password'
import { AppError } from '../../utils/AppError'
import { CreateUserInput, UpdateUserInput } from './users.schema'

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมดในระบบ (Admin เท่านั้น)
 */
export async function getAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      employeeCode: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      managerId: true,
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      employeeCode: 'asc',
    },
  })
}

/**
 * สร้างผู้ใช้ใหม่ (Admin เท่านั้น)
 * กฎ: สร้างผู้ใช้ใหม่แล้วให้สร้าง LeaveBalance ของปีปัจจุบันให้อัตโนมัติตาม LeaveType ทุกประเภท
 */
export async function createUser(input: CreateUserInput) {
  // ตรวจสอบว่า email หรือ employeeCode ซ้ำหรือไม่
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existingEmail) {
    throw new AppError('Email is already registered', 409)
  }

  const existingCode = await prisma.user.findUnique({
    where: { employeeCode: input.employeeCode },
  })
  if (existingCode) {
    throw new AppError('Employee code is already registered', 409)
  }

  // แฮชรหัสผ่านด้วย Argon2
  const passwordHash = await hashPassword(input.password)

  const currentYear = new Date().getFullYear()

  // ดำเนินการสร้าง User และ LeaveBalance พร้อมกันใน transaction
  return prisma.$transaction(async (tx) => {
    // 1. สร้างผู้ใช้
    const newUser = await tx.user.create({
      data: {
        employeeCode: input.employeeCode,
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        managerId: input.managerId || null,
      },
      select: {
        id: true,
        employeeCode: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        managerId: true,
        isActive: true,
        createdAt: true,
      },
    })

    // 2. ดึงประเภทการลาทั้งหมดที่มีอยู่ในระบบ
    const leaveTypes = await tx.leaveType.findMany()

    // 3. สร้าง LeaveBalance ของปีปัจจุบันให้ผู้ใช้ใหม่ตาม LeaveType แต่ละประเภท
    for (const lt of leaveTypes) {
      await tx.leaveBalance.create({
        data: {
          userId: newUser.id,
          leaveTypeId: lt.id,
          year: currentYear,
          quotaDays: lt.defaultQuotaDays,
          usedDays: 0,
        },
      })
    }

    return newUser
  })
}

/**
 * แก้ไขข้อมูลผู้ใช้ (Admin เท่านั้น)
 * สามารถเปลี่ยน role, กำหนดหัวหน้า (managerId), เปิด/ปิดการใช้งาน (isActive), แก้ไขชื่อ หรือรีเซ็ตรหัสผ่าน
 */
export async function updateUser(id: string, input: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (!user) {
    throw new AppError('User not found', 404)
  }

  const dataToUpdate: any = {}

  if (input.firstName !== undefined) dataToUpdate.firstName = input.firstName
  if (input.lastName !== undefined) dataToUpdate.lastName = input.lastName
  if (input.role !== undefined) dataToUpdate.role = input.role
  if (input.managerId !== undefined) dataToUpdate.managerId = input.managerId
  if (input.isActive !== undefined) dataToUpdate.isActive = input.isActive

  if (input.password) {
    dataToUpdate.passwordHash = await hashPassword(input.password)
  }

  return prisma.user.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      employeeCode: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      managerId: true,
      isActive: true,
      createdAt: true,
    },
  })
}
