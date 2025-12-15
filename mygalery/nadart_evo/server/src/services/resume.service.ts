import db from '../db/database.js'
import type { ResumeContent, TimelineEntry, ExpertiseArea } from '../types/index.js'

export const resumeService = {
  getAll() {
    const contentRows = db
      .prepare('SELECT * FROM resume_content ORDER BY section_order ASC')
      .all() as ResumeContent[]

    const timeline = db
      .prepare('SELECT * FROM timeline_entries ORDER BY display_order ASC')
      .all() as TimelineEntry[]

    const expertise = db
      .prepare('SELECT * FROM expertise_areas ORDER BY display_order ASC')
      .all() as ExpertiseArea[]

    // Convert content array to object
    const content: Record<string, string> = {}
    contentRows.forEach(row => {
      content[row.section_key] = row.content
    })

    // Parse timeline items JSON
    const parsedTimeline = timeline.map(t => ({
      ...t,
      items: t.items ? JSON.parse(t.items) : null,
    }))

    return {
      content,
      timeline: parsedTimeline,
      expertise,
    }
  },

  // Content methods
  getContent(key: string) {
    const content = db
      .prepare('SELECT * FROM resume_content WHERE section_key = ?')
      .get(key) as ResumeContent | undefined

    return content
  },

  updateContent(key: string, content: string) {
    const existing = this.getContent(key)

    if (existing) {
      db.prepare('UPDATE resume_content SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE section_key = ?')
        .run(content, key)
    } else {
      const maxOrder = db
        .prepare('SELECT MAX(section_order) as max FROM resume_content')
        .get() as { max: number | null }

      db.prepare('INSERT INTO resume_content (section_key, content, section_order) VALUES (?, ?, ?)')
        .run(key, content, (maxOrder.max || 0) + 1)
    }

    return this.getContent(key)
  },

  // Timeline methods
  getTimeline() {
    const timeline = db
      .prepare('SELECT * FROM timeline_entries ORDER BY display_order ASC')
      .all() as TimelineEntry[]

    return timeline.map(t => ({
      ...t,
      items: t.items ? JSON.parse(t.items) : null,
    }))
  },

  getTimelineEntry(id: number) {
    const entry = db
      .prepare('SELECT * FROM timeline_entries WHERE id = ?')
      .get(id) as TimelineEntry | undefined

    if (!entry) {
      throw new Error('Timeline entry not found')
    }

    return {
      ...entry,
      items: entry.items ? JSON.parse(entry.items) : null,
    }
  },

  createTimelineEntry(data: { date_range: string; title: string; description?: string; items?: string[] }) {
    const maxOrder = db
      .prepare('SELECT MAX(display_order) as max FROM timeline_entries')
      .get() as { max: number | null }

    const result = db
      .prepare(`
        INSERT INTO timeline_entries (date_range, title, description, items, display_order)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(
        data.date_range,
        data.title,
        data.description || null,
        data.items ? JSON.stringify(data.items) : null,
        (maxOrder.max || 0) + 1
      )

    return this.getTimelineEntry(result.lastInsertRowid as number)
  },

  updateTimelineEntry(id: number, data: { date_range?: string; title?: string; description?: string; items?: string[]; display_order?: number }) {
    this.getTimelineEntry(id) // Throws if not found

    const updates: string[] = []
    const values: (string | number | null)[] = []

    if (data.date_range !== undefined) {
      updates.push('date_range = ?')
      values.push(data.date_range)
    }
    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.items !== undefined) {
      updates.push('items = ?')
      values.push(JSON.stringify(data.items))
    }
    if (data.display_order !== undefined) {
      updates.push('display_order = ?')
      values.push(data.display_order)
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      db.prepare(`UPDATE timeline_entries SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    }

    return this.getTimelineEntry(id)
  },

  deleteTimelineEntry(id: number) {
    this.getTimelineEntry(id) // Throws if not found
    db.prepare('DELETE FROM timeline_entries WHERE id = ?').run(id)
    return { message: 'Timeline entry deleted successfully' }
  },

  // Expertise methods
  getExpertise() {
    return db
      .prepare('SELECT * FROM expertise_areas ORDER BY display_order ASC')
      .all() as ExpertiseArea[]
  },

  getExpertiseArea(id: number) {
    const area = db
      .prepare('SELECT * FROM expertise_areas WHERE id = ?')
      .get(id) as ExpertiseArea | undefined

    if (!area) {
      throw new Error('Expertise area not found')
    }

    return area
  },

  createExpertiseArea(data: { icon: string; title: string; description?: string }) {
    const maxOrder = db
      .prepare('SELECT MAX(display_order) as max FROM expertise_areas')
      .get() as { max: number | null }

    const result = db
      .prepare(`
        INSERT INTO expertise_areas (icon, title, description, display_order)
        VALUES (?, ?, ?, ?)
      `)
      .run(
        data.icon,
        data.title,
        data.description || null,
        (maxOrder.max || 0) + 1
      )

    return this.getExpertiseArea(result.lastInsertRowid as number)
  },

  updateExpertiseArea(id: number, data: { icon?: string; title?: string; description?: string; display_order?: number }) {
    this.getExpertiseArea(id) // Throws if not found

    const updates: string[] = []
    const values: (string | number | null)[] = []

    if (data.icon !== undefined) {
      updates.push('icon = ?')
      values.push(data.icon)
    }
    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }
    if (data.display_order !== undefined) {
      updates.push('display_order = ?')
      values.push(data.display_order)
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP')
      values.push(id)

      db.prepare(`UPDATE expertise_areas SET ${updates.join(', ')} WHERE id = ?`).run(...values)
    }

    return this.getExpertiseArea(id)
  },

  deleteExpertiseArea(id: number) {
    this.getExpertiseArea(id) // Throws if not found
    db.prepare('DELETE FROM expertise_areas WHERE id = ?').run(id)
    return { message: 'Expertise area deleted successfully' }
  },
}
