import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import db, { initializeDatabase } from './database.js'
import { ensureGalleryFolders } from '../utils/file.utils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const NADART_PATH = path.resolve(__dirname, '../../../../nadart')
const RESOURCES_PATH = path.resolve(__dirname, '../../../resources/galleries')

// Painting data extracted from the original index.html
const paintingsData = [
  {
    title: 'Time-Worn',
    technique: 'Acrylic Ultra Textured',
    description: 'A richly textured abstract piece evoking the passage of time through layered surfaces and weathered patterns.',
    dimensions: '100x75cm',
    medium: 'Acrylic on canvas',
    filename: 'Acrylic ultra textured - 100x75cm.jpg',
  },
  {
    title: 'Black Snow',
    technique: 'Acrylic Textured',
    description: 'A dramatic contrast of dark and light textures, reminiscent of snow falling on charcoal landscapes.',
    dimensions: '120x75cm',
    medium: 'Acrylic + Charcoal on canvas',
    filename: 'textured acrylic - 120x75cm black snow.jpg',
  },
  {
    title: 'Les Galets',
    technique: 'Acrylic Textured',
    description: 'Inspired by smooth river stones, this piece captures the essence of natural forms and textures.',
    dimensions: '50x50cm',
    medium: 'Acrylic on canvas',
    filename: 'les_galets.jpg',
  },
  {
    title: 'Sandy Blue',
    technique: 'Acrylic Textured',
    description: 'Ocean meets shore in this textured abstract, blending sandy tones with deep blues.',
    dimensions: '60x30cm',
    medium: 'Acrylic on canvas',
    filename: 'Acrylic textured - 60x30cm.jpg',
  },
  {
    title: 'Silver Age',
    technique: 'Acrylic Textured',
    description: 'A metallic exploration of texture and light, evoking timeless elegance.',
    dimensions: '60x30cm',
    medium: 'Acrylic on canvas',
    filename: 'Acrylic textured - 60x30cm Silver.jpg',
  },
  {
    title: 'Rebellion I',
    technique: 'Acrylic on Paper',
    description: 'Part of the Rebellion series - bold, expressive marks challenging conventional forms.',
    dimensions: '30x30cm',
    medium: 'Acrylic on paper',
    filename: 'studies_01.jpg',
  },
  {
    title: 'Rebellion II',
    technique: 'Acrylic on Paper',
    description: 'Continuing the exploration of rebellion through abstract expression.',
    dimensions: '30x30cm',
    medium: 'Acrylic on paper',
    filename: 'studies_02.jpg',
  },
  {
    title: 'Rebellion III',
    technique: 'Acrylic on Paper',
    description: 'The third piece in the Rebellion series, pushing boundaries of form and texture.',
    dimensions: '30x30cm',
    medium: 'Acrylic on paper',
    filename: 'studies_03.jpg',
  },
  {
    title: 'Rebellion IV',
    technique: 'Acrylic on Paper',
    description: 'The culmination of the Rebellion series, synthesizing themes of freedom and expression.',
    dimensions: '30x30cm',
    medium: 'Acrylic on paper',
    filename: 'studies_04.jpg',
  },
  {
    title: 'Little Galets I',
    technique: 'Acrylic',
    description: 'Miniature studies inspired by pebbles and natural forms.',
    dimensions: '20x20cm',
    medium: 'Acrylic on canvas',
    filename: 'little_galets_01.jpg',
  },
  {
    title: 'Little Galets II',
    technique: 'Acrylic',
    description: 'Continuing the Little Galets series with variations in texture and tone.',
    dimensions: '20x20cm',
    medium: 'Acrylic on canvas',
    filename: 'little_galets_02.jpg',
  },
  {
    title: 'Little Galets III',
    technique: 'Acrylic',
    description: 'The third in the Little Galets series, exploring subtle variations.',
    dimensions: '20x20cm',
    medium: 'Acrylic on canvas',
    filename: 'little_galets_03.jpg',
  },
  {
    title: 'Blurred',
    technique: 'Acrylic Textured',
    description: 'An exploration of soft focus and texture, creating dreamlike abstract forms.',
    dimensions: '40x40cm',
    medium: 'Acrylic on canvas',
    filename: 'Acrylic textured 40x40cm.JPG',
  },
]

