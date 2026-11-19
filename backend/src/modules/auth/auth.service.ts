import prisma from '../../lib/prisma'
import { verifyPassword } from '../../lib/password'
import { signToken } from '../../lib/jwt'
import { AppError } from '../../utils/AppError'
import { LoginInput } from './auth.schema'

// Find user by email, verify password, return JWT token
export async function login(input: LoginInput) {
  // Look up the user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  // ถ้าไม่พบ user หรือ user ถูก deactivate ให้ปฏิเสธการเข้าสู่ระบบ
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401)
  }

  // ตรวจสอบรหัสผ่านด้วย Argon2
  const isPasswordValid = await verifyPassword(user.passwordHash, input.password)
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401)
  }

  // สร้าง JWT token ที่มีอายุ 8 ชั่วโมง
  const token = signToken({ userId: user.id, role: user.role })

  return {
    token,
    user: {
      id: user.id,
      employeeCode: user.employeeCode,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      managerId: user.managerId,
      isActive: user.isActive,
    },
  }
}

// Get user profile by userId (used for GET /auth/me)
export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    throw new AppError('User not found', 404)
  }

  return user
}
