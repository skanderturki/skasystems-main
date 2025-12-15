// Gallery types
export interface Gallery {
  id: number
  slug: string
  name: string
  description: string | null
  is_main: boolean
  folder_name: string
  display_order: number
  created_at: string
  updated_at: string
  paintings?: Painting[]
  painting_count?: number
}

export interface CreateGalleryInput {
  name: string
  slug: string
  description?: string
  is_main?: boolean
}

export interface UpdateGalleryInput {
  name?: string
  slug?: string
  description?: string
  is_main?: boolean
  display_order?: number
}

// Painting types
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
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface CreatePaintingInput {
  gallery_id: number
  title: string
  technique?: string
  description?: string
  dimensions?: string
  medium?: string
}

export interface UpdatePaintingInput {
  gallery_id?: number
  title?: string
  technique?: string
  description?: string
  dimensions?: string
  medium?: string
  display_order?: number
  is_visible?: boolean
}

// Resume types
export interface ResumeContent {
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
  items: string[] | null
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

export interface ResumeData {
  content: Record<string, string>
  timeline: TimelineEntry[]
  expertise: ExpertiseArea[]
}

// Auth types
export interface User {
  id: number
  username: string
  email: string
}

export interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

// Contact form
export interface ContactFormData {
  email: string
  msg: string
}

// Site settings
export interface SiteSettings {
  site_title: string
  hero_title: string
  hero_subtitle: string
  about_text: string
  contact_email: string
  instagram_url: string
  whatsapp_number: string
}
