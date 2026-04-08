import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { ProductsList } from '@/components/products/products-list'

export default async function ProductsPage() {
  const session = await getSession()
  if (!session) return null

  const organizationId = session.user.organization_id

  const products = organizationId
    ? await sql`
        SELECT * FROM products
        WHERE organization_id = ${organizationId}
        ORDER BY name ASC
      `
    : []

  return (
    <ProductsList 
      initialProducts={products as Array<{
        id: string
        name: string
        description: string | null
        reference: string | null
        unit_price_ht: number
        tva_rate: number
        unit: string
        is_active: boolean
        created_at: Date
      }>} 
    />
  )
}
