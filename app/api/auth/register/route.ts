import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser, createOrganization, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName, companyName, locale = 'fr' } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 409 }
      )
    }

    // Create organization if company name provided
    let organizationId: string | undefined
    if (companyName) {
      const org = await createOrganization({
        name: companyName,
        email: email,
      })
      organizationId = org.id
    }

    // Create user
    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      organizationId,
      role: organizationId ? 'owner' : 'member',
      locale,
    })

    // Create session
    const ipAddress = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined
    const userAgent = request.headers.get('user-agent') ?? undefined

    const session = await createSession(user.id, ipAddress, userAgent)
    await setSessionCookie(session.token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        locale: user.locale,
        organizationId: user.organization_id,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
