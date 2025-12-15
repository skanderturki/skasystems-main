import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me'
const JWT_EXPIRES_IN = '24h'

export interface JwtPayload {
  id: number
  email: string
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export function generateResetToken(): string {
  return jwt.sign({ type: 'reset' }, JWT_SECRET, { expiresIn: '1h' })
}
