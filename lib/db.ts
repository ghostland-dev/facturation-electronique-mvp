import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

export const sql = neon(process.env.DATABASE_URL)

// Type definitions for database models
export interface Organization {
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
  logo_url: string | null
  subscription_tier: 'free' | 'starter' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'past_due' | 'cancelled' | 'trial'
  trial_ends_at: Date | null
  settings: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface User {
  id: string
  organization_id: string | null
  email: string
  password_hash: string
  first_name: string | null
  last_name: string | null
  role: 'owner' | 'admin' | 'member' | 'viewer'
  locale: string
  is_active: boolean
  email_verified_at: Date | null
  two_factor_enabled: boolean
  two_factor_secret: string | null
  last_login_at: Date | null
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  user_id: string
  token: string
  expires_at: Date
  ip_address: string | null
  user_agent: string | null
  created_at: Date
}

export interface Client {
  id: string
  organization_id: string
  name: string
  siren: string | null
  siret: string | null
  vat_number: string | null
  address_line1: string | null
  address_line2: string | null
  postal_code: string | null
  city: string | null
  country: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  payment_terms_days: number
  notes: string | null
  is_public_sector: boolean
  chorus_service_code: string | null
  chorus_engagement_code: string | null
  created_at: Date
  updated_at: Date
}

export type InvoiceStatus = 
  | 'draft' 
  | 'pending' 
  | 'sent' 
  | 'delivered' 
  | 'accepted' 
  | 'rejected' 
  | 'paid' 
  | 'partially_paid' 
  | 'overdue' 
  | 'cancelled'

export interface Invoice {
  id: string
  organization_id: string
  client_id: string | null
  invoice_number: string
  status: InvoiceStatus
  issue_date: Date
  due_date: Date
  currency: string
  subtotal_ht: number
  total_tva: number
  total_ttc: number
  amount_paid: number
  notes: string | null
  terms: string | null
  facturx_xml: string | null
  pdf_url: string | null
  transmission_id: string | null
  transmission_status: string | null
  transmission_date: Date | null
  ppf_status: string | null
  metadata: Record<string, unknown>
  created_at: Date
  updated_at: Date
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit: string
  unit_price_ht: number
  tva_rate: number
  discount_percent: number
  total_ht: number
  total_tva: number
  total_ttc: number
  sort_order: number
  created_at: Date
}

export interface Product {
  id: string
  organization_id: string
  name: string
  description: string | null
  reference: string | null
  unit_price_ht: number
  tva_rate: number
  unit: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}
