import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { ClientsList } from '@/components/clients/clients-list'

export default async function ClientsPage() {
  const session = await getSession()
  if (!session) return null

  const organizationId = session.user.organization_id

  const clients = organizationId
    ? await sql`
        SELECT 
          c.*,
          COUNT(i.id)::int as invoice_count,
          COALESCE(SUM(i.total_ttc) FILTER (WHERE i.status IN ('pending', 'sent', 'delivered', 'overdue')), 0) as pending_amount
        FROM clients c
        LEFT JOIN invoices i ON c.id = i.client_id
        WHERE c.organization_id = ${organizationId}
        GROUP BY c.id
        ORDER BY c.name ASC
      `
    : []

  return (
    <ClientsList 
      initialClients={clients as Array<{
        id: string
        name: string
        siren: string | null
        siret: string | null
        city: string | null
        contact_email: string | null
        contact_phone: string | null
        is_public_sector: boolean
        invoice_count: number
        pending_amount: number
        created_at: Date
      }>} 
    />
  )
}
