import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGalleries } from '../../hooks/useGalleries'
import { usePaintings } from '../../hooks/usePaintings'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DashboardPage() {
  const { data: galleries, isLoading: galleriesLoading } = useGalleries()
  const { data: paintings, isLoading: paintingsLoading } = usePaintings()

  const isLoading = galleriesLoading || paintingsLoading

  const stats = [
    {
      label: 'Total Galleries',
      value: galleries?.length || 0,
      icon: 'fas fa-images',
      link: '/admin/galleries',
      color: 'text-blue-400',
    },
    {
      label: 'Total Paintings',
      value: paintings?.length || 0,
      icon: 'fas fa-paint-brush',
      link: '/admin/paintings',
      color: 'text-green-400',
    },
    {
      label: 'Visible Paintings',
      value: paintings?.filter(p => p.is_visible).length || 0,
      icon: 'fas fa-eye',
      link: '/admin/paintings',
      color: 'text-purple-400',
    },
    {
      label: 'Hidden Paintings',
      value: paintings?.filter(p => !p.is_visible).length || 0,
      icon: 'fas fa-eye-slash',
      link: '/admin/paintings',
      color: 'text-yellow-400',
    },
  ]

  const quickActions = [
    {
      label: 'Add New Painting',
      icon: 'fas fa-plus',
      link: '/admin/paintings',
      description: 'Upload a new artwork to your gallery',
    },
    {
      label: 'Create Gallery',
      icon: 'fas fa-folder-plus',
      link: '/admin/galleries',
      description: 'Create a new collection',
    },
    {
      label: 'Edit Resume',
      icon: 'fas fa-file-alt',
      link: '/admin/resume',
      description: 'Update your artist statement and timeline',
    },
    {
      label: 'View Site',
      icon: 'fas fa-external-link-alt',
      link: '/',
      description: 'See how your gallery looks to visitors',
      external: true,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-nadart-text-primary mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={stat.link}
              className="card p-6 block hover:bg-nadart-accent/10 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`text-3xl ${stat.color}`}>
                  <i className={stat.icon} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-nadart-text-primary">{stat.value}</p>
                  <p className="text-sm text-nadart-text-secondary">{stat.label}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold text-nadart-text-primary mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Link
              to={action.link}
              target={action.external ? '_blank' : undefined}
              className="card p-4 block hover:bg-nadart-accent/10 transition-colors h-full"
            >
              <i className={`${action.icon} text-xl text-nadart-text-primary mb-2`} />
              <h3 className="font-medium text-nadart-text-primary">{action.label}</h3>
              <p className="text-xs text-nadart-text-secondary mt-1">{action.description}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Galleries */}
      {galleries && galleries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-nadart-text-primary">Your Galleries</h2>
            <Link
              to="/admin/galleries"
              className="text-sm text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleries.slice(0, 6).map((gallery) => (
              <div key={gallery.id} className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-nadart-text-primary">
                      {gallery.name}
                      {gallery.is_main && (
                        <span className="ml-2 text-xs bg-nadart-accent-success/20 text-nadart-accent-success px-2 py-0.5 rounded">
                          Main
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-nadart-text-secondary">
                      {gallery.painting_count || 0} paintings
                    </p>
                  </div>
                  <Link
                    to={`/gallery/${gallery.slug}`}
                    target="_blank"
                    className="p-2 text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
                    title="View gallery"
                  >
                    <i className="fas fa-external-link-alt" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
