import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const organizationId = session.user.organization_id

    // Fetch invoice with items and client
    const invoiceResult = await sql`
      SELECT 
        i.*,
        c.name as client_name,
        c.siren as client_siren,
        c.siret as client_siret,
        c.vat_number as client_vat_number,
        c.address_line1 as client_address_line1,
        c.address_line2 as client_address_line2,
        c.postal_code as client_postal_code,
        c.city as client_city,
        c.country as client_country,
        o.name as organization_name,
        o.siren as organization_siren,
        o.siret as organization_siret,
        o.vat_number as organization_vat_number,
        o.address_line1 as organization_address_line1,
        o.address_line2 as organization_address_line2,
        o.postal_code as organization_postal_code,
        o.city as organization_city,
        o.country as organization_country,
        o.email as organization_email,
        o.phone as organization_phone
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN organizations o ON i.organization_id = o.id
      WHERE i.id = ${id} AND i.organization_id = ${organizationId}
    `

    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const invoice = invoiceResult[0]

    const items = await sql`
      SELECT * FROM invoice_items
      WHERE invoice_id = ${id}
      ORDER BY sort_order ASC
    `

    // Generate HTML for PDF (simplified - in production you'd use a proper PDF library)
    const html = generateInvoiceHtml(invoice, items)

    // For now, return HTML that can be printed to PDF
    // In production, you'd use @react-pdf/renderer or similar
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateInvoiceHtml(invoice: Record<string, unknown>, items: Array<Record<string, unknown>>): string {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date as unknown as string))
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${invoice.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #333; padding: 40px; }
    .invoice { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 24px; font-weight: bold; color: #111; }
    .invoice-info { text-align: right; }
    .invoice-number { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .party { width: 45%; }
    .party-label { font-size: 10px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
    .party-name { font-weight: bold; font-size: 14px; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #111; font-size: 10px; text-transform: uppercase; }
    td { padding: 12px 8px; border-bottom: 1px solid #eee; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 250px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
    .total-row.final { border-top: 2px solid #111; font-weight: bold; font-size: 16px; margin-top: 8px; padding-top: 16px; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 10px; color: #666; }
    .terms { margin-top: 30px; padding: 20px; background: #f9f9f9; border-radius: 4px; }
    .terms-title { font-weight: bold; margin-bottom: 8px; }
    @media print {
      body { padding: 0; }
      .invoice { max-width: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="logo">PA-Facture</div>
        <div style="margin-top: 8px;">
          <div>${invoice.organization_name}</div>
          ${invoice.organization_siren ? `<div>SIREN: ${invoice.organization_siren}</div>` : ''}
          ${invoice.organization_vat_number ? `<div>TVA: ${invoice.organization_vat_number}</div>` : ''}
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">Facture ${invoice.invoice_number}</div>
        <div>Date d'emission: ${formatDate(invoice.issue_date as Date)}</div>
        <div>Date d'echeance: ${formatDate(invoice.due_date as Date)}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party">
        <div class="party-label">Emetteur</div>
        <div class="party-name">${invoice.organization_name}</div>
        ${invoice.organization_address_line1 ? `<div>${invoice.organization_address_line1}</div>` : ''}
        ${invoice.organization_postal_code || invoice.organization_city ? `<div>${invoice.organization_postal_code} ${invoice.organization_city}</div>` : ''}
        ${invoice.organization_email ? `<div>${invoice.organization_email}</div>` : ''}
        ${invoice.organization_phone ? `<div>${invoice.organization_phone}</div>` : ''}
      </div>
      <div class="party">
        <div class="party-label">Client</div>
        <div class="party-name">${invoice.client_name || 'Client non defini'}</div>
        ${invoice.client_siren ? `<div>SIREN: ${invoice.client_siren}</div>` : ''}
        ${invoice.client_address_line1 ? `<div>${invoice.client_address_line1}</div>` : ''}
        ${invoice.client_postal_code || invoice.client_city ? `<div>${invoice.client_postal_code} ${invoice.client_city}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%">Description</th>
          <th class="text-right">Quantite</th>
          <th class="text-right">Prix unitaire HT</th>
          <th class="text-right">TVA</th>
          <th class="text-right">Total HT</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${item.description}</td>
            <td class="text-right">${item.quantity}</td>
            <td class="text-right">${formatCurrency(Number(item.unit_price_ht))}</td>
            <td class="text-right">${item.tva_rate}%</td>
            <td class="text-right">${formatCurrency(Number(item.total_ht))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Sous-total HT</span>
        <span>${formatCurrency(Number(invoice.subtotal_ht))}</span>
      </div>
      <div class="total-row">
        <span>TVA</span>
        <span>${formatCurrency(Number(invoice.total_tva))}</span>
      </div>
      <div class="total-row final">
        <span>Total TTC</span>
        <span>${formatCurrency(Number(invoice.total_ttc))}</span>
      </div>
    </div>

    ${invoice.notes ? `
      <div class="terms">
        <div class="terms-title">Notes</div>
        <div>${invoice.notes}</div>
      </div>
    ` : ''}

    ${invoice.terms ? `
      <div class="terms">
        <div class="terms-title">Conditions de paiement</div>
        <div>${invoice.terms}</div>
      </div>
    ` : ''}

    <div class="footer">
      <p>Document genere par PA-Facture - Conforme a la reforme de la facturation electronique 2026</p>
    </div>
  </div>
</body>
</html>
  `
}