async function copyAndProcessImage(
  sourceFile: string,
  destFolder: string,
  filename: string
): Promise<{ original: string; thumbnail: string }> {
  const sourcePath = path.join(NADART_PATH, 'resources/images', sourceFile)

  if (!fs.existsSync(sourcePath)) {
    console.warn(`Source file not found: ${sourcePath}`)
    throw new Error(`Source file not found: ${sourceFile}`)
  }

  const ext = path.extname(filename).toLowerCase()
  const baseName = path.basename(filename, ext).toLowerCase().replace(/[^a-z0-9.-]/g, '-')
  const timestamp = Date.now()
  const newFilename = `${timestamp}-${baseName}${ext}`
  const thumbnailFilename = `thumb-${newFilename}`

  const destOriginal = path.join(destFolder, 'originals', newFilename)
  const destThumbnail = path.join(destFolder, 'thumbnails', thumbnailFilename)

  // Copy original
  fs.copyFileSync(sourcePath, destOriginal)
  console.log(`  Copied: ${sourceFile} -> ${newFilename}`)

  // Generate thumbnail
  await sharp(sourcePath)
    .resize(400, null, { withoutEnlargement: true })
    .toFile(destThumbnail)
  console.log(`  Generated thumbnail: ${thumbnailFilename}`)

  return { original: newFilename, thumbnail: thumbnailFilename }
}

async function migrate() {
  console.log('=== NadArt Migration Script ===\n')

  // Check if source exists
  if (!fs.existsSync(NADART_PATH)) {
    console.error(`Error: Source path not found: ${NADART_PATH}`)
    process.exit(1)
  }

  console.log('1. Initializing database...')
  initializeDatabase()

  // Run seed to create admin user and main gallery
  console.log('\n2. Running seed script...')
  const { execSync } = await import('child_process')
  execSync('npm run seed', { cwd: path.resolve(__dirname, '../..'), stdio: 'inherit' })

  // Get main gallery
  const mainGallery = db.prepare('SELECT * FROM galleries WHERE is_main = 1').get() as {
    id: number
    folder_name: string
  }

  if (!mainGallery) {
    console.error('Error: Main gallery not found')
    process.exit(1)
  }

  console.log('\n3. Preparing gallery folder...')
  const galleryPath = path.join(RESOURCES_PATH, mainGallery.folder_name)
  ensureGalleryFolders(mainGallery.folder_name)
  console.log(`  Gallery folder: ${galleryPath}`)

  console.log('\n4. Migrating paintings...')
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < paintingsData.length; i++) {
    const painting = paintingsData[i]
    console.log(`\n  [${i + 1}/${paintingsData.length}] ${painting.title}`)

    try {
      const { original, thumbnail } = await copyAndProcessImage(
        painting.filename,
        galleryPath,
        painting.filename
      )

      // Insert into database
      db.prepare(`
        INSERT INTO paintings (gallery_id, title, technique, description, dimensions, medium, image_filename, thumbnail_filename, display_order, is_visible)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        mainGallery.id,
        painting.title,
        painting.technique,
        painting.description,
        painting.dimensions,
        painting.medium,
        original,
        thumbnail,
        i
      )

      successCount++
      console.log(`  ✓ Added to database`)
    } catch (error) {
      errorCount++
      console.error(`  ✗ Error: ${(error as Error).message}`)
    }
  }

  console.log('\n=== Migration Complete ===')
  console.log(`  Successful: ${successCount}`)
  console.log(`  Errors: ${errorCount}`)
  console.log(`\nYou can now start the server with: npm run dev`)
}

migrate().catch(console.error)
