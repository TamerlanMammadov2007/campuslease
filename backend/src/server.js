import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import jwt from '@fastify/jwt'
import { randomUUID, scryptSync, timingSafeEqual, randomBytes } from 'node:crypto'
import { createDb } from './db.js'

const app = Fastify({ logger: true })
const db = createDb()
const hasLegacySqft = Boolean(db.hasSqft)

await app.register(cookie)

const jwtSecret = process.env.JWT_SECRET || 'dev-secret'
const adminEmail = process.env.ADMIN_EMAIL || 'tomik20072072@gmail.com'
const adminPassword = process.env.ADMIN_PASSWORD || 'Tomik2007m'
const frontendUrl = process.env.FRONTEND_URL || ''
const cookieSecure =
  process.env.COOKIE_SECURE === 'true' ||
  (frontendUrl && !frontendUrl.includes('localhost') && !frontendUrl.includes('127.0.0.1'))
const cookieSameSite = cookieSecure ? 'none' : 'lax'

await app.register(jwt, {
  secret: jwtSecret,
  cookie: {
    cookieName: 'campuslease_token',
    signed: false,
  },
  sign: {
    expiresIn: '7d',
  },
})

const cookieOptions = {
  path: '/',
  httpOnly: true,
  sameSite: cookieSameSite,
  secure: cookieSecure,
}

const clearCookieOptions = {
  path: '/',
  sameSite: cookieSameSite,
  secure: cookieSecure,
}

const corsOrigins = frontendUrl
  ? frontendUrl.split(',').map((entry) => entry.trim()).filter(Boolean)
  : true

await app.register(cors, { origin: corsOrigins, credentials: true })

app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.decorate('requireAdmin', async (request, reply) => {
  const adminUser = getAdminUser(request)
  if (!adminUser) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
  if (adminUser.role !== 'admin' || adminUser.email !== adminEmail) {
    return reply.code(403).send({ error: 'Forbidden' })
  }
})

app.get('/api/health', async () => ({ ok: true }))

