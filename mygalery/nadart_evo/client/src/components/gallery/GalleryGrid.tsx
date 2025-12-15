import { useState } from 'react'
import type { Painting } from '../../types'
import GalleryItem from './GalleryItem'
import PaintingModal from './PaintingModal'

interface GalleryGridProps {
  paintings: Painting[]
  galleryFolder: string
}

export default function GalleryGrid({ paintings, galleryFolder }: GalleryGridProps) {
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null)

  if (paintings.length === 0) {
    return (
      <div className="text-center py-12 text-nadart-text-secondary">
        No paintings to display yet.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paintings.map((painting) => (
          <GalleryItem
            key={painting.id}
            painting={painting}
            galleryFolder={galleryFolder}
            onClick={() => setSelectedPainting(painting)}
          />
        ))}
      </div>

      <PaintingModal
        painting={selectedPainting}
        galleryFolder={galleryFolder}
        onClose={() => setSelectedPainting(null)}
      />
    </>
  )
}
