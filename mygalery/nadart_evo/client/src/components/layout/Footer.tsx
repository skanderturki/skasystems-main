import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-nadart-bg-dark py-8 border-t border-nadart-accent/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <Link
              to="/login"
              className="text-nadart-text-secondary/50 hover:text-nadart-text-secondary text-xs transition-colors"
            >
              Admin
            </Link>
            <p className="text-nadart-text-secondary text-sm">
              &copy; {currentYear} NadArt. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://instagram.com/nadart.galery"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nadart-text-secondary hover:text-nadart-accent-instagram transition-colors"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram text-xl" />
            </a>
            <a
              href="https://wa.me/966556540146"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nadart-text-secondary hover:text-nadart-accent-success transition-colors"
              aria-label="WhatsApp"
            >
              <i className="fab fa-whatsapp text-xl" />
            </a>
            <a
              href="mailto:nadart.galery@gmail.com"
              className="text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
              aria-label="Email"
            >
              <i className="fas fa-envelope text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
