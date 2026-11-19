import * as argon2 from 'argon2'

// Hash a plain-text password using Argon2 (secure, modern hashing algorithm)
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain)
}

// Check if a plain-text password matches an Argon2 hash
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain)
}
