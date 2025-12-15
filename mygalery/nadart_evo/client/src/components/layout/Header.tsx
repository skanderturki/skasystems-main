import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGalleries } from '../../hooks/useGalleries'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { data: galleries } = useGalleries()

  const nonMainGalleries = galleries?.filter(g => !g.is_main) || []

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navLinks = [
    { path: '/#about', label: 'About' },
    { path: '/resume', label: 'Resume' },
    { path: '/#contact', label: 'Contact' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nadart-bg-primary/95 backdrop-blur-sm border-b border-nadart-accent/20">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-10 h-10" viewBox="0 0 100 100" fill="none">
              {/* Easel legs */}
              <line x1="25" y1="90" x2="40" y2="45" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
              <line x1="75" y1="90" x2="60" y2="45" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="90" x2="50" y2="55" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
              {/* Canvas frame */}
              <rect x="20" y="10" width="60" height="45" rx="2" fill="#F5F0E6" stroke="#D4AF37" strokeWidth="2" />
              {/* Abstract art on canvas */}
              <circle cx="35" cy="28" r="8" fill="#E8B4B8" opacity="0.9" />
              <circle cx="55" cy="35" r="10" fill="#87CEEB" opacity="0.7" />
              <circle cx="65" cy="22" r="6" fill="#98D8AA" opacity="0.8" />
              {/* Canvas support bar */}
              <line x1="25" y1="55" x2="75" y2="55" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span className="font-dancing text-3xl text-nadart-text-primary">NadArt</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Gallery dropdown */}
            <div className="relative group">
              <a
                href="/#gallery"
                className={`text-sm uppercase tracking-wider transition-colors flex items-center gap-1 ${
                  location.pathname.startsWith('/gallery')
                    ? 'text-nadart-text-primary'
                    : 'text-nadart-text-secondary hover:text-nadart-text-primary'
                }`}
              >
                Gallery
                {nonMainGalleries.length > 0 && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </a>
              {nonMainGalleries.length > 0 && (
                <div className="absolute top-full left-0 mt-2 py-2 bg-nadart-bg-secondary rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 min-w-[180px]">
                  <a
                    href="/#gallery"
                    className="block px-4 py-2 text-sm text-nadart-text-secondary hover:text-nadart-text-primary hover:bg-nadart-accent/20 transition-colors"
                  >
                    Main Gallery
                  </a>
                  <div className="border-t border-nadart-accent/20 my-1" />
                  {nonMainGalleries.map((gallery) => (
                    <Link
                      key={gallery.slug}
                      to={`/gallery/${gallery.slug}`}
                      className="block px-4 py-2 text-sm text-nadart-text-secondary hover:text-nadart-text-primary hover:bg-nadart-accent/20 transition-colors"
                    >
                      {gallery.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className={`text-sm uppercase tracking-wider transition-colors ${
                  isActive(link.path)
                    ? 'text-nadart-text-primary'
                    : 'text-nadart-text-secondary hover:text-nadart-text-primary'
                }`}
              >
                {link.label}
              </a>
            ))}

            {/* Social Links */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-nadart-accent/30">
              <a
                href="https://instagram.com/nadart.galery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nadart-text-secondary hover:text-nadart-accent-instagram transition-colors"
              >
                <i className="fab fa-instagram text-lg" />
              </a>
              <a
                href="https://wa.me/966556540146"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nadart-text-secondary hover:text-nadart-accent-success transition-colors"
              >
                <i className="fab fa-whatsapp text-lg" />
              </a>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span
                className={`w-full h-0.5 bg-nadart-text-primary transition-all duration-300 ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-nadart-text-primary transition-all duration-300 ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`w-full h-0.5 bg-nadart-text-primary transition-all duration-300 ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-4 py-4 border-t border-nadart-accent/30">
            {/* Gallery section */}
            <a
              href="/#gallery"
              className="text-nadart-text-secondary hover:text-nadart-text-primary transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </a>
            {nonMainGalleries.length > 0 && (
              <div className="flex flex-col gap-2 pl-4 border-l border-nadart-accent/20">
                <a
                  href="/#gallery"
                  className="text-nadart-text-secondary/80 hover:text-nadart-text-primary transition-colors text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Main Gallery
                </a>
                {nonMainGalleries.map((gallery) => (
                  <Link
                    key={gallery.slug}
                    to={`/gallery/${gallery.slug}`}
                    className="text-nadart-text-secondary/80 hover:text-nadart-text-primary transition-colors text-sm"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {gallery.name}
                  </Link>
                ))}
              </div>
            )}

            {navLinks.map((link) => (
              <a
                key={link.path}
                href={link.path}
                className="text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}

            <div className="flex gap-4 pt-4 border-t border-nadart-accent/30">
              <a
                href="https://instagram.com/nadart.galery"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nadart-text-secondary hover:text-nadart-accent-instagram"
              >
                <i className="fab fa-instagram text-xl" />
              </a>
              <a
                href="https://wa.me/966556540146"
                target="_blank"
                rel="noopener noreferrer"
                className="text-nadart-text-secondary hover:text-nadart-accent-success"
              >
                <i className="fab fa-whatsapp text-xl" />
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
