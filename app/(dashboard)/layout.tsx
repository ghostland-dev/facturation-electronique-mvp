import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { I18nProvider } from '@/lib/i18n/context'
import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { DashboardHeader } from '@/components/dashboard/header'
import type { Locale } from '@/lib/i18n/translations'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const user = {
    id: session.user.id,
    email: session.user.email,
    firstName: session.user.first_name,
    lastName: session.user.last_name,
    role: session.user.role,
    locale: session.user.locale as Locale,
    organizationId: session.user.organization_id,
  }

  return (
    <I18nProvider initialLocale={user.locale}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar user={user} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </I18nProvider>
  )
}
