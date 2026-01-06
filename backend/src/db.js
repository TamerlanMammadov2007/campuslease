import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
const defaultDbPath = path.join(dataDir, 'campuslease.db')

export function createDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = process.env.DB_PATH || defaultDbPath
  const db = new Database(dbPath)

  db.pragma('journal_mode = WAL')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS login_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      email TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      price INTEGER NOT NULL,
      bedrooms INTEGER NOT NULL,
      bathrooms REAL NOT NULL,
      square_feet INTEGER NOT NULL,
      property_type TEXT NOT NULL,
      images_json TEXT NOT NULL DEFAULT '[]',
      amenities_json TEXT NOT NULL DEFAULT '[]',
      utilities_included INTEGER NOT NULL DEFAULT 0,
      pets_allowed INTEGER NOT NULL DEFAULT 0,
      parking_available INTEGER NOT NULL DEFAULT 0,
      furnished INTEGER NOT NULL DEFAULT 0,
      available_from TEXT NOT NULL,
      available_until TEXT,
      owner_name TEXT NOT NULL DEFAULT '',
      owner_email TEXT NOT NULL DEFAULT '',
      owner_phone TEXT NOT NULL DEFAULT '',
      owner_user_id INTEGER,
      status TEXT NOT NULL DEFAULT 'available',
      lat REAL NOT NULL DEFAULT 0,
      lng REAL NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      listing_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT,
      applicant_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (listing_id) REFERENCES listings(id)
    );

    CREATE TABLE IF NOT EXISTS threads (
      id TEXT PRIMARY KEY,
      property_id INTEGER,
      property_title TEXT,
      participant_name TEXT NOT NULL,
      participant_email TEXT NOT NULL,
      owner_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (property_id) REFERENCES listings(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      sender_email TEXT NOT NULL,
      recipient TEXT NOT NULL,
      recipient_email TEXT NOT NULL,
      content TEXT NOT NULL,
      sender_user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      read INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (thread_id) REFERENCES threads(id)
    );
  `)

  const columnMap = {
    square_feet: "INTEGER NOT NULL DEFAULT 0",
    property_type: "TEXT NOT NULL DEFAULT 'Apartment'",
    images_json: "TEXT NOT NULL DEFAULT '[]'",
    amenities_json: "TEXT NOT NULL DEFAULT '[]'",
    utilities_included: "INTEGER NOT NULL DEFAULT 0",
    pets_allowed: "INTEGER NOT NULL DEFAULT 0",
    parking_available: "INTEGER NOT NULL DEFAULT 0",
    furnished: "INTEGER NOT NULL DEFAULT 0",
    available_until: "TEXT",
    owner_name: "TEXT NOT NULL DEFAULT ''",
    owner_email: "TEXT NOT NULL DEFAULT ''",
    owner_phone: "TEXT NOT NULL DEFAULT ''",
    owner_user_id: "INTEGER",
    status: "TEXT NOT NULL DEFAULT 'available'",
    lat: "REAL NOT NULL DEFAULT 0",
    lng: "REAL NOT NULL DEFAULT 0",
  }

  const columns = new Set(
    db.prepare("PRAGMA table_info(listings)").all().map((col) => col.name),
  )
  db.hasSqft = columns.has('sqft')

  for (const [name, definition] of Object.entries(columnMap)) {
    if (!columns.has(name)) {
      db.exec(`ALTER TABLE listings ADD COLUMN ${name} ${definition}`)
    }
  }

  if (columns.has('sqft') && !columns.has('square_feet')) {
    db.exec("UPDATE listings SET square_feet = sqft WHERE square_feet = 0")
  }

  ensureColumns(db, 'applications', {
    applicant_user_id: 'INTEGER',
  })

  ensureColumns(db, 'threads', {
    owner_user_id: 'INTEGER',
  })

  ensureColumns(db, 'messages', {
    sender_user_id: 'INTEGER',
  })

  ensureColumns(db, 'login_events', {
    user_id: 'INTEGER',
  })

  const count = db.prepare('SELECT COUNT(*) as count FROM listings').get().count
  if (count === 0) {
    const insert = db.prepare(`
      INSERT INTO listings (
        title,
        address,
        city,
        price,
        bedrooms,
        bathrooms,
        square_feet,
        property_type,
        images_json,
        amenities_json,
        utilities_included,
        pets_allowed,
        parking_available,
        furnished,
        available_from,
        available_until,
        owner_name,
        owner_email,
        owner_phone,
        status,
        lat,
        lng,
        description
      ) VALUES (
        @title,
        @address,
        @city,
        @price,
        @bedrooms,
        @bathrooms,
        @square_feet,
        @property_type,
        @images_json,
        @amenities_json,
        @utilities_included,
        @pets_allowed,
        @parking_available,
        @furnished,
        @available_from,
        @available_until,
        @owner_name,
        @owner_email,
        @owner_phone,
        @status,
        @lat,
        @lng,
        @description
      )
    `)

    const seed = [
      {
        title: 'Sunny Studio Near Campus',
        address: '114 Pine St',
        city: 'Seattle',
        price: 1450,
        bedrooms: 0,
        bathrooms: 1,
        square_feet: 520,
        property_type: 'Studio',
        images_json: JSON.stringify([
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
        ]),
        amenities_json: JSON.stringify(['Laundry', 'Furnished']),
        utilities_included: 1,
        pets_allowed: 0,
        parking_available: 0,
        furnished: 1,
        available_from: '2026-01-10',
        available_until: null,
        owner_name: 'Campus Lease Team',
        owner_email: 'hello@campuslease.com',
        owner_phone: '555-010-1000',
        status: 'available',
        lat: 47.615,
        lng: -122.335,
        description: 'Walkable to campus, includes utilities, and has in-unit laundry.',
      },
      {
        title: 'Two Bedroom with Parking',
        address: '820 8th Ave',
        city: 'Seattle',
        price: 2450,
        bedrooms: 2,
        bathrooms: 1.5,
        square_feet: 980,
        property_type: 'Apartment',
        images_json: JSON.stringify([
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
        ]),
        amenities_json: JSON.stringify(['Parking', 'Gym']),
        utilities_included: 0,
        pets_allowed: 1,
        parking_available: 1,
        furnished: 0,
        available_from: '2026-02-01',
        available_until: null,
        owner_name: 'Campus Lease Team',
        owner_email: 'hello@campuslease.com',
        owner_phone: '555-010-1000',
        status: 'available',
        lat: 47.61,
        lng: -122.333,
        description: 'Reserved parking, updated kitchen, and a quiet courtyard view.',
      },
      {
        title: 'Room in Shared Townhome',
        address: '67 Cedar Way',
        city: 'Seattle',
        price: 1100,
        bedrooms: 1,
        bathrooms: 1,
        square_feet: 640,
        property_type: 'Townhome',
        images_json: JSON.stringify([
          'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop',
        ]),
        amenities_json: JSON.stringify(['Study Lounge', 'Backyard']),
        utilities_included: 1,
        pets_allowed: 0,
        parking_available: 1,
        furnished: 1,
        available_from: '2026-01-05',
        available_until: null,
        owner_name: 'Campus Lease Team',
        owner_email: 'hello@campuslease.com',
        owner_phone: '555-010-1000',
        status: 'available',
        lat: 47.608,
        lng: -122.337,
        description: 'Furnished room with shared kitchen, close to transit lines.',
      },
    ]

    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(row)
    })
    insertMany(seed)
  }

  return db
}

function ensureColumns(db, table, columnMap) {
  const columns = new Set(
    db.prepare(`PRAGMA table_info(${table})`).all().map((col) => col.name),
  )
  for (const [name, definition] of Object.entries(columnMap)) {
    if (!columns.has(name)) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`)
    }
  }
}
