import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { InvoiceForm } from '@/components/invoices/invoice-form'

export default async function NewInvoicePage() {
  const session = await getSession()
  if (!session) return null

  const organizationId = session.user.organization_id

  // Fetch clients for the dropdown
  const clients = organizationId
    ? await sql`
        SELECT id, name, siren, contact_email, payment_terms_days
        FROM clients
        WHERE organization_id = ${organizationId}
        ORDER BY name ASC
      `
    : []

  // Fetch products for quick add
  const products = organizationId
    ? await sql`
        SELECT id, name, description, reference, unit_price_ht, tva_rate, unit
        FROM products
        WHERE organization_id = ${organizationId} AND is_active = true
        ORDER BY name ASC
      `
    : []

  // Generate next invoice number
  const lastInvoice = organizationId
    ? await sql`
        SELECT invoice_number 
        FROM invoices 
        WHERE organization_id = ${organizationId}
        ORDER BY created_at DESC 
        LIMIT 1
      `
    : []

  const currentYear = new Date().getFullYear()
  let nextNumber = `FAC-${currentYear}-0001`
  
  if (lastInvoice.length > 0) {
    const lastNum = lastInvoice[0].invoice_number as string
    const match = lastNum.match(/FAC-\d{4}-(\d+)/)
    if (match) {
      const num = parseInt(match[1]) + 1
      nextNumber = `FAC-${currentYear}-${num.toString().padStart(4, '0')}`
    }
  }

  return (
    <InvoiceForm
      clients={clients as Array<{
        id: string
        name: string
        siren: string | null
        contact_email: string | null
        payment_terms_days: number
      }>}
      products={products as Array<{
        id: string
        name: string
        description: string | null
        reference: string | null
        unit_price_ht: number
        tva_rate: number
        unit: string
      }>}
      suggestedInvoiceNumber={nextNumber}
    />
  )
}
