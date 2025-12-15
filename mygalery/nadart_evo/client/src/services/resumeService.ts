import api from './api'
import type { ResumeData, ResumeContent, TimelineEntry, ExpertiseArea } from '../types'

export const resumeService = {
  async getAll(): Promise<ResumeData> {
    const response = await api.get<ResumeData>('/resume')
    return response.data
  },

  async updateContent(key: string, content: string): Promise<ResumeContent> {
    const response = await api.put<ResumeContent>(`/resume/content/${key}`, { content })
    return response.data
  },

  // Timeline
  async getTimeline(): Promise<TimelineEntry[]> {
    const response = await api.get<TimelineEntry[]>('/resume/timeline')
    return response.data
  },

  async createTimelineEntry(data: Omit<TimelineEntry, 'id' | 'created_at' | 'updated_at'>): Promise<TimelineEntry> {
    const response = await api.post<TimelineEntry>('/resume/timeline', data)
    return response.data
  },

  async updateTimelineEntry(id: number, data: Partial<TimelineEntry>): Promise<TimelineEntry> {
    const response = await api.put<TimelineEntry>(`/resume/timeline/${id}`, data)
    return response.data
  },

  async deleteTimelineEntry(id: number): Promise<void> {
    await api.delete(`/resume/timeline/${id}`)
  },

  // Expertise
  async getExpertise(): Promise<ExpertiseArea[]> {
    const response = await api.get<ExpertiseArea[]>('/resume/expertise')
    return response.data
  },

  async createExpertiseArea(data: Omit<ExpertiseArea, 'id' | 'created_at' | 'updated_at'>): Promise<ExpertiseArea> {
    const response = await api.post<ExpertiseArea>('/resume/expertise', data)
    return response.data
  },

  async updateExpertiseArea(id: number, data: Partial<ExpertiseArea>): Promise<ExpertiseArea> {
    const response = await api.put<ExpertiseArea>(`/resume/expertise/${id}`, data)
    return response.data
  },

  async deleteExpertiseArea(id: number): Promise<void> {
    await api.delete(`/resume/expertise/${id}`)
  },
}
