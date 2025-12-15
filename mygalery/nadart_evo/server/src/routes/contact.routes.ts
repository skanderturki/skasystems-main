import { Router } from 'express'
import { z } from 'zod'

const router = Router()

const contactSchema = z.object({
  email: z.string().email(),
  msg: z.string().min(1),
})

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.skasystems.com/webhook/contact'
const N8N_AUTH_USER = process.env.N8N_AUTH_USER || 'nadart'
const N8N_AUTH_PASSWORD = process.env.N8N_AUTH_PASSWORD || 'barnouss56'

router.post('/', async (req, res, next) => {
  try {
    const data = contactSchema.parse(req.body)

    // Forward to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${N8N_AUTH_USER}:${N8N_AUTH_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to send message')
    }

    res.json({ message: 'Message sent successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

export default router
