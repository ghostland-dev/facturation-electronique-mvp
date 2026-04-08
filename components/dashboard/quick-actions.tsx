'use client'

import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Users, Package, Settings } from 'lucide-react'

export function QuickActions() {
  const { t } = useTranslation()

  const actions = [
    {
      label: t('dashboard.newInvoice'),
      href: '/invoices/new',
      icon: FileText,
      variant: 'default' as const,
    },
    {
      label: t('dashboard.newClient'),
      href: '/clients/new',
      icon: Users,
      variant: 'outline' as const,
    },
    {
      label: t('products.newProduct'),
      href: '/products/new',
      icon: Package,
      variant: 'outline' as const,
    },
    {
      label: t('nav.settings'),
      href: '/settings',
      icon: Settings,
      variant: 'outline' as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.quickActions')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((action) => (
          <Button
            key={action.href}
            variant={action.variant}
            className="w-full justify-start"
            asChild
          >
            <Link href={action.href}>
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  )
}
