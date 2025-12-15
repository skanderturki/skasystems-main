import { Request } from 'express'

export interface AuthRequest extends Request {
  user?: {
    id: number
    email: string
  }
}

export interface Gallery {
  id: number
  slug: string
  name: string
  description: string | null
  is_main: number
  folder_name: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Painting {
  id: number
  gallery_id: number
  title: string
  technique: string | null
  description: string | null
  dimensions: string | null
  medium: string | null
  image_filename: string
  thumbnail_filename: string | null
  display_order: number
  is_visible: number
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  password_hash: string
  google_id?: string
  reset_token?: string
  reset_token_expires?: string
  created_at: string
  updated_at: string
}

export interface ResumeContent {
  id: number
  section_key: string
  content: string
  section_order: number
  updated_at: string
}

export interface TimelineEntry {
  id: number
  date_range: string
  title: string
  description: string | null
  items: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface ExpertiseArea {
  id: number
  icon: string
  title: string
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  key: string
  value: string
  updated_at: string
}
