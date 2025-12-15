import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  useGalleries,
  useCreateGallery,
  useUpdateGallery,
  useDeleteGallery,
} from '../../hooks/useGalleries'
import type { Gallery } from '../../types'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const gallerySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().optional(),
  is_main: z.boolean().optional(),
})

type GalleryFormData = z.infer<typeof gallerySchema>

export default function GalleriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)
  const [deletingGallery, setDeletingGallery] = useState<Gallery | null>(null)

  const { data: galleries, isLoading } = useGalleries()
  const createGallery = useCreateGallery()
  const updateGallery = useUpdateGallery()
  const deleteGallery = useDeleteGallery()

  const form = useForm<GalleryFormData>({
    resolver: zodResolver(gallerySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      is_main: false,
    },
  })

  const openCreateModal = () => {
    form.reset({ name: '', slug: '', description: '', is_main: false })
    setEditingGallery(null)
    setIsModalOpen(true)
  }

  const openEditModal = (gallery: Gallery) => {
    form.reset({
      name: gallery.name,
      slug: gallery.slug,
      description: gallery.description || '',
      is_main: gallery.is_main,
    })
    setEditingGallery(gallery)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingGallery(null)
    form.reset()
  }

  const onSubmit = (data: GalleryFormData) => {
    if (editingGallery) {
      updateGallery.mutate(
        { id: editingGallery.id, data },
        { onSuccess: closeModal }
      )
    } else {
      createGallery.mutate(data, { onSuccess: closeModal })
    }
  }

  const handleDelete = () => {
    if (deletingGallery) {
      deleteGallery.mutate(deletingGallery.id, {
        onSuccess: () => setDeletingGallery(null),
      })
    }
  }

  // Auto-generate slug from name
  const watchName = form.watch('name')
  const generateSlug = () => {
    const slug = watchName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    form.setValue('slug', slug)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-nadart-text-primary">Galleries</h1>
        <Button onClick={openCreateModal}>
          <i className="fas fa-plus mr-2" />
          Create Gallery
        </Button>
      </div>

      {/* Galleries List */}
      {galleries && galleries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery, index) => (
            <motion.div
              key={gallery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="card"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-nadart-text-primary flex items-center gap-2">
                      {gallery.name}
                      {gallery.is_main && (
                        <span className="text-xs bg-nadart-accent-success/20 text-nadart-accent-success px-2 py-0.5 rounded">
                          Main
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-nadart-text-muted">/{gallery.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(gallery)}
                      className="p-2 text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
                      title="Edit"
                    >
                      <i className="fas fa-edit" />
                    </button>
                    {!gallery.is_main && (
                      <button
                        onClick={() => setDeletingGallery(gallery)}
                        className="p-2 text-nadart-text-secondary hover:text-nadart-accent-error transition-colors"
                        title="Delete"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    )}
                  </div>
                </div>

                {gallery.description && (
                  <p className="text-sm text-nadart-text-secondary mb-4 line-clamp-2">
                    {gallery.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-nadart-text-muted">
                    {gallery.painting_count || 0} paintings
                  </span>
                  <a
                    href={gallery.is_main ? '/#gallery' : `/gallery/${gallery.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
                  >
                    View <i className="fas fa-external-link-alt text-xs ml-1" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-nadart-text-secondary">
          <i className="fas fa-folder-open text-4xl mb-4 block opacity-50" />
          <p>No galleries yet. Create your first gallery to get started.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingGallery ? 'Edit Gallery' : 'Create Gallery'}
        size="md"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            placeholder="My Gallery"
            error={form.formState.errors.name?.message}
            {...form.register('name')}
          />

          <div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Input
                  label="Slug"
                  placeholder="my-gallery"
                  error={form.formState.errors.slug?.message}
                  {...form.register('slug')}
                />
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={generateSlug}>
                Generate
              </Button>
            </div>
            <p className="text-xs text-nadart-text-muted mt-1">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          <Textarea
            label="Description"
            placeholder="Describe this gallery..."
            rows={3}
            {...form.register('description')}
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded bg-nadart-accent"
              {...form.register('is_main')}
            />
            <span className="text-nadart-text-primary">Set as main gallery (landing page)</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createGallery.isPending || updateGallery.isPending}
            >
              {editingGallery ? 'Save Changes' : 'Create Gallery'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingGallery}
        onClose={() => setDeletingGallery(null)}
        onConfirm={handleDelete}
        title="Delete Gallery"
        message={`Are you sure you want to delete "${deletingGallery?.name}"? This will also delete all paintings in this gallery. This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteGallery.isPending}
      />
    </div>
  )
}
