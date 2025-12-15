import db from '../db/database.js'
import { saveImage, deleteImage, moveImage } from '../utils/file.utils.js'
import { galleryService } from './gallery.service.js'
import type { Painting } from '../types/index.js'

export const paintingService = {
  getAll(galleryId?: number) {
    let query = 'SELECT * FROM paintings'
    const params: number[] = []

    if (galleryId) {
      query += ' WHERE gallery_id = ?'
      params.push(galleryId)
    }

    query += ' ORDER BY display_order ASC'

    const paintings = db.prepare(query).all(...params) as Painting[]

    return paintings.map(p => ({
      ...p,
      is_visible: Boolean(p.is_visible),
    }))
  },

  getById(id: number) {
    const painting = db
      .prepare('SELECT * FROM paintings WHERE id = ?')
      .get(id) as Painting | undefined

    if (!painting) {
      throw new Error('Painting not found')
    }

    return {
      ...painting,
      is_visible: Boolean(painting.is_visible),
    }
  },

  async create(
    data: {
      gallery_id: number
      title: string
      technique?: string
      description?: string
      dimensions?: string
      medium?: string
    },
    image: Express.Multer.File
  ) {
    const gallery = galleryService.getById(data.gallery_id)

    // Save the image
    const { original, thumbnail } = await saveImage(image, gallery.folder_name)

    // Get the next display order
    const maxOrder = db
      .prepare('SELECT MAX(display_order) as max FROM paintings WHERE gallery_id = ?')
      .get(data.gallery_id) as { max: number | null }
    const displayOrder = (maxOrder.max || 0) + 1

    const result = db
      .prepare(`
        INSERT INTO paintings (gallery_id, title, technique, description, dimensions, medium, image_filename, thumbnail_filename, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        data.gallery_id,
        data.title,
        data.technique || null,
        data.description || null,
        data.dimensions || null,
        data.medium || null,
        original,
        thumbnail,
        displayOrder
      )

    return this.getById(result.lastInsertRowid as number)
  },

  async update(
    id: number,
    data: {
      gallery_id?: number
      title?: string
      technique?: string
      description?: string
      dimensions?: string
      medium?: string
      display_order?: number
      is_visible?: boolean
    },
    image?: Express.Multer.File
  ) {
    const painting = this.getById(id)
    const gallery = galleryService.getById(painting.gallery_id)

    let imageFilename = painting.image_filename
    let thumbnailFilename = painting.thumbnail_filename

    // If a new image is provided, save it and delete the old one
    if (image) {
      const { original, thumbnail } = await saveImage(image, gallery.folder_name)
      deleteImage(gallery.folder_name, painting.image_filename)
      imageFilename = original
      thumbnailFilename = thumbnail
    }

    // If moving to a different gallery
    if (data.gallery_id && data.gallery_id !== painting.gallery_id) {
      const newGallery = galleryService.getById(data.gallery_id)
      moveImage(imageFilename, gallery.folder_name, newGallery.folder_name)
    }

    const updates: string[] = []
    const values: (string | number | null)[] = []

    if (data.gallery_id !== undefined) {
      updates.push('gallery_id = ?')
      values.push(data.gallery_id)
    }
    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.technique !== undefined) {
      updates.push('technique = ?')
      values.push(data.technique)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.dimensions !== undefined) {
      updates.push('dimensions = ?')
      values.push(data.dimensions)
    }
    if (data.medium !== undefined) {
      updates.push('medium = ?')
      values.push(data.medium)
    }
    if (data.display_order !== undefined) {
      updates.push('display_order = ?')
      values.push(data.display_order)
    }
    if (data.is_visible !== undefined) {
      updates.push('is_visible = ?')
      values.push(data.is_visible ? 1 : 0)
    }
    if (image) {
      updates.push('image_filename = ?')
      values.push(imageFilename)
      updates.push('thumbnail_filename = ?')
      values.push(thumbnailFilename)
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      db.prepare(`UPDATE paintings SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    }

    return this.getById(id)
  },

  delete(id: number) {
    const painting = this.getById(id)
    const gallery = galleryService.getById(painting.gallery_id)

    // Delete the image files
    deleteImage(gallery.folder_name, painting.image_filename)

    // Delete from database
    db.prepare('DELETE FROM paintings WHERE id = ?').run(id)

    return { message: 'Painting deleted successfully' }
  },

  toggleVisibility(id: number) {
    const painting = this.getById(id)

    db.prepare('UPDATE paintings SET is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(painting.is_visible ? 0 : 1, id)

    return this.getById(id)
  },

  move(id: number, galleryId: number) {
    const painting = this.getById(id)
    const fromGallery = galleryService.getById(painting.gallery_id)
    const toGallery = galleryService.getById(galleryId)

    // Move the image files
    moveImage(painting.image_filename, fromGallery.folder_name, toGallery.folder_name)

    // Update the database
    db.prepare('UPDATE paintings SET gallery_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(galleryId, id)

    return this.getById(id)
  },

  reorder(paintingIds: number[]) {
    const stmt = db.prepare('UPDATE paintings SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')

    const transaction = db.transaction(() => {
      paintingIds.forEach((id, index) => {
        stmt.run(index, id)
      })
    })

    transaction()

    return { message: 'Paintings reordered successfully' }
  },
}
