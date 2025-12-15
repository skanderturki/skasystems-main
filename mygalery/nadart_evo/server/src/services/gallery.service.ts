import db from '../db/database.js'
import { ensureGalleryFolders, deleteGalleryFolder } from '../utils/file.utils.js'
import type { Gallery, Painting } from '../types/index.js'

function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export const galleryService = {
  getAll() {
    const galleries = db
      .prepare(`
        SELECT g.*,
          (SELECT COUNT(*) FROM paintings p WHERE p.gallery_id = g.id AND p.is_visible = 1) as painting_count
        FROM galleries g
        ORDER BY g.display_order ASC
      `)
      .all() as (Gallery & { painting_count: number })[]

    return galleries.map(g => ({
      ...g,
      is_main: Boolean(g.is_main),
    }))
  },

  getBySlug(slug: string) {
    const gallery = db
      .prepare('SELECT * FROM galleries WHERE slug = ?')
      .get(slug) as Gallery | undefined

    if (!gallery) {
      throw new Error('Gallery not found')
    }

    const paintings = db
      .prepare('SELECT * FROM paintings WHERE gallery_id = ? AND is_visible = 1 ORDER BY display_order ASC')
      .all(gallery.id) as Painting[]

    return {
      ...gallery,
      is_main: Boolean(gallery.is_main),
      paintings: paintings.map(p => ({
        ...p,
        is_visible: Boolean(p.is_visible),
      })),
    }
  },

  getMain() {
    const gallery = db
      .prepare('SELECT * FROM galleries WHERE is_main = 1')
      .get() as Gallery | undefined

    if (!gallery) {
      throw new Error('Main gallery not found')
    }

    const paintings = db
      .prepare('SELECT * FROM paintings WHERE gallery_id = ? AND is_visible = 1 ORDER BY display_order ASC')
      .all(gallery.id) as Painting[]

    return {
      ...gallery,
      is_main: true,
      paintings: paintings.map(p => ({
        ...p,
        is_visible: Boolean(p.is_visible),
      })),
    }
  },

  create(data: { name: string; slug: string; description?: string; is_main?: boolean }) {
    const slug = sanitizeSlug(data.slug)
    const folderName = slug

    // If this is set as main, unset any existing main gallery
    if (data.is_main) {
      db.prepare('UPDATE galleries SET is_main = 0 WHERE is_main = 1').run()
    }

    // Get the next display order
    const maxOrder = db
      .prepare('SELECT MAX(display_order) as max FROM galleries')
      .get() as { max: number | null }
    const displayOrder = (maxOrder.max || 0) + 1

    const result = db
      .prepare(`
        INSERT INTO galleries (slug, name, description, is_main, folder_name, display_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .run(slug, data.name, data.description || null, data.is_main ? 1 : 0, folderName, displayOrder)

    // Create the folder structure
    ensureGalleryFolders(folderName)

    return this.getById(result.lastInsertRowid as number)
  },

  getById(id: number) {
    const gallery = db
      .prepare('SELECT * FROM galleries WHERE id = ?')
      .get(id) as Gallery | undefined

    if (!gallery) {
      throw new Error('Gallery not found')
    }

    return {
      ...gallery,
      is_main: Boolean(gallery.is_main),
    }
  },

  update(id: number, data: { name?: string; slug?: string; description?: string; is_main?: boolean; display_order?: number }) {
    const gallery = this.getById(id)

    // If this is set as main, unset any existing main gallery
    if (data.is_main) {
      db.prepare('UPDATE galleries SET is_main = 0 WHERE is_main = 1 AND id != ?').run(id)
    }

    const updates: string[] = []
    const values: (string | number | null)[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.slug !== undefined) {
      updates.push('slug = ?')
      values.push(sanitizeSlug(data.slug))
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.is_main !== undefined) {
      updates.push('is_main = ?')
      values.push(data.is_main ? 1 : 0)
    }
    if (data.display_order !== undefined) {
      updates.push('display_order = ?')
      values.push(data.display_order)
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      db.prepare(`UPDATE galleries SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    }

    return this.getById(id)
  },

  delete(id: number) {
    const gallery = this.getById(id)

    if (gallery.is_main) {
      throw new Error('Cannot delete the main gallery')
    }

    // Delete the gallery (paintings will be deleted via CASCADE)
    db.prepare('DELETE FROM galleries WHERE id = ?').run(id)

    // Delete the folder
    deleteGalleryFolder(gallery.folder_name)

    return { message: 'Gallery deleted successfully' }
  },

  reorder(galleryIds: number[]) {
    const stmt = db.prepare('UPDATE galleries SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')

    const transaction = db.transaction(() => {
      galleryIds.forEach((id, index) => {
        stmt.run(index, id)
      })
    })

    transaction()

    return this.getAll()
  },
}
