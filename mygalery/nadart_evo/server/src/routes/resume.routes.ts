import { Router } from 'express'
import { z } from 'zod'
import { resumeService } from '../services/resume.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

const updateContentSchema = z.object({
  content: z.string(),
})

const createTimelineSchema = z.object({
  date_range: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  items: z.array(z.string()).optional(),
})

const updateTimelineSchema = z.object({
  date_range: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  items: z.array(z.string()).optional(),
  display_order: z.number().optional(),
})

const createExpertiseSchema = z.object({
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
})

const updateExpertiseSchema = z.object({
  icon: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  display_order: z.number().optional(),
})

// Public routes
router.get('/', (_req, res, next) => {
  try {
    const resume = resumeService.getAll()
    res.json(resume)
  } catch (error) {
    next(error)
  }
})

router.get('/timeline', (_req, res, next) => {
  try {
    const timeline = resumeService.getTimeline()
    res.json(timeline)
  } catch (error) {
    next(error)
  }
})

router.get('/expertise', (_req, res, next) => {
  try {
    const expertise = resumeService.getExpertise()
    res.json(expertise)
  } catch (error) {
    next(error)
  }
})

// Admin routes - Content
router.put('/content/:key', authMiddleware, (req, res, next) => {
  try {
    const data = updateContentSchema.parse(req.body)
    const content = resumeService.updateContent(req.params.key, data.content)
    res.json(content)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

// Admin routes - Timeline
router.post('/timeline', authMiddleware, (req, res, next) => {
  try {
    const data = createTimelineSchema.parse(req.body)
    const entry = resumeService.createTimelineEntry(data)
    res.status(201).json(entry)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.put('/timeline/:id', authMiddleware, (req, res, next) => {
  try {
    const data = updateTimelineSchema.parse(req.body)
    const entry = resumeService.updateTimelineEntry(parseInt(req.params.id), data)
    res.json(entry)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.delete('/timeline/:id', authMiddleware, (req, res, next) => {
  try {
    const result = resumeService.deleteTimelineEntry(parseInt(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
})

// Admin routes - Expertise
router.post('/expertise', authMiddleware, (req, res, next) => {
  try {
    const data = createExpertiseSchema.parse(req.body)
    const area = resumeService.createExpertiseArea(data)
    res.status(201).json(area)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.put('/expertise/:id', authMiddleware, (req, res, next) => {
  try {
    const data = updateExpertiseSchema.parse(req.body)
    const area = resumeService.updateExpertiseArea(parseInt(req.params.id), data)
    res.json(area)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.delete('/expertise/:id', authMiddleware, (req, res, next) => {
  try {
    const result = resumeService.deleteExpertiseArea(parseInt(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
})

export default router
