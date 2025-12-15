import 'dotenv/config'
import bcrypt from 'bcryptjs'
import db, { initializeDatabase } from './database.js'
import { ensureGalleryFolders } from '../utils/file.utils.js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'nadart.galery@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme123'

async function seed() {
  console.log('Initializing database...')
  initializeDatabase()

  console.log('Seeding database...')

  // Create admin user if not exists
  const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(ADMIN_EMAIL)
  if (!existingUser) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12)
    db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(ADMIN_EMAIL, passwordHash)
    console.log(`Created admin user: ${ADMIN_EMAIL}`)
  } else {
    console.log('Admin user already exists')
  }

  // Create main gallery if not exists
  const existingGallery = db.prepare('SELECT * FROM galleries WHERE is_main = 1').get()
  if (!existingGallery) {
    db.prepare(`
      INSERT INTO galleries (slug, name, description, is_main, folder_name, display_order)
      VALUES ('main', 'Main Gallery', 'Welcome to NadArt Gallery - A collection of abstract art', 1, 'main', 0)
    `).run()
    ensureGalleryFolders('main')
    console.log('Created main gallery')
  } else {
    console.log('Main gallery already exists')
  }

  // Seed resume content if not exists
  const existingContent = db.prepare('SELECT * FROM resume_content').all()
  if (existingContent.length === 0) {
    const resumeContent = [
      {
        key: 'artist_statement_en',
        content: `Through my art, I explore the profound dialogue between structure and chaos, permanence and transience. My work investigates the invisible boundaries that shape our existence—those delicate thresholds between the physical and ethereal, the seen and unseen.

I believe that boundaries are not mere limitations but are dynamic spaces of transformation. They are where identities merge and diverge, where meaning is both created and dissolved. In my paintings, I seek to capture this tension—the moment when a boundary becomes a bridge.`,
        order: 1,
      },
      {
        key: 'artist_statement_ar',
        content: `من خلال فني، أستكشف الحوار العميق بين النظام والفوضى، بين الدائم والزائل. يتحرى عملي الحدود الخفية التي تشكل وجودنا - تلك العتبات الرقيقة بين المادي والأثيري، بين المرئي وغير المرئي.

أؤمن بأن الحدود ليست مجرد قيود، بل هي مساحات ديناميكية للتحول. إنها حيث تندمج الهويات وتتفرق، حيث يُخلق المعنى ويذوب. في لوحاتي، أسعى لالتقاط هذا التوتر - اللحظة التي يصبح فيها الحد جسراً.`,
        order: 2,
      },
      {
        key: 'artistic_philosophy_en',
        content: `My artistic philosophy centers on the power of texture and abstraction to evoke emotional responses. I work primarily with acrylic, experimenting with thick impasto techniques that create tactile surfaces inviting viewers to experience art beyond the visual.`,
        order: 3,
      },
      {
        key: 'artistic_philosophy_ar',
        content: `تتمحور فلسفتي الفنية حول قوة الملمس والتجريد في إثارة الاستجابات العاطفية. أعمل بشكل أساسي بالأكريليك، مجربةً تقنيات الإمباستو السميكة التي تخلق أسطحًا لمسية تدعو المشاهدين لتجربة الفن بما يتجاوز البصري.`,
        order: 4,
      },
    ]

    const stmt = db.prepare('INSERT INTO resume_content (section_key, content, section_order) VALUES (?, ?, ?)')
    resumeContent.forEach(item => {
      stmt.run(item.key, item.content, item.order)
    })
    console.log('Seeded resume content')
  }

  // Seed timeline if not exists
  const existingTimeline = db.prepare('SELECT * FROM timeline_entries').all()
  if (existingTimeline.length === 0) {
    const timeline = [
      {
        date_range: '2022 - 2024',
        title: 'Continuous Learning & Development',
        description: 'Beginning of artistic journey with focus on foundational techniques',
        items: JSON.stringify(['Self-study in acrylic techniques', 'Experimentation with textures']),
        order: 0,
      },
      {
        date_range: '2024 - 2025',
        title: 'Advanced Techniques Training',
        description: 'Intensive training program in advanced painting methods',
        items: JSON.stringify(['Mangam program enrollment', 'Study of contemporary techniques']),
        order: 1,
      },
      {
        date_range: '2025 - Present',
        title: 'Professional Development',
        description: 'Training with renowned artists and continued education',
        items: JSON.stringify(['Louise Fletcher Creative Reset course', 'Find Your Joy program']),
        order: 2,
      },
    ]

    const stmt = db.prepare('INSERT INTO timeline_entries (date_range, title, description, items, display_order) VALUES (?, ?, ?, ?, ?)')
    timeline.forEach(item => {
      stmt.run(item.date_range, item.title, item.description, item.items, item.order)
    })
    console.log('Seeded timeline entries')
  }

  // Seed expertise areas if not exists
  const existingExpertise = db.prepare('SELECT * FROM expertise_areas').all()
  if (existingExpertise.length === 0) {
    const expertise = [
      {
        icon: 'fas fa-paint-brush',
        title: 'Acrylic Painting',
        description: 'Textured abstract works using impasto and mixed media techniques',
        order: 0,
      },
      {
        icon: 'fas fa-palette',
        title: 'Gouache',
        description: 'Vibrant opaque watercolor paintings with bold color compositions',
        order: 1,
      },
      {
        icon: 'fas fa-pencil-alt',
        title: 'Drawing',
        description: 'Pencil and charcoal studies exploring form and shadow',
        order: 2,
      },
      {
        icon: 'fas fa-water',
        title: 'Watercolor',
        description: 'Fluid transparent paintings capturing light and atmosphere',
        order: 3,
      },
    ]

    const stmt = db.prepare('INSERT INTO expertise_areas (icon, title, description, display_order) VALUES (?, ?, ?, ?)')
    expertise.forEach(item => {
      stmt.run(item.icon, item.title, item.description, item.order)
    })
    console.log('Seeded expertise areas')
  }

  console.log('Database seeding complete!')
  console.log(`\nAdmin credentials:`)
  console.log(`  Email: ${ADMIN_EMAIL}`)
  console.log(`  Password: ${ADMIN_PASSWORD}`)
  console.log(`\n⚠️  Please change the admin password after first login!`)
}

seed().catch(console.error)
