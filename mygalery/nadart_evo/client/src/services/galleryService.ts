import api from './api'
import type { Gallery, CreateGalleryInput, UpdateGalleryInput } from '../types'

export const galleryService = {
  async getAll(): Promise<Gallery[]> {
    const response = await api.get<Gallery[]>('/galleries')
    return response.data
  },

  async getBySlug(slug: string): Promise<Gallery> {
    const response = await api.get<Gallery>(`/galleries/${slug}`)
    return response.data
  },

  async getMain(): Promise<Gallery> {
    const response = await api.get<Gallery>('/galleries/main')
    return response.data
  },

  async create(data: CreateGalleryInput): Promise<Gallery> {
    const response = await api.post<Gallery>('/galleries', data)
    return response.data
  },

  async update(id: number, data: UpdateGalleryInput): Promise<Gallery> {
    const response = await api.put<Gallery>(`/galleries/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/galleries/${id}`)
  },

  async reorder(galleryIds: number[]): Promise<void> {
    await api.put('/galleries/reorder', { galleryIds })
  },
}
