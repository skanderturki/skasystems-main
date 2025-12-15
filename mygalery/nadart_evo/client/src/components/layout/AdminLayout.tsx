import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useLogout } from '../../hooks/useAuth'
import { useAuthStore } from '../../stores/authStore'

export default function AdminLayout() {
  const navigate = useNavigate()
  const { mutate: logout, isPending } = useLogout()
  const user = useAuthStore((state) => state.user)

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'fas fa-home', end: true },
    { path: '/admin/galleries', label: 'Galleries', icon: 'fas fa-images' },
    { path: '/admin/paintings', label: 'Paintings', icon: 'fas fa-paint-brush' },
    { path: '/admin/resume', label: 'Resume', icon: 'fas fa-file-alt' },
    { path: '/admin/settings', label: 'Settings', icon: 'fas fa-cog' },
  ]

  return (
    <div className="min-h-screen bg-nadart-bg-primary flex">
      {/* Sidebar */}
      <aside className="w-64 bg-nadart-bg-secondary border-r border-nadart-accent/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-nadart-accent/20">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
              <circle cx="30" cy="70" r="8" fill="#FF6B6B" />
              <circle cx="50" cy="50" r="8" fill="#4ECDC4" />
              <circle cx="70" cy="70" r="8" fill="#FFE66D" />
              <rect x="25" y="20" width="6" height="50" rx="3" fill="#FF6B6B" transform="rotate(-15 25 20)" />
              <rect x="45" y="15" width="6" height="55" rx="3" fill="#4ECDC4" transform="rotate(5 45 15)" />
              <rect x="65" y="20" width="6" height="50" rx="3" fill="#FFE66D" transform="rotate(15 65 20)" />
            </svg>
            <span className="font-dancing text-2xl text-nadart-text-primary">NadArt</span>
          </button>
          <p className="text-xs text-nadart-text-secondary mt-2">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-nadart-accent text-nadart-text-primary'
                        : 'text-nadart-text-secondary hover:bg-nadart-accent/20 hover:text-nadart-text-primary'
                    }`
                  }
                >
                  <i className={`${item.icon} w-5`} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-nadart-accent/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-nadart-accent rounded-full flex items-center justify-center">
              <i className="fas fa-user text-nadart-text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-nadart-text-primary truncate">{user?.email}</p>
              <p className="text-xs text-nadart-text-secondary">Admin</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-nadart-accent/50 hover:bg-nadart-accent text-nadart-text-primary rounded-lg transition-colors disabled:opacity-50"
          >
            <i className="fas fa-sign-out-alt" />
            <span>{isPending ? 'Logging out...' : 'Logout'}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-nadart-bg-secondary border-b border-nadart-accent/20 flex items-center px-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
          >
            <i className="fas fa-external-link-alt" />
            <span>View Site</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
