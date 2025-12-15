import { motion } from 'framer-motion'
import type { Painting } from '../../types'

interface GalleryItemProps {
  painting: Painting
  galleryFolder: string
  onClick: () => void
}

export default function GalleryItem({ painting, galleryFolder, onClick }: GalleryItemProps) {
  const thumbnailUrl = `/galleries/${galleryFolder}/thumbnails/thumb-${painting.image_filename}`

  return (
    <motion.div
      className="card cursor-pointer group"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden bg-nadart-bg-dark">
        <img
          src={thumbnailUrl}
          alt={painting.title}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-nadart-text-primary mb-1">
          "{painting.title}"{painting.technique && `, ${painting.technique}`}
        </h3>
        {painting.description && (
          <p className="text-sm text-nadart-text-secondary line-clamp-2 mb-2">
            {painting.description}
          </p>
        )}
        {(painting.dimensions || painting.medium) && (
          <p className="text-xs text-nadart-text-muted">
            {[painting.dimensions, painting.medium].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </motion.div>
  )
}
