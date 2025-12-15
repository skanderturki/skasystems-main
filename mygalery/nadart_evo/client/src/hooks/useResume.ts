import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resumeService } from '../services/resumeService'
import type { TimelineEntry, ExpertiseArea } from '../types'

export function useResume() {
  return useQuery({
    queryKey: ['resume'],
    queryFn: resumeService.getAll,
  })
}

export function useUpdateResumeContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key, content }: { key: string; content: string }) =>
      resumeService.updateContent(key, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] })
    },
  })
}

// Timeline hooks
export function useTimeline() {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: resumeService.getTimeline,
  })
}

export function useCreateTimelineEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<TimelineEntry, 'id' | 'created_at' | 'updated_at'>) =>
      resumeService.createTimelineEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['resume'] })
    },
  })
}

export function useUpdateTimelineEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TimelineEntry> }) =>
      resumeService.updateTimelineEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['resume'] })
    },
  })
}

export function useDeleteTimelineEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => resumeService.deleteTimelineEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
      queryClient.invalidateQueries({ queryKey: ['resume'] })
    },
  })
}

// Expertise hooks
export function useExpertise() {
  return useQuery({
    queryKey: ['expertise'],
    queryFn: resumeService.getExpertise,
  })
}

export function useCreateExpertiseArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Omit<ExpertiseArea, 'id' | 'created_at' | 'updated_at'>) =>
      resumeService.createExpertiseArea(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expertise'] })
      queryClient.invalidateQueries({ queryKey: ['resume'] })
    },
  })
}

export function useUpdateExpertiseArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ExpertiseArea> }) =>
      resumeService.updateExpertiseArea(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expertise'] })
      queryClient.invalidateQueries({ queryKey: ['resume'] })
    },
  })
}

export function useDeleteExpertiseArea() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => resumeService.deleteExpertiseArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expertise'] })
      queryClient.invalidateQueries({ queryKey: ['resume'] })
    },
  })
}
