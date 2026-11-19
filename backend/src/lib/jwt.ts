import jwt from 'jsonwebtoken'
import { env } from '../config/env'

// The data stored inside each JWT token
interface TokenPayload {
  userId: string
  role: string
}

// Create a JWT that expires in 8 hours
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '8h' })
}

// Verify and decode a JWT, returns null if invalid or expired
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}
