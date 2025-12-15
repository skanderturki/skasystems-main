import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGallery } from '../hooks/useGalleries'
import GalleryGrid from '../components/gallery/GalleryGrid'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function GalleryPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: gallery, isLoading, error } = useGallery(slug || '')

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !gallery) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-dancing text-nadart-text-primary mb-4">
          Gallery Not Found
        </h1>
        <p className="text-nadart-text-secondary mb-8">
          The gallery you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }

  return (
    <div className="py-12 px-4">
      <div className="container mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-nadart-text-secondary hover:text-nadart-text-primary transition-colors mb-8"
        >
          <i className="fas fa-arrow-left" />
          Back to Main Gallery
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-dancing text-nadart-text-primary mb-4">
            {gallery.name}
          </h1>
          {gallery.description && (
            <p className="text-nadart-text-secondary max-w-2xl mx-auto text-lg">
              {gallery.description}
            </p>
          )}
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {gallery.paintings && gallery.paintings.length > 0 ? (
            <GalleryGrid
              paintings={gallery.paintings}
              galleryFolder={gallery.folder_name}
            />
          ) : (
            <div className="text-center py-16 text-nadart-text-secondary">
              <i className="fas fa-images text-4xl mb-4 block opacity-50" />
              <p>No paintings in this gallery yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
