import { cookies } from 'next/headers'
import { sql, type User, type Session } from './db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SESSION_COOKIE_NAME = 'pa_session'
const SESSION_DURATION_DAYS = 30

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(userId: string, ipAddress?: string, userAgent?: string): Promise<Session> {
  const token = generateSessionToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  const result = await sql`
    INSERT INTO sessions (user_id, token, expires_at, ip_address, user_agent)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()}, ${ipAddress ?? null}, ${userAgent ?? null})
    RETURNING *
  `

  // Update last login
  await sql`UPDATE users SET last_login_at = NOW() WHERE id = ${userId}`

  return result[0] as Session
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionToken) {
    return null
  }

  const result = await sql`
    SELECT 
      s.*,
      u.id as user_id,
      u.organization_id,
      u.email,
      u.password_hash,
      u.first_name,
      u.last_name,
      u.role,
      u.locale,
      u.is_active,
      u.email_verified_at,
      u.two_factor_enabled,
      u.two_factor_secret,
      u.last_login_at,
      u.created_at as user_created_at,
      u.updated_at as user_updated_at
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ${sessionToken}
      AND s.expires_at > NOW()
      AND u.is_active = true
  `

  if (result.length === 0) {
    return null
  }

  const row = result[0]
  
  const session: Session = {
    id: row.id as string,
    user_id: row.user_id as string,
    token: row.token as string,
    expires_at: row.expires_at as Date,
    ip_address: row.ip_address as string | null,
    user_agent: row.user_agent as string | null,
    created_at: row.created_at as Date,
  }

  const user: User = {
    id: row.user_id as string,
    organization_id: row.organization_id as string | null,
    email: row.email as string,
    password_hash: row.password_hash as string,
    first_name: row.first_name as string | null,
    last_name: row.last_name as string | null,
    role: row.role as User['role'],
    locale: row.locale as string,
    is_active: row.is_active as boolean,
    email_verified_at: row.email_verified_at as Date | null,
    two_factor_enabled: row.two_factor_enabled as boolean,
    two_factor_secret: row.two_factor_secret as string | null,
    last_login_at: row.last_login_at as Date | null,
    created_at: row.user_created_at as Date,
    updated_at: row.user_updated_at as Date,
  }

  return { user, session }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (sessionToken) {
    await sql`DELETE FROM sessions WHERE token = ${sessionToken}`
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
  return result.length > 0 ? (result[0] as User) : null
}

export async function createUser(data: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  organizationId?: string
  role?: User['role']
  locale?: string
}): Promise<User> {
  const passwordHash = await hashPassword(data.password)
  
  const result = await sql`
    INSERT INTO users (
      email, 
      password_hash, 
      first_name, 
      last_name, 
      organization_id,
      role,
      locale
    )
    VALUES (
      ${data.email.toLowerCase()}, 
      ${passwordHash}, 
      ${data.firstName ?? null}, 
      ${data.lastName ?? null},
      ${data.organizationId ?? null},
      ${data.role ?? 'member'},
      ${data.locale ?? 'fr'}
    )
    RETURNING *
  `

  return result[0] as User
}

export async function createOrganization(data: {
  name: string
  siren?: string
  siret?: string
  email?: string
}): Promise<{ id: string }> {
  const result = await sql`
    INSERT INTO organizations (name, siren, siret, email)
    VALUES (${data.name}, ${data.siren ?? null}, ${data.siret ?? null}, ${data.email ?? null})
    RETURNING id
  `
  return result[0] as { id: string }
}

export function requireAuth() {
  return async function() {
    const session = await getSession()
    if (!session) {
      throw new Error('Unauthorized')
    }
    return session
  }
}
