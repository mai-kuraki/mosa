import Database from "better-sqlite3";
import { app } from "electron";
import { join } from "path";
import { mkdirSync, existsSync } from "fs";
import { createLogger } from "./logger.service";

const logger = createLogger("database");

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const dbDir = join(app.getPath("userData"), "database");
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = join(dbDir, "mosa.db");
  logger.info(`Opening database at ${dbPath}`);

  db = new Database(dbPath);

  // Enable WAL mode for better concurrent read performance
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  runMigrations();
}

function runMigrations(): void {
  if (!db) return;

  logger.info("Running database migrations...");

  db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      path TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      image_count INTEGER DEFAULT 0,
      last_scanned TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS images (
      id TEXT PRIMARY KEY,
      file_path TEXT UNIQUE NOT NULL,
      file_hash TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      format TEXT NOT NULL,
      date_taken TEXT,
      camera_make TEXT,
      camera_model TEXT,
      lens TEXT,
      iso INTEGER,
      aperture REAL,
      shutter_speed TEXT,
      focal_length REAL,
      rating INTEGER DEFAULT 0,
      thumbnail_path TEXT,
      folder_id TEXT REFERENCES folders(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS edit_recipes (
      id TEXT PRIMARY KEY,
      image_id TEXT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
      recipe_json TEXT NOT NULL,
      preset_id TEXT,
      is_current INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS edit_history (
      id TEXT PRIMARY KEY,
      image_id TEXT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
      recipe_snapshot TEXT NOT NULL,
      sequence INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      recipe_json TEXT NOT NULL,
      category TEXT,
      is_builtin INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_images_file_path ON images(file_path);
    CREATE INDEX IF NOT EXISTS idx_images_date_taken ON images(date_taken);
    CREATE INDEX IF NOT EXISTS idx_images_rating ON images(rating);
    CREATE INDEX IF NOT EXISTS idx_images_folder_id ON images(folder_id);
    CREATE INDEX IF NOT EXISTS idx_edit_recipes_image_current ON edit_recipes(image_id, is_current);
    CREATE INDEX IF NOT EXISTS idx_edit_history_image_seq ON edit_history(image_id, sequence);
  `);

  logger.info("Database migrations complete.");
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
    logger.info("Database closed.");
  }
}
