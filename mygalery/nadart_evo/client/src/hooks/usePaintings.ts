import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paintingService } from '../services/paintingService'
import type { CreatePaintingInput, UpdatePaintingInput } from '../types'

export function usePaintings(galleryId?: number) {
  return useQuery({
    queryKey: ['paintings', galleryId],
    queryFn: () => paintingService.getAll(galleryId),
  })
}

export function usePainting(id: number) {
  return useQuery({
    queryKey: ['painting', id],
    queryFn: () => paintingService.getById(id),
    enabled: !!id,
  })
}

export function useCreatePainting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ data, image }: { data: CreatePaintingInput; image: File }) =>
      paintingService.create(data, image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] })
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}

export function useUpdatePainting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data, image }: { id: number; data: UpdatePaintingInput; image?: File }) =>
      paintingService.update(id, data, image),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] })
      queryClient.invalidateQueries({ queryKey: ['painting', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}

export function useDeletePainting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => paintingService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] })
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}

export function useTogglePaintingVisibility() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => paintingService.toggleVisibility(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] })
    },
  })
}

export function useMovePainting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, galleryId }: { id: number; galleryId: number }) =>
      paintingService.move(id, galleryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] })
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}

export function useReorderPaintings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (paintingIds: number[]) => paintingService.reorder(paintingIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paintings'] })
    },
  })
}
