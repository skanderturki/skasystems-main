import { Router } from 'express'
import { z } from 'zod'
import { galleryService } from '../services/gallery.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

const createGallerySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  is_main: z.boolean().optional(),
})

const updateGallerySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  is_main: z.boolean().optional(),
  display_order: z.number().optional(),
})

const reorderSchema = z.object({
  galleryIds: z.array(z.number()),
})

// Public routes
router.get('/', (_req, res, next) => {
  try {
    const galleries = galleryService.getAll()
    res.json(galleries)
  } catch (error) {
    next(error)
  }
})

router.get('/main', (_req, res, next) => {
  try {
    const gallery = galleryService.getMain()
    res.json(gallery)
  } catch (error) {
    next(error)
  }
})

router.get('/:slug', (req, res, next) => {
  try {
    const gallery = galleryService.getBySlug(req.params.slug)
    res.json(gallery)
  } catch (error) {
    next(error)
  }
})

// Admin routes
router.post('/', authMiddleware, (req, res, next) => {
  try {
    const data = createGallerySchema.parse(req.body)
    const gallery = galleryService.create(data)
    res.status(201).json(gallery)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.put('/reorder', authMiddleware, (req, res, next) => {
  try {
    const data = reorderSchema.parse(req.body)
    const galleries = galleryService.reorder(data.galleryIds)
    res.json(galleries)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.put('/:id', authMiddleware, (req, res, next) => {
  try {
    const data = updateGallerySchema.parse(req.body)
    const gallery = galleryService.update(parseInt(req.params.id), data)
    res.json(gallery)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.delete('/:id', authMiddleware, (req, res, next) => {
  try {
    const result = galleryService.delete(parseInt(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
})

export default router
