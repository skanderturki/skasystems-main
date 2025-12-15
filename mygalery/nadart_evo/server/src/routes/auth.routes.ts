import { Router, Response } from 'express'
import { z } from 'zod'
import { OAuth2Client } from 'google-auth-library'
import { authService } from '../services/auth.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import type { AuthRequest } from '../types/index.js'

const router = Router()

// Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const googleLoginSchema = z.object({
  credential: z.string(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
})

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body)
    const result = await authService.login(data.email, data.password)
    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

// Google OAuth Login
router.post('/google', async (req, res, next) => {
  try {
    const data = googleLoginSchema.parse(req.body)

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: data.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email || !payload.sub) {
      res.status(400).json({ message: 'Invalid Google token' })
      return
    }

    // Login or create user via Google
    const result = await authService.googleLogin(payload.sub, payload.email)
    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      res.status(403).json({ message: error.message })
      return
    }
    next(error)
  }
})

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const user = await authService.getUserById(req.user!.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})

// Logout (optional - just for client-side token removal confirmation)
router.post('/logout', authMiddleware, (_req, res) => {
  res.json({ message: 'Logged out successfully' })
})

// Change password
router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response, next) => {
  try {
    const data = changePasswordSchema.parse(req.body)
    const result = await authService.changePassword(req.user!.id, data.currentPassword, data.newPassword)
    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const data = forgotPasswordSchema.parse(req.body)
    const result = await authService.requestPasswordReset(data.email)

    // TODO: Send email via n8n webhook instead of returning token
    // For now, we'll just return the success message
    res.json({ message: result.message })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const data = resetPasswordSchema.parse(req.body)
    const result = await authService.resetPassword(data.token, data.password)
    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

export default router
