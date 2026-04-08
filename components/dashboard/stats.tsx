'use client'

import { useTranslation } from '@/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Euro, Clock, AlertTriangle } from 'lucide-react'

interface StatsProps {
  stats: {
    pendingCount: number
    paidCount: number
    overdueCount: number
    thisMonthCount: number
    totalRevenue: number
    pendingAmount: number
  }
}

export function DashboardStats({ stats }: StatsProps) {
  const { t } = useTranslation()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const statCards = [
    {
      title: t('dashboard.invoicesThisMonth'),
      value: stats.thisMonthCount.toString(),
      icon: FileText,
      description: `${stats.paidCount} ${t('invoices.paid').toLowerCase()}`,
    },
    {
      title: t('dashboard.totalRevenue'),
      value: formatCurrency(stats.totalRevenue),
      icon: Euro,
      description: 'Total cumule',
    },
    {
      title: t('dashboard.pendingAmount'),
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      description: `${stats.pendingCount} factures en attente`,
    },
    {
      title: t('dashboard.overdueInvoices'),
      value: stats.overdueCount.toString(),
      icon: AlertTriangle,
      description: stats.overdueCount > 0 ? 'Action requise' : 'Aucun retard',
      variant: stats.overdueCount > 0 ? 'destructive' : 'default',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.variant === 'destructive' && stats.overdueCount > 0 ? 'text-destructive' : ''}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
