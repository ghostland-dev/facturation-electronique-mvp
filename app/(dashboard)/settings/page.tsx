import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) return null

  const organizationId = session.user.organization_id

  const organization = organizationId
    ? await sql`
        SELECT * FROM organizations
        WHERE id = ${organizationId}
      `
    : []

  return (
    <SettingsForm 
      user={{
        id: session.user.id,
        email: session.user.email,
        firstName: session.user.first_name,
        lastName: session.user.last_name,
        role: session.user.role,
        locale: session.user.locale,
      }}
      organization={organization[0] as {
        id: string
        name: string
        siren: string | null
        siret: string | null
        vat_number: string | null
        address_line1: string | null
        address_line2: string | null
        postal_code: string | null
        city: string | null
        country: string
        phone: string | null
        email: string | null
        subscription_tier: string
      } | undefined}
    />
  )
}
