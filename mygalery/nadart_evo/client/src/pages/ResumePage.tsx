import { motion } from 'framer-motion'
import { useResume } from '../hooks/useResume'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ResumePage() {
  const { data: resume, isLoading } = useResume()

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="py-12">
      {/* Hero Section */}
      <section className="px-4 py-16 bg-nadart-bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2">
              <h1 className="text-5xl font-dancing text-nadart-text-primary mb-4">
                Artist Resume
              </h1>
              <p className="text-xl text-nadart-text-secondary">
                A journey through abstract art and continuous learning
              </p>
            </div>
            <div className="bg-nadart-bg-primary/50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-nadart-text-primary mb-4">Contact</h3>
              <div className="space-y-2 text-sm text-nadart-text-secondary">
                <p className="flex items-center gap-2">
                  <i className="fas fa-envelope w-5" />
                  nadart.galery@gmail.com
                </p>
                <p className="flex items-center gap-2">
                  <i className="fab fa-instagram w-5" />
                  @nad.art.gallery
                </p>
                <p className="flex items-center gap-2">
                  <i className="fas fa-map-marker-alt w-5" />
                  Tunisia
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Artist Statement */}
      {resume?.content && (
        <section className="px-4 py-16">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-dancing text-nadart-text-primary mb-8 text-center">
                Artist Statement
              </h2>
              <div className="space-y-8">
                {resume.content.artist_statement_en && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-nadart-text-secondary text-lg leading-relaxed whitespace-pre-line">
                      {resume.content.artist_statement_en}
                    </p>
                  </div>
                )}
                {resume.content.artist_statement_ar && (
                  <div className="text-right" dir="rtl">
                    <p className="font-arizonia text-xl text-nadart-text-muted leading-relaxed whitespace-pre-line">
                      {resume.content.artist_statement_ar}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Artistic Philosophy */}
      {resume?.content?.artistic_philosophy_en && (
        <section className="px-4 py-16 bg-nadart-bg-secondary">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-dancing text-nadart-text-primary mb-8 text-center">
                Artistic Philosophy
              </h2>
              <p className="text-nadart-text-secondary text-lg text-center max-w-3xl mx-auto">
                {resume.content.artistic_philosophy_en}
              </p>
              {resume.content.artistic_philosophy_ar && (
                <p className="font-arizonia text-xl text-nadart-text-muted text-center mt-6" dir="rtl">
                  {resume.content.artistic_philosophy_ar}
                </p>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* Timeline */}
      {resume?.timeline && resume.timeline.length > 0 && (
        <section className="px-4 py-16">
          <div className="container mx-auto max-w-4xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-dancing text-nadart-text-primary mb-12 text-center">
                Artistic Journey
              </h2>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-0 md:left-1/2 w-0.5 h-full bg-nadart-accent transform md:-translate-x-1/2" />

                {resume.timeline.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative mb-8 md:mb-0 ${
                      index % 2 === 0 ? 'md:pr-8 md:text-right md:ml-0 md:mr-[50%]' : 'md:pl-8 md:ml-[50%]'
                    } pl-8 md:pl-0`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-0 md:left-auto md:right-0 md:translate-x-[calc(50%+0.125rem)] top-1 w-3 h-3 bg-nadart-text-primary rounded-full transform -translate-x-1/2 md:translate-x-1/2" />

                    <div className="card p-6">
                      <span className="text-nadart-accent-success font-medium">
                        {entry.date_range}
                      </span>
                      <h3 className="text-xl text-nadart-text-primary mt-2 mb-2">
                        {entry.title}
                      </h3>
                      {entry.description && (
                        <p className="text-nadart-text-secondary text-sm">
                          {entry.description}
                        </p>
                      )}
                      {entry.items && entry.items.length > 0 && (
                        <ul className={`mt-3 space-y-1 text-sm text-nadart-text-muted ${
                          index % 2 === 0 ? 'md:text-right' : ''
                        }`}>
                          {entry.items.map((item, i) => (
                            <li key={i}>• {item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Expertise */}
      {resume?.expertise && resume.expertise.length > 0 && (
        <section className="px-4 py-16 bg-nadart-bg-secondary">
          <div className="container mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-dancing text-nadart-text-primary mb-12 text-center">
                Areas of Expertise
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {resume.expertise.map((area, index) => (
                  <motion.div
                    key={area.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="card p-6 text-center"
                  >
                    <i className={`${area.icon} text-3xl text-nadart-text-primary mb-4`} />
                    <h3 className="text-lg font-medium text-nadart-text-primary mb-2">
                      {area.title}
                    </h3>
                    {area.description && (
                      <p className="text-sm text-nadart-text-secondary">
                        {area.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}
