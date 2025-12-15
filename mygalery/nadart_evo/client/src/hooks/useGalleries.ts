import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { galleryService } from '../services/galleryService'
import type { CreateGalleryInput, UpdateGalleryInput } from '../types'

export function useGalleries() {
  return useQuery({
    queryKey: ['galleries'],
    queryFn: galleryService.getAll,
  })
}

export function useGallery(slug: string) {
  return useQuery({
    queryKey: ['gallery', slug],
    queryFn: () => galleryService.getBySlug(slug),
    enabled: !!slug,
  })
}

export function useMainGallery() {
  return useQuery({
    queryKey: ['gallery', 'main'],
    queryFn: galleryService.getMain,
  })
}

export function useCreateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGalleryInput) => galleryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}

export function useUpdateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateGalleryInput }) =>
      galleryService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
      queryClient.invalidateQueries({ queryKey: ['gallery', variables.id] })
    },
  })
}

export function useDeleteGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => galleryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}

export function useReorderGalleries() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (galleryIds: number[]) => galleryService.reorder(galleryIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galleries'] })
    },
  })
}
