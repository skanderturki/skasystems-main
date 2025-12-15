import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '../resources/galleries'
const THUMBNAIL_WIDTH = 400

export function ensureGalleryFolders(galleryFolder: string): void {
  const basePath = path.resolve(UPLOAD_DIR, galleryFolder)
  const originalsPath = path.join(basePath, 'originals')
  const thumbnailsPath = path.join(basePath, 'thumbnails')

  if (!fs.existsSync(originalsPath)) {
    fs.mkdirSync(originalsPath, { recursive: true })
  }
  if (!fs.existsSync(thumbnailsPath)) {
    fs.mkdirSync(thumbnailsPath, { recursive: true })
  }
}

export function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function saveImage(
  file: Express.Multer.File,
  galleryFolder: string
): Promise<{ original: string; thumbnail: string }> {
  ensureGalleryFolders(galleryFolder)

  const timestamp = Date.now()
  const ext = path.extname(file.originalname).toLowerCase()
  const baseName = sanitizeFilename(path.basename(file.originalname, ext))
  const filename = `${timestamp}-${baseName}${ext}`
  const thumbnailFilename = `thumb-${filename}`

  const originalsPath = path.resolve(UPLOAD_DIR, galleryFolder, 'originals')
  const thumbnailsPath = path.resolve(UPLOAD_DIR, galleryFolder, 'thumbnails')

  const originalPath = path.join(originalsPath, filename)
  const thumbnailPath = path.join(thumbnailsPath, thumbnailFilename)

  // Save original
  fs.writeFileSync(originalPath, file.buffer)

  // Generate and save thumbnail
  await sharp(file.buffer)
    .resize(THUMBNAIL_WIDTH, null, { withoutEnlargement: true })
    .toFile(thumbnailPath)

  return {
    original: filename,
    thumbnail: thumbnailFilename,
  }
}

export function deleteImage(galleryFolder: string, filename: string): void {
  const originalsPath = path.resolve(UPLOAD_DIR, galleryFolder, 'originals', filename)
  const thumbnailsPath = path.resolve(UPLOAD_DIR, galleryFolder, 'thumbnails', `thumb-${filename}`)

  if (fs.existsSync(originalsPath)) {
    fs.unlinkSync(originalsPath)
  }
  if (fs.existsSync(thumbnailsPath)) {
    fs.unlinkSync(thumbnailsPath)
  }
}

export function moveImage(
  filename: string,
  fromGallery: string,
  toGallery: string
): void {
  ensureGalleryFolders(toGallery)

  const fromOriginal = path.resolve(UPLOAD_DIR, fromGallery, 'originals', filename)
  const fromThumbnail = path.resolve(UPLOAD_DIR, fromGallery, 'thumbnails', `thumb-${filename}`)
  const toOriginal = path.resolve(UPLOAD_DIR, toGallery, 'originals', filename)
  const toThumbnail = path.resolve(UPLOAD_DIR, toGallery, 'thumbnails', `thumb-${filename}`)

  if (fs.existsSync(fromOriginal)) {
    fs.renameSync(fromOriginal, toOriginal)
  }
  if (fs.existsSync(fromThumbnail)) {
    fs.renameSync(fromThumbnail, toThumbnail)
  }
}

export function deleteGalleryFolder(galleryFolder: string): void {
  const basePath = path.resolve(UPLOAD_DIR, galleryFolder)
  if (fs.existsSync(basePath)) {
    fs.rmSync(basePath, { recursive: true, force: true })
  }
}

export function getImageUrl(galleryFolder: string, filename: string, type: 'original' | 'thumbnail' = 'original'): string {
  const folder = type === 'thumbnail' ? 'thumbnails' : 'originals'
  const file = type === 'thumbnail' ? `thumb-${filename}` : filename
  return `/galleries/${galleryFolder}/${folder}/${file}`
}
