import express from 'express'
import cors from 'cors'
import path from 'path'
import yaml from 'yamljs'
import swaggerUi from 'swagger-ui-express'
import { errorHandler } from './middlewares/errorHandler'
import authRoutes from './modules/auth/auth.routes'
import attendanceRoutes from './modules/attendance/attendance.routes'
import leaveTypesRoutes from './modules/leave-types/leave-types.routes'
import holidaysRoutes from './modules/holidays/holidays.routes'
import leaveRequestsRoutes from './modules/leave-requests/leave-requests.routes'
import leaveBalancesRoutes from './modules/leave-requests/leave-balances.routes'
import usersRoutes from './modules/users/users.routes'

export function createApp() {
  const app = express()

  // Parse JSON request bodies
  app.use(express.json())

  // Allow cross-origin requests from the frontend dev server
  app.use(cors())

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // โหลดเอกสาร OpenAPI สำหรับ Swagger
  const swaggerDocument = yaml.load(path.join(__dirname, 'openapi.yaml'))

  // ให้บริการ Swagger UI ที่ /api-docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  // ให้บริการ Raw OpenAPI JSON ที่ /api-docs.json เพื่อให้ Import เข้า Postman ได้ทันที
  app.get('/api-docs.json', (req, res) => {
    res.json(swaggerDocument)
  })

  // API routes — all prefixed with /api
  app.use('/api/auth', authRoutes)
  app.use('/api/users', usersRoutes)
  app.use('/api/attendance', attendanceRoutes)
  app.use('/api/leave-types', leaveTypesRoutes)
  app.use('/api/holidays', holidaysRoutes)
  app.use('/api/leave-requests', leaveRequestsRoutes)
  app.use('/api/leave-balances', leaveBalancesRoutes)

  // Global error handler — must come after all routes
  app.use(errorHandler)

  return app
}
