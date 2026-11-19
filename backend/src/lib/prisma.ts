import { PrismaClient } from '@prisma/client'

// Use a single PrismaClient instance across the app to avoid connection exhaustion
const prisma = new PrismaClient()

export default prisma
