import bcrypt from 'bcryptjs'
import db from '../db/database.js'
import { generateToken, generateResetToken } from '../utils/jwt.utils.js'
import type { User } from '../types/index.js'

const SALT_ROUNDS = 12
const ALLOWED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'nadart.galery@gmail.com'

export const authService = {
  // Google OAuth login
  async googleLogin(googleId: string, email: string) {
    // Only allow the specific admin email
    if (email.toLowerCase() !== ALLOWED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('Unauthorized: This email is not allowed to access the admin panel')
    }

    // Check if user exists
    let user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined

    if (!user) {
      // Create user with Google ID (no password needed)
      const result = db
        .prepare('INSERT INTO users (email, password_hash, google_id) VALUES (?, ?, ?)')
        .run(email, '', googleId)

      user = {
        id: result.lastInsertRowid as number,
        email,
        password_hash: '',
        google_id: googleId,
      } as User
    } else if (!user.google_id) {
      // Link Google ID to existing user
      db.prepare('UPDATE users SET google_id = ? WHERE id = ?')
        .run(googleId, user.id)
    }

    const token = generateToken({ id: user.id, email: user.email })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    }
  },

  async login(email: string, password: string) {
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined

    if (!user) {
      throw new Error('Invalid email or password')
    }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    const token = generateToken({ id: user.id, email: user.email })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    }
  },

  async getUserById(id: number) {
    const user = db
      .prepare('SELECT id, email, created_at, updated_at FROM users WHERE id = ?')
      .get(id) as Omit<User, 'password_hash'> | undefined

    return user
  },

  async createUser(email: string, password: string) {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

    const result = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run(email, passwordHash)

    return {
      id: result.lastInsertRowid as number,
      email,
    }
  },

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId) as User | undefined

    if (!user) {
      throw new Error('User not found')
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)

    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPasswordHash, userId)

    return { message: 'Password changed successfully' }
  },

  async requestPasswordReset(email: string) {
    const user = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as User | undefined

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If the email exists, a reset link will be sent' }
    }

    const resetToken = generateResetToken()
    const expires = new Date(Date.now() + 3600000).toISOString() // 1 hour

    db.prepare('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?')
      .run(resetToken, expires, user.id)

    // Return the token for now - in production, this would be sent via email
    return {
      message: 'If the email exists, a reset link will be sent',
      resetToken, // This should be sent via n8n webhook instead
    }
  },

  async resetPassword(resetToken: string, newPassword: string) {
    const user = db
      .prepare('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > datetime("now")')
      .get(resetToken) as User | undefined

    if (!user) {
      throw new Error('Invalid or expired reset token')
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS)

    db.prepare(`
      UPDATE users
      SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newPasswordHash, user.id)

    return { message: 'Password reset successfully' }
  },
}
