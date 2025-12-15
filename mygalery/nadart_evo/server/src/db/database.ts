import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database file path
const dbPath = path.join(__dirname, '../../../data/nadart.db')

// Ensure the data directory exists
const dataDir = path.dirname(dbPath)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Create database instance
const db = new Database(dbPath)

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize schema
export function initializeDatabase(): void {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  db.exec(schema)

  // Run migrations for existing databases
  runMigrations()

  console.log('Database initialized successfully')
}

// Run migrations for existing databases
function runMigrations(): void {
  // Check if google_id column exists
  const columns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>
  const hasGoogleId = columns.some(col => col.name === 'google_id')

  if (!hasGoogleId) {
    db.exec('ALTER TABLE users ADD COLUMN google_id TEXT')
    console.log('Migration: Added google_id column to users table')
  }
}

export default db
