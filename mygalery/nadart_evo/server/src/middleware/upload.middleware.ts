import multer from 'multer'

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10) // 10MB default

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const storage = multer.memoryStorage()

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
})
