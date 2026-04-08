import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const organizationId = session.user.organization_id
    if (!organizationId) {
      return NextResponse.json({ invoices: [] })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = parseInt(searchParams.get('limit') ?? '20')
    const offset = (page - 1) * limit

    let invoices
    if (status && status !== 'all') {
      invoices = await sql`
        SELECT 
          i.*,
          c.name as client_name,
          c.email as client_email
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.organization_id = ${organizationId}
          AND i.status = ${status}
          ${search ? sql`AND (i.invoice_number ILIKE ${'%' + search + '%'} OR c.name ILIKE ${'%' + search + '%'})` : sql``}
        ORDER BY i.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    } else {
      invoices = await sql`
        SELECT 
          i.*,
          c.name as client_name,
          c.email as client_email
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.organization_id = ${organizationId}
          ${search ? sql`AND (i.invoice_number ILIKE ${'%' + search + '%'} OR c.name ILIKE ${'%' + search + '%'})` : sql``}
        ORDER BY i.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `
    }

    const countResult = await sql`
      SELECT COUNT(*) as total FROM invoices WHERE organization_id = ${organizationId}
    `

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total: Number(countResult[0]?.total ?? 0),
      },
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
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
      clientId,
      invoiceNumber,
      issueDate,
      dueDate,
      items,
      notes,
      terms,
      status = 'draft',
    } = body

    // Calculate totals
    let subtotalHt = 0
    let totalTva = 0

    const processedItems = items.map((item: {
      description: string
      quantity: number
      unitPriceHt: number
      tvaRate: number
      discountPercent?: number
    }, index: number) => {
      const quantity = Number(item.quantity)
      const unitPriceHt = Number(item.unitPriceHt)
      const tvaRate = Number(item.tvaRate)
      const discountPercent = Number(item.discountPercent ?? 0)

      const lineHt = quantity * unitPriceHt * (1 - discountPercent / 100)
      const lineTva = lineHt * (tvaRate / 100)
      const lineTtc = lineHt + lineTva

      subtotalHt += lineHt
      totalTva += lineTva

      return {
        description: item.description,
        quantity,
        unitPriceHt,
        tvaRate,
        discountPercent,
        totalHt: lineHt,
        totalTva: lineTva,
        totalTtc: lineTtc,
        sortOrder: index,
      }
    })

    const totalTtc = subtotalHt + totalTva

    // Create invoice
    const invoice = await sql`
      INSERT INTO invoices (
        organization_id,
        client_id,
        invoice_number,
        status,
        issue_date,
        due_date,
        subtotal_ht,
        total_tva,
        total_ttc,
        notes,
        terms
      )
      VALUES (
        ${organizationId},
        ${clientId ?? null},
        ${invoiceNumber},
        ${status},
        ${issueDate},
        ${dueDate},
        ${subtotalHt},
        ${totalTva},
        ${totalTtc},
        ${notes ?? null},
        ${terms ?? null}
      )
      RETURNING *
    `

    const invoiceId = invoice[0].id

    // Create invoice items
    for (const item of processedItems) {
      await sql`
        INSERT INTO invoice_items (
          invoice_id,
          description,
          quantity,
          unit_price_ht,
          tva_rate,
          discount_percent,
          total_ht,
          total_tva,
          total_ttc,
          sort_order
        )
        VALUES (
          ${invoiceId},
          ${item.description},
          ${item.quantity},
          ${item.unitPriceHt},
          ${item.tvaRate},
          ${item.discountPercent},
          ${item.totalHt},
          ${item.totalTva},
          ${item.totalTtc},
          ${item.sortOrder}
        )
      `
    }

    // Add to status history
    await sql`
      INSERT INTO invoice_status_history (invoice_id, status, changed_by)
      VALUES (${invoiceId}, ${status}, ${session.user.id})
    `

    return NextResponse.json({ invoice: invoice[0] }, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
