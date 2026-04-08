import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organization_id
    if (!organizationId) {
      return NextResponse.json({ clients: [] })
    }

    const clients = await sql`
      SELECT 
        c.*,
        COUNT(i.id) as invoice_count,
        COALESCE(SUM(i.total_ttc) FILTER (WHERE i.status IN ('pending', 'sent', 'delivered', 'overdue')), 0) as pending_amount
      FROM clients c
      LEFT JOIN invoices i ON c.id = i.client_id
      WHERE c.organization_id = ${organizationId}
      GROUP BY c.id
      ORDER BY c.name ASC
    `

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organization_id
    if (!organizationId) {
      return NextResponse.json({ error: 'No organization' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      siren,
      siret,
      vatNumber,
      addressLine1,
      addressLine2,
      postalCode,
      city,
      country = 'FR',
      contactName,
      contactEmail,
      contactPhone,
      paymentTermsDays = 30,
      notes,
      isPublicSector = false,
      chorusServiceCode,
      chorusEngagementCode,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const client = await sql`
      INSERT INTO clients (
        organization_id,
        name,
        siren,
        siret,
        vat_number,
        address_line1,
        address_line2,
        postal_code,
        city,
        country,
        contact_name,
        contact_email,
        contact_phone,
        payment_terms_days,
        notes,
        is_public_sector,
        chorus_service_code,
        chorus_engagement_code
      )
      VALUES (
        ${organizationId},
        ${name},
        ${siren ?? null},
        ${siret ?? null},
        ${vatNumber ?? null},
        ${addressLine1 ?? null},
        ${addressLine2 ?? null},
        ${postalCode ?? null},
        ${city ?? null},
        ${country},
        ${contactName ?? null},
        ${contactEmail ?? null},
        ${contactPhone ?? null},
        ${paymentTermsDays},
        ${notes ?? null},
        ${isPublicSector},
        ${chorusServiceCode ?? null},
        ${chorusEngagementCode ?? null}
      )
      RETURNING *
    `

    return NextResponse.json({ client: client[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
