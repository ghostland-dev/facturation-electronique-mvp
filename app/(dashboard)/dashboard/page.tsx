import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { DashboardStats } from '@/components/dashboard/stats'
import { RecentInvoices } from '@/components/dashboard/recent-invoices'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) return null

  const organizationId = session.user.organization_id

  // Fetch dashboard stats
  const [invoiceStats, recentInvoices] = await Promise.all([
    organizationId ? sql`
      SELECT 
        COUNT(*) FILTER (WHERE status IN ('draft', 'pending', 'sent', 'delivered')) as pending_count,
        COUNT(*) FILTER (WHERE status = 'paid') as paid_count,
        COUNT(*) FILTER (WHERE status = 'overdue') as overdue_count,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', issue_date) = DATE_TRUNC('month', CURRENT_DATE)) as this_month_count,
        COALESCE(SUM(total_ttc) FILTER (WHERE status = 'paid'), 0) as total_revenue,
        COALESCE(SUM(total_ttc) FILTER (WHERE status IN ('pending', 'sent', 'delivered', 'overdue')), 0) as pending_amount
      FROM invoices
      WHERE organization_id = ${organizationId}
    ` : Promise.resolve([{
      pending_count: 0,
      paid_count: 0,
      overdue_count: 0,
      this_month_count: 0,
      total_revenue: 0,
      pending_amount: 0,
    }]),
    organizationId ? sql`
      SELECT 
        i.*,
        c.name as client_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      WHERE i.organization_id = ${organizationId}
      ORDER BY i.created_at DESC
      LIMIT 5
    ` : Promise.resolve([]),
  ])

  const stats = invoiceStats[0] ?? {
    pending_count: 0,
    paid_count: 0,
    overdue_count: 0,
    this_month_count: 0,
    total_revenue: 0,
    pending_amount: 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-balance">
          {session.user.first_name 
            ? `Bienvenue, ${session.user.first_name}`
            : 'Bienvenue'}
        </h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre activite de facturation
        </p>
      </div>

      <DashboardStats stats={{
        pendingCount: Number(stats.pending_count),
        paidCount: Number(stats.paid_count),
        overdueCount: Number(stats.overdue_count),
        thisMonthCount: Number(stats.this_month_count),
        totalRevenue: Number(stats.total_revenue),
        pendingAmount: Number(stats.pending_amount),
      }} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentInvoices invoices={recentInvoices as Array<{
            id: string
            invoice_number: string
            client_name: string | null
            total_ttc: number
            status: string
            issue_date: Date
            due_date: Date
          }>} />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}
