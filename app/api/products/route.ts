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
      return NextResponse.json({ products: [] })
    }

    const products = await sql`
      SELECT * FROM products
      WHERE organization_id = ${organizationId}
      ORDER BY name ASC
    `

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching products:', error)
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
      description,
      reference,
      unitPriceHt,
      tvaRate = 20,
      unit = 'unite',
    } = body

    if (!name || unitPriceHt === undefined) {
      return NextResponse.json({ error: 'Name and unit price are required' }, { status: 400 })
    }

    const product = await sql`
      INSERT INTO products (
        organization_id,
        name,
        description,
        reference,
        unit_price_ht,
        tva_rate,
        unit
      )
      VALUES (
        ${organizationId},
        ${name},
        ${description ?? null},
        ${reference ?? null},
        ${unitPriceHt},
        ${tvaRate},
        ${unit}
      )
      RETURNING *
    `

    return NextResponse.json({ product: product[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
