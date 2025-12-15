import { Router } from 'express'
import { z } from 'zod'
import { paintingService } from '../services/painting.service.js'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { upload } from '../middleware/upload.middleware.js'

const router = Router()

const createPaintingSchema = z.object({
  gallery_id: z.coerce.number(),
  title: z.string().min(1),
  technique: z.string().optional(),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  medium: z.string().optional(),
})

const updatePaintingSchema = z.object({
  gallery_id: z.coerce.number().optional(),
  title: z.string().min(1).optional(),
  technique: z.string().optional(),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  medium: z.string().optional(),
  display_order: z.coerce.number().optional(),
  is_visible: z.coerce.boolean().optional(),
})

const reorderSchema = z.object({
  paintingIds: z.array(z.number()),
})

const moveSchema = z.object({
  gallery_id: z.number(),
})

// Public routes
router.get('/', (req, res, next) => {
  try {
    const galleryId = req.query.gallery_id ? parseInt(req.query.gallery_id as string) : undefined
    const paintings = paintingService.getAll(galleryId)
    res.json(paintings)
  } catch (error) {
    next(error)
  }
})

router.get('/:id', (req, res, next) => {
  try {
    const painting = paintingService.getById(parseInt(req.params.id))
    res.json(painting)
  } catch (error) {
    next(error)
  }
})

// Admin routes
router.post('/', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Image is required' })
      return
    }

    const data = createPaintingSchema.parse(req.body)
    const painting = await paintingService.create(data, req.file)
    res.status(201).json(painting)
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
    const result = paintingService.reorder(data.paintingIds)
    res.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.put('/:id', authMiddleware, upload.single('image'), async (req, res, next) => {
  try {
    const data = updatePaintingSchema.parse(req.body)
    const painting = await paintingService.update(parseInt(req.params.id), data, req.file)
    res.json(painting)
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: 'Validation error', errors: error.errors })
      return
    }
    next(error)
  }
})

router.put('/:id/visibility', authMiddleware, (req, res, next) => {
  try {
    const painting = paintingService.toggleVisibility(parseInt(req.params.id))
    res.json(painting)
  } catch (error) {
    next(error)
  }
})

router.put('/:id/move', authMiddleware, (req, res, next) => {
  try {
    const data = moveSchema.parse(req.body)
    const painting = paintingService.move(parseInt(req.params.id), data.gallery_id)
    res.json(painting)
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
    const result = paintingService.delete(parseInt(req.params.id))
    res.json(result)
  } catch (error) {
    next(error)
  }
})

export default router
