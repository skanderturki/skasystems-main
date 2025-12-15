-- Users table (admin only)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    google_id TEXT,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add google_id column if it doesn't exist (migration for existing databases)
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we handle this in code

-- Galleries table
CREATE TABLE IF NOT EXISTS galleries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_main INTEGER DEFAULT 0,
    folder_name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Paintings table
CREATE TABLE IF NOT EXISTS paintings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    gallery_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    technique TEXT,
    description TEXT,
    dimensions TEXT,
    medium TEXT,
    image_filename TEXT NOT NULL,
    thumbnail_filename TEXT,
    display_order INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (gallery_id) REFERENCES galleries(id) ON DELETE CASCADE
);

-- Resume content table
CREATE TABLE IF NOT EXISTS resume_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_key TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    section_order INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Timeline entries table
CREATE TABLE IF NOT EXISTS timeline_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_range TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    items TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Expertise areas table
CREATE TABLE IF NOT EXISTS expertise_areas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_paintings_gallery ON paintings(gallery_id);
CREATE INDEX IF NOT EXISTS idx_paintings_order ON paintings(display_order);
CREATE INDEX IF NOT EXISTS idx_galleries_order ON galleries(display_order);
CREATE INDEX IF NOT EXISTS idx_galleries_slug ON galleries(slug);
