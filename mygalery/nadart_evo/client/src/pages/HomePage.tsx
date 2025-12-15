import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useMainGallery, useGalleries } from '../hooks/useGalleries'
import { contactService } from '../services/contactService'
import GalleryGrid from '../components/gallery/GalleryGrid'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const contactSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  msg: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function HomePage() {
  const { data: mainGallery, isLoading: galleryLoading } = useMainGallery()
  const { data: allGalleries } = useGalleries()
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [contactMessage, setContactMessage] = useState('')

  const otherGalleries = allGalleries?.filter(g => !g.is_main) || []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmitContact = async (data: ContactFormData) => {
    setContactStatus('loading')
    try {
      await contactService.send(data)
      setContactStatus('success')
      setContactMessage('Thank you! Your message has been sent.')
      reset()
    } catch {
      setContactStatus('error')
      setContactMessage('Failed to send message. Please try again.')
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-nadart-bg-primary/50" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10 px-4"
        >
          <h1 className="font-dancing text-6xl md:text-8xl text-nadart-text-primary mb-4">
            NadArt
          </h1>
          <p className="text-xl md:text-2xl text-nadart-text-secondary max-w-2xl mx-auto">
            Exploring the boundaries between reality and abstraction through textured acrylic art
          </p>
          <a
            href="#gallery"
            className="inline-block mt-8 btn btn-primary"
          >
            Explore Gallery
          </a>
        </motion.div>
      </section>

      {/* Main Gallery Section */}
      <section id="gallery" className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-dancing text-nadart-text-primary mb-4">Gallery</h2>
            <p className="text-nadart-text-secondary max-w-xl mx-auto">
              A curated collection of abstract works exploring texture, color, and emotion
            </p>
          </motion.div>

          {galleryLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : mainGallery?.paintings ? (
            <GalleryGrid
              paintings={mainGallery.paintings}
              galleryFolder={mainGallery.folder_name}
            />
          ) : (
            <p className="text-center text-nadart-text-secondary">No paintings available</p>
          )}

          {/* Other Galleries */}
          {otherGalleries.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h3 className="text-2xl font-dancing text-nadart-text-primary mb-8 text-center">
                Explore More Collections
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherGalleries.map((gallery) => (
                  <Link
                    key={gallery.slug}
                    to={`/gallery/${gallery.slug}`}
                    className="card p-6 hover:bg-nadart-accent/10 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <svg className="w-12 h-12 opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 100" fill="none">
                          {/* Picture frame */}
                          <rect x="10" y="10" width="80" height="60" rx="2" fill="none" stroke="#D4AF37" strokeWidth="3" />
                          <rect x="18" y="18" width="64" height="44" rx="1" fill="#2a2a2a" />
                          {/* Abstract art inside */}
                          <circle cx="35" cy="38" r="8" fill="#E8B4B8" opacity="0.8" />
                          <circle cx="55" cy="42" r="10" fill="#87CEEB" opacity="0.6" />
                          <circle cx="68" cy="32" r="6" fill="#98D8AA" opacity="0.7" />
                          {/* Frame stand */}
                          <line x1="50" y1="70" x2="50" y2="85" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
                          <line x1="35" y1="85" x2="65" y2="85" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-medium text-nadart-text-primary mb-2">
                          {gallery.name}
                        </h4>
                        {gallery.description && (
                          <p className="text-nadart-text-secondary text-sm line-clamp-2">
                            {gallery.description}
                          </p>
                        )}
                        <p className="text-nadart-text-muted text-xs mt-4">
                          {gallery.painting_count || 0} works
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-nadart-bg-secondary">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-dancing text-nadart-text-primary mb-8 text-center">
              About the Artist
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-nadart-text-secondary text-lg leading-relaxed mb-6">
                NadArt is a contemporary abstract artist specializing in textured acrylic paintings
                that explore the boundaries between the physical and ethereal. Each piece is created
                using impasto techniques that invite viewers to experience art beyond the visual—through
                texture, depth, and emotional resonance.
              </p>
              <p className="text-nadart-text-secondary text-lg leading-relaxed">
                Drawing inspiration from nature's patterns and the unseen forces that shape our world,
                the work represents a continuous dialogue between structure and chaos, permanence and
                transience.
              </p>
            </div>
            <div className="text-center mt-8">
              <Link to="/resume" className="btn btn-primary">
                View Full Resume
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-dancing text-nadart-text-primary mb-8 text-center">
              Get in Touch
            </h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <form onSubmit={handleSubmit(onSubmitContact)} className="space-y-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your@email.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <Textarea
                    label="Message"
                    placeholder="Your message..."
                    rows={5}
                    error={errors.msg?.message}
                    {...register('msg')}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    isLoading={contactStatus === 'loading'}
                  >
                    Send Message
                  </Button>

                  {contactStatus !== 'idle' && contactStatus !== 'loading' && (
                    <p
                      className={`text-sm ${
                        contactStatus === 'success'
                          ? 'text-nadart-accent-success'
                          : 'text-nadart-accent-error'
                      }`}
                    >
                      {contactMessage}
                    </p>
                  )}
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-nadart-text-primary mb-2">
                    Connect
                  </h3>
                  <p className="text-nadart-text-secondary">
                    Feel free to reach out for commissions, collaborations, or just to say hello.
                  </p>
                </div>

                <div className="space-y-4">
                  <a
                    href="mailto:nadart.galery@gmail.com"
                    className="flex items-center gap-3 text-nadart-text-secondary hover:text-nadart-text-primary transition-colors"
                  >
                    <i className="fas fa-envelope text-xl w-6" />
                    nadart.galery@gmail.com
                  </a>
                  <a
                    href="https://instagram.com/nadart.galery"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-nadart-text-secondary hover:text-nadart-accent-instagram transition-colors"
                  >
                    <i className="fab fa-instagram text-xl w-6" />
                    @nadart.galery
                  </a>
                  <a
                    href="https://wa.me/966556540146"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-nadart-text-secondary hover:text-nadart-accent-success transition-colors"
                  >
                    <i className="fab fa-whatsapp text-xl w-6" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
