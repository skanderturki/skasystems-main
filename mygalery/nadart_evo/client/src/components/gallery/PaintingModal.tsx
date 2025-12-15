import Modal from '../ui/Modal'
import type { Painting } from '../../types'

interface PaintingModalProps {
  painting: Painting | null
  galleryFolder: string
  onClose: () => void
}

export default function PaintingModal({ painting, galleryFolder, onClose }: PaintingModalProps) {
  if (!painting) return null

  const imageUrl = `/galleries/${galleryFolder}/originals/${painting.image_filename}`

  return (
    <Modal isOpen={!!painting} onClose={onClose} size="full">
      <div className="flex flex-col lg:flex-row gap-6 max-h-[85vh]">
        {/* Image */}
        <div className="flex-1 flex items-center justify-center bg-nadart-bg-dark rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={painting.title}
            className="max-w-full max-h-[70vh] object-contain"
          />
        </div>

        {/* Info */}
        <div className="lg:w-80 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-nadart-text-primary mb-2">
            "{painting.title}"
          </h2>

          {painting.technique && (
            <p className="text-nadart-text-secondary mb-4">
              {painting.technique}
            </p>
          )}

          {painting.description && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-nadart-text-muted mb-2">Description</h3>
              <p className="text-nadart-text-secondary whitespace-pre-line">
                {painting.description}
              </p>
            </div>
          )}

          {(painting.dimensions || painting.medium) && (
            <div className="border-t border-nadart-accent/20 pt-4">
              {painting.dimensions && (
                <p className="text-sm text-nadart-text-secondary">
                  <span className="text-nadart-text-muted">Dimensions:</span> {painting.dimensions}
                </p>
              )}
              {painting.medium && (
                <p className="text-sm text-nadart-text-secondary">
                  <span className="text-nadart-text-muted">Medium:</span> {painting.medium}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
