import { Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt.utils.js'
import type { AuthRequest } from '../types/index.js'

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized: No token provided' })
      return
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    req.user = {
      id: decoded.id,
      email: decoded.email,
    }

    next()
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token' })
  }
}
