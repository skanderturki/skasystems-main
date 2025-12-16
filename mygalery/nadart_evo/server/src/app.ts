import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.routes.js'
import galleriesRoutes from './routes/galleries.routes.js'
import paintingsRoutes from './routes/paintings.routes.js'
import resumeRoutes from './routes/resume.routes.js'
import contactRoutes from './routes/contact.routes.js'
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Trust proxy (behind nginx reverse proxy)
app.set('trust proxy', 1)

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://nadart.skasystems.com', 'https://nadart.gallery', 'https://evo.nadart.mygalery.net']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { message: 'Too many attempts. Please try again later.' },
})

// Static file serving for gallery images
const resourcesPath = path.join(__dirname, '../../resources/galleries')
app.use('/galleries', express.static(resourcesPath))

// API routes
app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/galleries', galleriesRoutes)
app.use('/api/paintings', paintingsRoutes)
app.use('/api/resume', resumeRoutes)
app.use('/api/contact', contactRoutes)

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../../client/dist')
  app.use(express.static(clientPath))

  // Handle React routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/galleries')) {
      res.sendFile(path.join(clientPath, 'index.html'))
    }
  })
}

// Error handling
app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