app.get('/api/auth/me', async (request, reply) => {
  try {
    await request.jwtVerify()
    return request.user
  } catch {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
})

app.post('/api/auth/register', async (request, reply) => {
  const payload = normalizeAuthPayload(request.body)
  const errors = validateAuthPayload(payload)
  if (errors.length > 0) {
    return reply.code(400).send({ error: 'Invalid payload', details: errors })
  }

  const passwordHash = hashPassword(payload.password)
  try {
    const info = db
      .prepare(
        `INSERT INTO users (name, email, password_hash) VALUES (@name, @email, @password_hash)`,
      )
      .run({
        name: payload.name,
        email: payload.email,
        password_hash: passwordHash,
      })
    const user = { id: String(info.lastInsertRowid), name: payload.name, email: payload.email }
    db.prepare(
      'INSERT INTO login_events (user_id, email, event_type) VALUES (?, ?, ?)',
    ).run(Number(user.id), user.email, 'register')
  const token = app.jwt.sign(user)
  reply
      .setCookie('campuslease_token', token, cookieOptions)
      .code(201)
      .send(user)
  } catch (error) {
    const message =
      error && error.code === 'SQLITE_CONSTRAINT_UNIQUE'
        ? 'Email already registered'
        : 'Registration failed'
    return reply.code(400).send({ error: message })
  }
})

app.post('/api/auth/login', async (request, reply) => {
  const payload = normalizeLoginPayload(request.body)
  const errors = validateLoginPayload(payload)
  if (errors.length > 0) {
    return reply.code(400).send({ error: 'Invalid payload', details: errors })
  }

  const user = db
    .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
    .get(payload.email)

  if (!user || !verifyPassword(payload.password, user.password_hash)) {
    return reply.code(401).send({ error: 'Invalid email or password' })
  }

  const safeUser = { id: String(user.id), name: user.name, email: user.email }
  db.prepare(
    'INSERT INTO login_events (user_id, email, event_type) VALUES (?, ?, ?)',
  ).run(Number(user.id), user.email, 'login')
  const token = app.jwt.sign(safeUser)
  reply.setCookie('campuslease_token', token, cookieOptions)
  return safeUser
})

app.post('/api/auth/logout', async (request, reply) => {
  reply.clearCookie('campuslease_token', clearCookieOptions)
  return { ok: true }
})

app.get('/api/admin/me', async (request, reply) => {
  const adminUser = getAdminUser(request)
  if (!adminUser) {
    return reply.code(401).send({ error: 'Unauthorized' })
  }
  if (adminUser.role !== 'admin' || adminUser.email !== adminEmail) {
    return reply.code(403).send({ error: 'Forbidden' })
  }
  return adminUser
})

app.post('/api/admin/login', async (request, reply) => {
  const email = request.body?.email?.trim?.()
  const password = request.body?.password
  if (!email || !password) {
    return reply.code(400).send({ error: 'Email and password are required' })
  }
  if (email !== adminEmail || password !== adminPassword) {
    reply.clearCookie('campuslease_admin', { path: '/' })
    return reply.code(401).send({ error: 'Invalid admin credentials' })
  }
  const adminUser = { email: adminEmail, role: 'admin' }
  const token = app.jwt.sign(adminUser)
  reply.setCookie('campuslease_admin', token, cookieOptions)
  return adminUser
})

app.post('/api/admin/logout', async (request, reply) => {
  reply.clearCookie('campuslease_admin', clearCookieOptions)
  return { ok: true }
})

app.get('/api/admin/stats', { preHandler: app.requireAdmin }, async () => {
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count
  const listings = db.prepare('SELECT COUNT(*) as count FROM listings').get().count
  const applications = db.prepare('SELECT COUNT(*) as count FROM applications').get().count
  const threads = db.prepare('SELECT COUNT(*) as count FROM threads').get().count
  const messages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count
  return { users, listings, applications, threads, messages }
})

app.get('/api/admin/users', { preHandler: app.requireAdmin }, async () => {
  return db
    .prepare('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC')
    .all()
})

app.get('/api/admin/listings', { preHandler: app.requireAdmin }, async () => {
  const rows = db.prepare('SELECT * FROM listings ORDER BY created_at DESC').all()
  return rows.map(rowToListing)
})

app.get('/api/admin/applications', { preHandler: app.requireAdmin }, async () => {
  return db
    .prepare(
      `SELECT applications.*, listings.title AS listing_title
       FROM applications
       LEFT JOIN listings ON listings.id = applications.listing_id
       ORDER BY applications.created_at DESC`,
    )
    .all()
})

app.get('/api/admin/threads', { preHandler: app.requireAdmin }, async () => {
  const threads = db.prepare('SELECT * FROM threads ORDER BY updated_at DESC').all()
  if (threads.length === 0) return []

  const placeholders = threads.map(() => '?').join(', ')
  const threadIds = threads.map((thread) => thread.id)
  const messages = db
    .prepare(`SELECT * FROM messages WHERE thread_id IN (${placeholders}) ORDER BY created_at ASC`)
    .all(...threadIds)

  const grouped = groupMessages(messages)
  return threads.map((thread) => rowToThread(thread, grouped[thread.id] ?? []))
})

app.get('/api/admin/login-events', { preHandler: app.requireAdmin }, async () => {
  return db
    .prepare(
      `SELECT id, user_id, email, event_type, created_at
       FROM login_events
       ORDER BY created_at DESC
       LIMIT 100`,
    )
    .all()
})

app.put('/api/admin/listings/:id', { preHandler: app.requireAdmin }, async (request, reply) => {
  const id = Number(request.params.id)
  if (!Number.isFinite(id)) {
    return reply.code(400).send({ error: 'Invalid listing id' })
  }

  const existing = db.prepare('SELECT * FROM listings WHERE id = ?').get(id)
  if (!existing) {
    return reply.code(404).send({ error: 'Listing not found' })
  }

  const base = rowToListing(existing)
  const body = request.body ?? {}
  const merged = {
    ...base,
    ...body,
    owner: { ...base.owner, ...(body.owner ?? {}) },
    coordinates: { ...base.coordinates, ...(body.coordinates ?? {}) },
  }

  const payload = normalizeListingPayload(merged)
  const errors = validateListingPayload(payload)
  if (errors.length > 0) {
    return reply.code(400).send({ error: 'Invalid payload', details: errors })
  }

  const stmt = db.prepare(
    hasLegacySqft
      ? `
        UPDATE listings
        SET
          title = @title,
          address = @address,
          city = @city,
          price = @price,
          bedrooms = @bedrooms,
          bathrooms = @bathrooms,
          square_feet = @square_feet,
          sqft = @sqft,
          property_type = @property_type,
          images_json = @images_json,
          amenities_json = @amenities_json,
          utilities_included = @utilities_included,
          pets_allowed = @pets_allowed,
          parking_available = @parking_available,
          furnished = @furnished,
          available_from = @available_from,
          available_until = @available_until,
          owner_name = @owner_name,
          owner_email = @owner_email,
          owner_phone = @owner_phone,
          status = @status,
          lat = @lat,
          lng = @lng,
          description = @description,
          updated_at = datetime('now')
        WHERE id = @id
      `
      : `
        UPDATE listings
        SET
          title = @title,
          address = @address,
          city = @city,
          price = @price,
          bedrooms = @bedrooms,
          bathrooms = @bathrooms,
          square_feet = @square_feet,
          property_type = @property_type,
          images_json = @images_json,
          amenities_json = @amenities_json,
          utilities_included = @utilities_included,
          pets_allowed = @pets_allowed,
          parking_available = @parking_available,
          furnished = @furnished,
          available_from = @available_from,
          available_until = @available_until,
          owner_name = @owner_name,
          owner_email = @owner_email,
          owner_phone = @owner_phone,
          status = @status,
          lat = @lat,
          lng = @lng,
          description = @description,
          updated_at = datetime('now')
        WHERE id = @id
      `,
  )

  const info = stmt.run({ ...listingParams(payload, existing.owner_user_id), id })
  if (info.changes === 0) {
    return reply.code(404).send({ error: 'Listing not found' })
  }

  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(id)
  return rowToListing(row)
})

app.delete('/api/admin/listings/:id', { preHandler: app.requireAdmin }, async (request, reply) => {
  const id = Number(request.params.id)
  if (!Number.isFinite(id)) {
    return reply.code(400).send({ error: 'Invalid listing id' })
  }

  const deleteListing = db.transaction((listingId) => {
    db.prepare('DELETE FROM applications WHERE listing_id = ?').run(listingId)
    const threads = db
      .prepare('SELECT id FROM threads WHERE property_id = ?')
      .all(listingId)
      .map((row) => row.id)
    if (threads.length) {
      const placeholders = threads.map(() => '?').join(', ')
      db.prepare(`DELETE FROM messages WHERE thread_id IN (${placeholders})`).run(...threads)
    }
    db.prepare('DELETE FROM threads WHERE property_id = ?').run(listingId)
    return db.prepare('DELETE FROM listings WHERE id = ?').run(listingId)
  })

  const info = deleteListing(id)
  if (info.changes === 0) {
    return reply.code(404).send({ error: 'Listing not found' })
  }
  return reply.code(204).send()
})

app.put('/api/admin/users/:id', { preHandler: app.requireAdmin }, async (request, reply) => {
  const id = Number(request.params.id)
  if (!Number.isFinite(id)) {
    return reply.code(400).send({ error: 'Invalid user id' })
  }

  const existing = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(id)
  if (!existing) {
    return reply.code(404).send({ error: 'User not found' })
  }

  const name = request.body?.name?.trim?.() ?? existing.name
  const email = request.body?.email?.trim?.().toLowerCase?.() ?? existing.email
  const password = request.body?.password

  if (!name) {
    return reply.code(400).send({ error: 'Name is required' })
  }
  if (!email || !email.includes('@')) {
    return reply.code(400).send({ error: 'Email is invalid' })
  }

  try {
    if (password && password.length < 8) {
      return reply.code(400).send({ error: 'Password must be at least 8 characters' })
    }

    if (password) {
      const hash = hashPassword(password)
      db.prepare(
        'UPDATE users SET name = ?, email = ?, password_hash = ? WHERE id = ?',
      ).run(name, email, hash, id)
    } else {
      db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?').run(name, email, id)
    }
  } catch (error) {
    const message =
      error && error.code === 'SQLITE_CONSTRAINT_UNIQUE'
        ? 'Email already registered'
        : 'Failed to update user'
    return reply.code(400).send({ error: message })
  }

  const updated = db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?').get(id)
  return updated
})

app.get('/api/listings', async (request, reply) => {
  const { city, minPrice, maxPrice, bedrooms } = request.query

  const filters = []
  const params = {}
  const errors = []

  if (city) {
    filters.push('city = @city')
    params.city = String(city).trim()
  }
  if (minPrice !== undefined) {
    const value = Number(minPrice)
    if (Number.isFinite(value)) {
      filters.push('price >= @minPrice')
      params.minPrice = value
    } else {
      errors.push('minPrice must be a number')
    }
  }
  if (maxPrice !== undefined) {
    const value = Number(maxPrice)
    if (Number.isFinite(value)) {
      filters.push('price <= @maxPrice')
      params.maxPrice = value
    } else {
      errors.push('maxPrice must be a number')
    }
  }
  if (bedrooms !== undefined) {
    const value = Number(bedrooms)
    if (Number.isFinite(value)) {
      filters.push('bedrooms = @bedrooms')
      params.bedrooms = value
    } else {
      errors.push('bedrooms must be a number')
    }
  }

  if (errors.length) {
    return reply.code(400).send({ error: 'Invalid query', details: errors })
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : ''
  const rows = db.prepare(`SELECT * FROM listings ${where} ORDER BY created_at DESC`).all(params)

  return rows.map(rowToListing)
})

app.get('/api/listings/:id', async (request, reply) => {
  const id = Number(request.params.id)
  if (!Number.isFinite(id)) {
    return reply.code(400).send({ error: 'Invalid listing id' })
  }
  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(id)
  if (!row) {
    return reply.code(404).send({ error: 'Listing not found' })
  }
  return rowToListing(row)
})

app.post('/api/listings', { preHandler: app.authenticate }, async (request, reply) => {
  const payload = normalizeListingPayload(request.body)
  const authUser = request.user
  const owner = {
    name: authUser.name,
    email: authUser.email,
    phone: payload.owner.phone,
  }
  payload.owner = owner

  const errors = validateListingPayload(payload)
  if (errors.length > 0) {
    return reply.code(400).send({ error: 'Invalid payload', details: errors })
  }

  const stmt = db.prepare(
    hasLegacySqft
      ? `
        INSERT INTO listings (
          title,
          address,
          city,
          price,
          bedrooms,
          bathrooms,
          square_feet,
          sqft,
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
          owner_user_id,
          status,
          lat,
          lng,
          description,
          created_at,
          updated_at
        ) VALUES (
          @title,
          @address,
          @city,
          @price,
          @bedrooms,
          @bathrooms,
          @square_feet,
          @sqft,
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
          @owner_user_id,
          @status,
          @lat,
          @lng,
          @description,
          datetime('now'),
          datetime('now')
        )
      `
      : `
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
          owner_user_id,
          status,
          lat,
          lng,
          description,
          created_at,
          updated_at
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
          @owner_user_id,
          @status,
          @lat,
          @lng,
          @description,
          datetime('now'),
          datetime('now')
        )
      `,
  )

  const info = stmt.run(listingParams(payload, authUser.id))
  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(info.lastInsertRowid)
  return reply.code(201).send(rowToListing(row))
})

app.put('/api/listings/:id', { preHandler: app.authenticate }, async (request, reply) => {
  const payload = normalizeListingPayload(request.body)
  const errors = validateListingPayload(payload)
  if (errors.length > 0) {
    return reply.code(400).send({ error: 'Invalid payload', details: errors })
  }

  const id = Number(request.params.id)
  if (!Number.isFinite(id)) {
    return reply.code(400).send({ error: 'Invalid listing id' })
  }

  const existing = db.prepare('SELECT owner_user_id FROM listings WHERE id = ?').get(id)
  if (!existing) {
    return reply.code(404).send({ error: 'Listing not found' })
  }
  if (existing.owner_user_id && Number(existing.owner_user_id) !== Number(request.user.id)) {
    return reply.code(403).send({ error: 'Not allowed to update this listing' })
  }

  const authUser = request.user
  payload.owner = {
    name: authUser.name,
    email: authUser.email,
    phone: payload.owner.phone,
  }
  const stmt = db.prepare(
    hasLegacySqft
      ? `
        UPDATE listings
        SET
          title = @title,
          address = @address,
          city = @city,
          price = @price,
          bedrooms = @bedrooms,
          bathrooms = @bathrooms,
          square_feet = @square_feet,
          sqft = @sqft,
          property_type = @property_type,
          images_json = @images_json,
          amenities_json = @amenities_json,
          utilities_included = @utilities_included,
          pets_allowed = @pets_allowed,
          parking_available = @parking_available,
          furnished = @furnished,
          available_from = @available_from,
          available_until = @available_until,
          owner_name = @owner_name,
          owner_email = @owner_email,
          owner_phone = @owner_phone,
          status = @status,
          lat = @lat,
          lng = @lng,
          description = @description,
          updated_at = datetime('now')
        WHERE id = @id
      `
      : `
        UPDATE listings
        SET
          title = @title,
          address = @address,
          city = @city,
          price = @price,
          bedrooms = @bedrooms,
          bathrooms = @bathrooms,
          square_feet = @square_feet,
          property_type = @property_type,
          images_json = @images_json,
          amenities_json = @amenities_json,
          utilities_included = @utilities_included,
          pets_allowed = @pets_allowed,
          parking_available = @parking_available,
          furnished = @furnished,
          available_from = @available_from,
          available_until = @available_until,
          owner_name = @owner_name,
          owner_email = @owner_email,
          owner_phone = @owner_phone,
          status = @status,
          lat = @lat,
          lng = @lng,
          description = @description,
          updated_at = datetime('now')
        WHERE id = @id
      `,
  )

  const info = stmt.run({ ...listingParams(payload, request.user.id), id })
  if (info.changes === 0) {
    return reply.code(404).send({ error: 'Listing not found' })
  }

  const row = db.prepare('SELECT * FROM listings WHERE id = ?').get(id)
  return rowToListing(row)
})

app.delete('/api/listings/:id', { preHandler: app.authenticate }, async (request, reply) => {
  const id = Number(request.params.id)
  if (!Number.isFinite(id)) {
    return reply.code(400).send({ error: 'Invalid listing id' })
  }

  const existing = db.prepare('SELECT owner_user_id FROM listings WHERE id = ?').get(id)
  if (!existing) {
    return reply.code(404).send({ error: 'Listing not found' })
  }
  if (existing.owner_user_id && Number(existing.owner_user_id) !== Number(request.user.id)) {
    return reply.code(403).send({ error: 'Not allowed to delete this listing' })
  }

  const deleteListing = db.transaction((listingId) => {
    db.prepare('DELETE FROM applications WHERE listing_id = ?').run(listingId)
    const threads = db
      .prepare('SELECT id FROM threads WHERE property_id = ?')
      .all(listingId)
      .map((row) => row.id)
    if (threads.length) {
      const placeholders = threads.map(() => '?').join(', ')
      db.prepare(`DELETE FROM messages WHERE thread_id IN (${placeholders})`).run(...threads)
    }
    db.prepare('DELETE FROM threads WHERE property_id = ?').run(listingId)
    return db.prepare('DELETE FROM listings WHERE id = ?').run(listingId)
  })

  const info = deleteListing(id)
  if (info.changes === 0) {
    return reply.code(404).send({ error: 'Listing not found' })
  }
  return reply.code(204).send()
})

app.post('/api/applications', { preHandler: app.authenticate }, async (request, reply) => {
  const payload = normalizeApplicationPayload(request.body)
  const authUser = request.user
  payload.name = authUser.name
  payload.email = authUser.email

  const errors = validateApplicationPayload(payload)
  if (errors.length > 0) {
    return reply.code(400).send({ error: 'Invalid payload', details: errors })
  }

  const listing = db.prepare('SELECT id FROM listings WHERE id = ?').get(payload.listingId)
  if (!listing) {
    return reply.code(404).send({ error: 'Listing not found' })
  }

  const stmt = db.prepare(`
    INSERT INTO applications (
      listing_id,
      name,
      email,
      phone,
      message,
      applicant_user_id
    ) VALUES (
      @listing_id,
      @name,
      @email,
      @phone,
      @message,
      @applicant_user_id
    )
  `)

  const info = stmt.run({
    listing_id: payload.listingId,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    message: payload.message,
    applicant_user_id: Number(authUser.id),
  })

  const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(info.lastInsertRowid)
  return reply.code(201).send(row)
})

app.get('/api/applications', { preHandler: app.authenticate }, async (request) => {
  const { listingId } = request.query
  const userId = Number(request.user.id)
  if (!listingId) {
    return db
      .prepare('SELECT * FROM applications WHERE applicant_user_id = ? ORDER BY created_at DESC')
      .all(userId)
  }
  return db
    .prepare(
      'SELECT * FROM applications WHERE listing_id = ? AND applicant_user_id = ? ORDER BY created_at DESC',
    )
    .all(Number(listingId), userId)
})

app.get('/api/threads', { preHandler: app.authenticate }, async (request) => {
  const userId = Number(request.user.id)
  const threads = db
    .prepare('SELECT * FROM threads WHERE owner_user_id = ? ORDER BY updated_at DESC')
    .all(userId)
  if (threads.length === 0) return []

  const placeholders = threads.map(() => '?').join(', ')
  const threadIds = threads.map((thread) => thread.id)
  const messages = db
    .prepare(`SELECT * FROM messages WHERE thread_id IN (${placeholders}) ORDER BY created_at ASC`)
    .all(...threadIds)

  const grouped = groupMessages(messages)
  return threads.map((thread) => rowToThread(thread, grouped[thread.id] ?? []))
})

app.get('/api/threads/:id', { preHandler: app.authenticate }, async (request, reply) => {
  const thread = db
    .prepare('SELECT * FROM threads WHERE id = ? AND owner_user_id = ?')
    .get(request.params.id, Number(request.user.id))
  if (!thread) {
    return reply.code(404).send({ error: 'Thread not found' })
  }
  const messages = db
    .prepare('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC')
    .all(thread.id)
  return rowToThread(thread, messages)
})

app.post('/api/threads', { preHandler: app.authenticate }, async (request, reply) => {
  const payload = normalizeThreadPayload(request.body)
  payload.senderName = request.user.name
  payload.senderEmail = request.user.email
  const errors = validateThreadPayload(payload)
  if (errors.length > 0) {
    return reply.code(400).send({ error: 'Invalid payload', details: errors })
  }

  const threadId = payload.id ?? `thread-${randomUUID()}`
  if (payload.propertyId) {
    const listing = db
      .prepare('SELECT id FROM listings WHERE id = ?')
      .get(Number(payload.propertyId))
    if (!listing) {
      return reply.code(404).send({ error: 'Listing not found' })
    }
  }

  const createThreadWithMessage = db.transaction(() => {
    db.prepare(`
      INSERT INTO threads (
        id,
        property_id,
        property_title,
        participant_name,
        participant_email,
        owner_user_id,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @property_id,
        @property_title,
        @participant_name,
        @participant_email,
        @owner_user_id,
        datetime('now'),
        datetime('now')
      )
    `).run({
      id: threadId,
      property_id: payload.propertyId ? Number(payload.propertyId) : null,
      property_title: payload.propertyTitle || null,
      participant_name: payload.participantName,
      participant_email: payload.participantEmail,
      owner_user_id: Number(request.user.id),
    })

    const messageId = `msg-${randomUUID()}`
    db.prepare(`
      INSERT INTO messages (
        id,
        thread_id,
        sender,
        sender_email,
        recipient,
        recipient_email,
        content,
        sender_user_id,
        created_at,
        read
      ) VALUES (
        @id,
        @thread_id,
        @sender,
        @sender_email,
        @recipient,
        @recipient_email,
        @content,
        @sender_user_id,
        datetime('now'),
        1
      )
    `).run({
      id: messageId,
      thread_id: threadId,
      sender: payload.senderName,
      sender_email: payload.senderEmail,
      recipient: payload.participantName,
      recipient_email: payload.participantEmail,
      content: payload.message,
      sender_user_id: Number(request.user.id),
    })
  })

  createThreadWithMessage()

  const thread = db.prepare('SELECT * FROM threads WHERE id = ?').get(threadId)
  const messages = db
    .prepare('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC')
    .all(threadId)
  return reply.code(201).send(rowToThread(thread, messages))
})

app.post(
  '/api/threads/:id/messages',
  { preHandler: app.authenticate },
  async (request, reply) => {
    const payload = normalizeMessagePayload(request.body)
    const errors = validateMessagePayload(payload)
    if (errors.length > 0) {
      return reply.code(400).send({ error: 'Invalid payload', details: errors })
    }

    const thread = db
      .prepare('SELECT * FROM threads WHERE id = ? AND owner_user_id = ?')
      .get(request.params.id, Number(request.user.id))
  if (!thread) {
    return reply.code(404).send({ error: 'Thread not found' })
  }

  const messageId = `msg-${randomUUID()}`
    db.prepare(`
    INSERT INTO messages (
      id,
      thread_id,
      sender,
      sender_email,
      recipient,
      recipient_email,
      content,
      sender_user_id,
      created_at,
      read
    ) VALUES (
      @id,
      @thread_id,
      @sender,
      @sender_email,
      @recipient,
      @recipient_email,
      @content,
      @sender_user_id,
      datetime('now'),
      1
    )
  `).run({
      id: messageId,
      thread_id: thread.id,
      sender: request.user.name,
      sender_email: request.user.email,
      recipient: thread.participant_name,
      recipient_email: thread.participant_email,
      content: payload.content,
      sender_user_id: Number(request.user.id),
    })

    db.prepare(`UPDATE threads SET updated_at = datetime('now') WHERE id = ?`).run(thread.id)

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(messageId)
    return reply.code(201).send(rowToMessage(message))
  },
)

app.post('/api/threads/:id/read', { preHandler: app.authenticate }, async (request, reply) => {
  const thread = db
    .prepare('SELECT id FROM threads WHERE id = ? AND owner_user_id = ?')
    .get(request.params.id, Number(request.user.id))
  if (!thread) {
    return reply.code(404).send({ error: 'Thread not found' })
  }
  db.prepare('UPDATE messages SET read = 1 WHERE thread_id = ? AND read = 0').run(thread.id)
  return reply.send({ ok: true })
})

function normalizeAuthPayload(body) {
  return {
    name: body?.name?.trim?.() ?? '',
    email: body?.email?.trim?.().toLowerCase?.() ?? '',
    password: body?.password ?? '',
  }
}

function validateAuthPayload(payload) {
  const errors = []
  if (!payload.name) errors.push('name is required')
  if (!payload.email || !payload.email.includes('@')) errors.push('email is invalid')
  if (!payload.password || payload.password.length < 8) {
    errors.push('password must be at least 8 characters')
  }
  return errors
}

function normalizeLoginPayload(body) {
  return {
    email: body?.email?.trim?.().toLowerCase?.() ?? '',
    password: body?.password ?? '',
  }
}

function validateLoginPayload(payload) {
  const errors = []
  if (!payload.email || !payload.email.includes('@')) errors.push('email is invalid')
  if (!payload.password) errors.push('password is required')
  return errors
}

function normalizeListingPayload(body) {
  const owner = body?.owner ?? {}
  const coordinates = body?.coordinates ?? {}
  return {
    title: body?.title?.trim?.() ?? '',
    address: body?.address?.trim?.() ?? '',
    city: body?.city?.trim?.() ?? '',
    price: parseNumber(body?.price),
    bedrooms: parseNumber(body?.bedrooms),
    bathrooms: parseNumber(body?.bathrooms),
    squareFeet: parseNumber(body?.squareFeet ?? body?.square_feet),
    type: body?.type?.trim?.() ?? body?.property_type?.trim?.() ?? '',
    images: Array.isArray(body?.images) ? body.images : safeJsonArray(body?.images_json),
    amenities: Array.isArray(body?.amenities) ? body.amenities : safeJsonArray(body?.amenities_json),
    utilitiesIncluded: Boolean(body?.utilitiesIncluded ?? body?.utilities_included),
    petsAllowed: Boolean(body?.petsAllowed ?? body?.pets_allowed),
    parkingAvailable: Boolean(body?.parkingAvailable ?? body?.parking_available),
    furnished: Boolean(body?.furnished),
    availableFrom: body?.availableFrom?.trim?.() ?? body?.available_from?.trim?.() ?? '',
    availableUntil: body?.availableUntil?.trim?.() ?? body?.available_until?.trim?.() ?? '',
    owner: {
      name: owner?.name?.trim?.() ?? body?.owner_name?.trim?.() ?? '',
      email: owner?.email?.trim?.() ?? body?.owner_email?.trim?.() ?? '',
      phone: owner?.phone?.trim?.() ?? body?.owner_phone?.trim?.() ?? '',
    },
    status: body?.status?.trim?.() ?? 'available',
    coordinates: {
      lat: parseNumber(coordinates?.lat ?? body?.lat),
      lng: parseNumber(coordinates?.lng ?? body?.lng),
    },
    description: body?.description?.trim?.() ?? '',
  }
}

function validateListingPayload(payload) {
  const errors = []
  if (!payload.title) errors.push('title is required')
  if (!payload.address) errors.push('address is required')
  if (!payload.city) errors.push('city is required')
  if (!Number.isFinite(payload.price) || payload.price <= 0) errors.push('price must be > 0')
  if (!Number.isFinite(payload.bedrooms) || payload.bedrooms < 0) errors.push('bedrooms must be >= 0')
  if (!Number.isFinite(payload.bathrooms) || payload.bathrooms <= 0) errors.push('bathrooms must be > 0')
  if (!Number.isFinite(payload.squareFeet) || payload.squareFeet <= 0) errors.push('squareFeet must be > 0')
  if (!payload.type) errors.push('type is required')
  if (!payload.availableFrom) errors.push('availableFrom is required')
  if (!payload.description) errors.push('description is required')
  return errors
}

function normalizeApplicationPayload(body) {
  return {
    listingId: Number(body?.listingId ?? 0),
    name: body?.name?.trim?.() ?? '',
    email: body?.email?.trim?.() ?? '',
    phone: body?.phone?.trim?.() ?? '',
    message: body?.message?.trim?.() ?? '',
  }
}

function validateApplicationPayload(payload) {
  const errors = []
  if (!Number.isFinite(payload.listingId) || payload.listingId <= 0) {
    errors.push('listingId must be a valid listing id')
  }
  if (!payload.name) errors.push('name is required')
  if (!payload.email || !payload.email.includes('@')) errors.push('email is invalid')
  return errors
}

function normalizeThreadPayload(body) {
  return {
    id: body?.id?.trim?.() ?? undefined,
    propertyId: body?.propertyId?.toString?.(),
    propertyTitle: body?.propertyTitle?.trim?.() ?? undefined,
    participantName: body?.participantName?.trim?.() ?? '',
    participantEmail: body?.participantEmail?.trim?.() ?? '',
    senderName: body?.senderName?.trim?.() ?? '',
    senderEmail: body?.senderEmail?.trim?.() ?? '',
    message: body?.message?.trim?.() ?? '',
  }
}

function validateThreadPayload(payload) {
  const errors = []
  if (payload.propertyId && !Number.isFinite(Number(payload.propertyId))) {
    errors.push('propertyId must be a valid listing id')
  }
  if (!payload.participantName) errors.push('participantName is required')
  if (!payload.participantEmail || !payload.participantEmail.includes('@')) {
    errors.push('participantEmail is invalid')
  }
  if (!payload.senderName) errors.push('senderName is required')
  if (!payload.senderEmail || !payload.senderEmail.includes('@')) {
    errors.push('senderEmail is invalid')
  }
  if (!payload.message) errors.push('message is required')
  return errors
}

function normalizeMessagePayload(body) {
  return {
    content: body?.content?.trim?.() ?? '',
  }
}

function validateMessagePayload(payload) {
  const errors = []
  if (!payload.content) errors.push('content is required')
  return errors
}

function rowToListing(row) {
  return {
    id: String(row.id),
    title: row.title,
    address: row.address,
    city: row.city,
    price: row.price,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    squareFeet: row.square_feet,
    type: row.property_type,
    images: safeJsonArray(row.images_json),
    amenities: safeJsonArray(row.amenities_json),
    utilitiesIncluded: Boolean(row.utilities_included),
    petsAllowed: Boolean(row.pets_allowed),
    parkingAvailable: Boolean(row.parking_available),
    furnished: Boolean(row.furnished),
    availableFrom: row.available_from,
    availableUntil: row.available_until ?? '',
    owner: {
      name: row.owner_name ?? '',
      email: row.owner_email ?? '',
      phone: row.owner_phone ?? '',
    },
    status: row.status ?? 'available',
    coordinates: {
      lat: row.lat ?? 0,
      lng: row.lng ?? 0,
    },
    description: row.description,
    createdDate: row.created_at,
  }
}

function rowToThread(thread, messages) {
  return {
    id: thread.id,
    propertyId: thread.property_id ? String(thread.property_id) : undefined,
    propertyTitle: thread.property_title ?? undefined,
    participantName: thread.participant_name,
    participantEmail: thread.participant_email,
    messages: messages.map(rowToMessage),
  }
}

function rowToMessage(row) {
  return {
    id: row.id,
    threadId: row.thread_id,
    sender: row.sender,
    senderEmail: row.sender_email,
    recipient: row.recipient,
    recipientEmail: row.recipient_email,
    content: row.content,
    createdAt: row.created_at,
    read: Boolean(row.read),
  }
}

function groupMessages(rows) {
  return rows.reduce((acc, row) => {
    if (!acc[row.thread_id]) acc[row.thread_id] = []
    acc[row.thread_id].push(row)
    return acc
  }, Object.create(null))
}

function toDbListing(payload) {
  return {
    title: payload.title,
    address: payload.address,
    city: payload.city,
    price: payload.price,
    bedrooms: payload.bedrooms,
    bathrooms: payload.bathrooms,
    square_feet: payload.squareFeet,
    property_type: payload.type,
    images_json: JSON.stringify(payload.images ?? []),
    amenities_json: JSON.stringify(payload.amenities ?? []),
    utilities_included: payload.utilitiesIncluded ? 1 : 0,
    pets_allowed: payload.petsAllowed ? 1 : 0,
    parking_available: payload.parkingAvailable ? 1 : 0,
    furnished: payload.furnished ? 1 : 0,
    available_from: payload.availableFrom,
    available_until: payload.availableUntil || null,
    owner_name: payload.owner?.name ?? '',
    owner_email: payload.owner?.email ?? '',
    owner_phone: payload.owner?.phone ?? '',
    status: payload.status ?? 'available',
    lat: payload.coordinates?.lat ?? 0,
    lng: payload.coordinates?.lng ?? 0,
    description: payload.description,
  }
}

function listingParams(payload, ownerUserId) {
  const base = toDbListing(payload)
  const params = {
    ...base,
    owner_user_id: Number(ownerUserId),
  }
  if (hasLegacySqft) {
    params.sqft = base.square_feet
  }
  return params
}

function safeJsonArray(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim()
    if (cleaned.length === 0) return 0
    const parsed = Number(cleaned)
    return Number.isFinite(parsed) ? parsed : NaN
  }
  if (value === undefined || value === null) return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : NaN
}

function getAdminUser(request) {
  const token = request.cookies?.campuslease_admin
  if (!token) return null
  try {
    return app.jwt.verify(token)
  } catch {
    return null
  }
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

function verifyPassword(password, stored) {
  const [scheme, salt, hash] = stored.split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const testHash = scryptSync(password, salt, 64)
  const storedHash = Buffer.from(hash, 'hex')
  if (storedHash.length !== testHash.length) return false
  return timingSafeEqual(storedHash, testHash)
}

const port = Number(process.env.PORT || 3001)

app.listen({ port, host: '0.0.0.0' })
