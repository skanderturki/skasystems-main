import api from './api'
import type { Painting, CreatePaintingInput, UpdatePaintingInput } from '../types'

export const paintingService = {
  async getAll(galleryId?: number): Promise<Painting[]> {
    const params = galleryId ? { gallery_id: galleryId } : {}
    const response = await api.get<Painting[]>('/paintings', { params })
    return response.data
  },

  async getById(id: number): Promise<Painting> {
    const response = await api.get<Painting>(`/paintings/${id}`)
    return response.data
  },

  async create(data: CreatePaintingInput, image: File): Promise<Painting> {
    const formData = new FormData()
    formData.append('image', image)
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value))
      }
    })

    const response = await api.post<Painting>('/paintings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async update(id: number, data: UpdatePaintingInput, image?: File): Promise<Painting> {
    const formData = new FormData()
    if (image) {
      formData.append('image', image)
    }
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value))
      }
    })

    const response = await api.put<Painting>(`/paintings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/paintings/${id}`)
  },

  async toggleVisibility(id: number): Promise<Painting> {
    const response = await api.put<Painting>(`/paintings/${id}/visibility`)
    return response.data
  },

  async move(id: number, galleryId: number): Promise<Painting> {
    const response = await api.put<Painting>(`/paintings/${id}/move`, { gallery_id: galleryId })
    return response.data
  },

  async reorder(paintingIds: number[]): Promise<void> {
    await api.put('/paintings/reorder', { paintingIds })
  },
}
