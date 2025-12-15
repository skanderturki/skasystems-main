import api from './api'
import type { ContactFormData } from '../types'

export const contactService = {
  async send(data: ContactFormData): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/contact', data)
    return response.data
  },
}
