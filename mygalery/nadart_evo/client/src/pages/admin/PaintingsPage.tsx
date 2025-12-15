import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useGalleries } from '../../hooks/useGalleries'
import {
  usePaintings,
  useCreatePainting,
  useUpdatePainting,
  useDeletePainting,
  useTogglePaintingVisibility,
} from '../../hooks/usePaintings'
import type { Painting, Gallery } from '../../types'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const paintingSchema = z.object({
  gallery_id: z.coerce.number().min(1, 'Please select a gallery'),
  title: z.string().min(1, 'Title is required'),
  technique: z.string().optional(),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  medium: z.string().optional(),
})

type PaintingFormData = z.infer<typeof paintingSchema>

export default function PaintingsPage() {
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | undefined>()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPainting, setEditingPainting] = useState<Painting | null>(null)
  const [deletingPainting, setDeletingPainting] = useState<Painting | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: galleries } = useGalleries()
  const { data: paintings, isLoading } = usePaintings(selectedGalleryId)
  const createPainting = useCreatePainting()
  const updatePainting = useUpdatePainting()
  const deletePainting = useDeletePainting()
  const toggleVisibility = useTogglePaintingVisibility()

  const form = useForm<PaintingFormData>({
    resolver: zodResolver(paintingSchema),
  })

  const getGalleryById = (id: number): Gallery | undefined =>
    galleries?.find(g => g.id === id)

  const openCreateModal = () => {
    form.reset({
      gallery_id: selectedGalleryId || galleries?.[0]?.id,
      title: '',
      technique: '',
      description: '',
      dimensions: '',
      medium: '',
    })
    setEditingPainting(null)
    setSelectedImage(null)
    setImagePreview(null)
    setIsModalOpen(true)
  }

  const openEditModal = (painting: Painting) => {
    form.reset({
      gallery_id: painting.gallery_id,
      title: painting.title,
      technique: painting.technique || '',
      description: painting.description || '',
      dimensions: painting.dimensions || '',
      medium: painting.medium || '',
    })
    setEditingPainting(painting)
    setSelectedImage(null)
    const gallery = getGalleryById(painting.gallery_id)
    if (gallery) {
      setImagePreview(`/galleries/${gallery.folder_name}/thumbnails/thumb-${painting.image_filename}`)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingPainting(null)
    setSelectedImage(null)
    setImagePreview(null)
    form.reset()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const onSubmit = (data: PaintingFormData) => {
    if (editingPainting) {
      updatePainting.mutate(
        { id: editingPainting.id, data, image: selectedImage || undefined },
        { onSuccess: closeModal }
      )
    } else {
      if (!selectedImage) {
        form.setError('root', { message: 'Please select an image' })
        return
      }
      createPainting.mutate(
        { data, image: selectedImage },
        { onSuccess: closeModal }
      )
    }
  }

  const handleDelete = () => {
    if (deletingPainting) {
      deletePainting.mutate(deletingPainting.id, {
        onSuccess: () => setDeletingPainting(null),
      })
    }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-semibold text-nadart-text-primary">Paintings</h1>
        <div className="flex items-center gap-4">
          {/* Gallery Filter */}
          <select
            value={selectedGalleryId || ''}
            onChange={(e) => setSelectedGalleryId(e.target.value ? Number(e.target.value) : undefined)}
            className="input w-48"
          >
            <option value="">All Galleries</option>
            {galleries?.map((gallery) => (
              <option key={gallery.id} value={gallery.id}>
                {gallery.name}
              </option>
            ))}
          </select>
          <Button onClick={openCreateModal}>
            <i className="fas fa-plus mr-2" />
            Add Painting
          </Button>
        </div>
      </div>

      {/* Paintings Grid */}
      {paintings && paintings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paintings.map((painting, index) => {
            const gallery = getGalleryById(painting.gallery_id)
            return (
              <motion.div
                key={painting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`card overflow-hidden ${!painting.is_visible ? 'opacity-60' : ''}`}
              >
                {/* Image */}
                <div className="aspect-square bg-nadart-bg-dark">
                  {gallery && (
                    <img
                      src={`/galleries/${gallery.folder_name}/thumbnails/thumb-${painting.image_filename}`}
                      alt={painting.title}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium text-nadart-text-primary truncate" title={painting.title}>
                    {painting.title}
                  </h3>
                  <p className="text-xs text-nadart-text-muted mb-3">
                    {gallery?.name}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleVisibility.mutate(painting.id)}
                      className={`p-2 transition-colors ${
                        painting.is_visible
                          ? 'text-nadart-accent-success hover:text-nadart-accent-success/70'
                          : 'text-nadart-text-secondary hover:text-nadart-text-primary'
                      }`}
                      title={painting.is_visible ? 'Hide' : 'Show'}
                    >
                      <i className={`fas ${painting.is_visible ? 'fa-eye' : 'fa-eye-slash'}`} />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(painting)}
                        className="p-2 text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
                        title="Edit"
                      >
                        <i className="fas fa-edit" />
                      </button>
                      <button
                        onClick={() => setDeletingPainting(painting)}
                        className="p-2 text-nadart-text-secondary hover:text-nadart-accent-error transition-colors"
                        title="Delete"
                      >
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-nadart-text-secondary">
          <i className="fas fa-paint-brush text-4xl mb-4 block opacity-50" />
          <p>No paintings yet. Add your first artwork to get started.</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingPainting ? 'Edit Painting' : 'Add Painting'}
        size="lg"
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image Upload */}
            <div className="md:row-span-3">
              <label className="block text-nadart-text-primary text-sm font-medium mb-2">
                Image {!editingPainting && <span className="text-nadart-accent-error">*</span>}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-nadart-accent/20 rounded-lg cursor-pointer hover:bg-nadart-accent/30 transition-colors flex items-center justify-center overflow-hidden"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-nadart-text-secondary">
                    <i className="fas fa-cloud-upload-alt text-3xl mb-2" />
                    <p className="text-sm">Click to upload</p>
                    <p className="text-xs opacity-60">JPG, PNG, WebP (max 10MB)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-nadart-text-primary text-sm font-medium mb-2">
                  Gallery <span className="text-nadart-accent-error">*</span>
                </label>
                <select
                  className="input w-full"
                  {...form.register('gallery_id')}
                >
                  {galleries?.map((gallery) => (
                    <option key={gallery.id} value={gallery.id}>
                      {gallery.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Title"
                placeholder="Artwork title"
                error={form.formState.errors.title?.message}
                {...form.register('title')}
              />

              <Input
                label="Technique"
                placeholder="e.g., Acrylic Textured"
                {...form.register('technique')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Dimensions"
              placeholder="e.g., 100x75cm"
              {...form.register('dimensions')}
            />
            <Input
              label="Medium"
              placeholder="e.g., Acrylic on canvas"
              {...form.register('medium')}
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Describe this artwork..."
            rows={3}
            {...form.register('description')}
          />

          {form.formState.errors.root && (
            <p className="text-sm text-nadart-accent-error">{form.formState.errors.root.message}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createPainting.isPending || updatePainting.isPending}
            >
              {editingPainting ? 'Save Changes' : 'Add Painting'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deletingPainting}
        onClose={() => setDeletingPainting(null)}
        onConfirm={handleDelete}
        title="Delete Painting"
        message={`Are you sure you want to delete "${deletingPainting?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deletePainting.isPending}
      />
    </div>
  )
}
