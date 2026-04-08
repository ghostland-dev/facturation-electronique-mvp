import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { InvoicesList } from '@/components/invoices/invoices-list'

export default async function InvoicesPage() {
  const session = await getSession()
  if (!session) return null

  const organizationId = session.user.organization_id

  const invoices = organizationId
    ? await sql`
        SELECT 
          i.*,
          c.name as client_name,
          c.email as client_email
        FROM invoices i
        LEFT JOIN clients c ON i.client_id = c.id
        WHERE i.organization_id = ${organizationId}
        ORDER BY i.created_at DESC
        LIMIT 50
      `
    : []

  return (
    <InvoicesList 
      initialInvoices={invoices as Array<{
        id: string
        invoice_number: string
        client_name: string | null
        client_email: string | null
        status: string
        issue_date: Date
        due_date: Date
        subtotal_ht: number
        total_tva: number
        total_ttc: number
        created_at: Date
      }>} 
    />
  )
}
