'use client'

import { useState } from 'react'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building, User, Shield, CreditCard, Globe } from 'lucide-react'

interface SettingsFormProps {
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    role: string
    locale: string
  }
  organization?: {
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
  }
}

export function SettingsForm({ user, organization }: SettingsFormProps) {
  const { t, locale, setLocale } = useTranslation()
  const [activeTab, setActiveTab] = useState('organization')

  const subscriptionLabels: Record<string, string> = {
    free: 'Gratuit',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Entreprise',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        <p className="text-muted-foreground">Gerez les parametres de votre compte et organisation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="organization" className="gap-2">
            <Building className="h-4 w-4 hidden sm:block" />
            {t('settings.organization')}
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4 hidden sm:block" />
            {t('settings.profile')}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4 hidden sm:block" />
            {t('settings.security')}
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4 hidden sm:block" />
            {t('settings.billing')}
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4 hidden sm:block" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l&apos;organisation</CardTitle>
              <CardDescription>Ces informations apparaitront sur vos factures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nom de l&apos;entreprise</Label>
                  <Input id="orgName" defaultValue={organization?.name ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Email</Label>
                  <Input id="orgEmail" type="email" defaultValue={organization?.email ?? ''} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="siren">SIREN</Label>
                  <Input id="siren" defaultValue={organization?.siren ?? ''} maxLength={9} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siret">SIRET</Label>
                  <Input id="siret" defaultValue={organization?.siret ?? ''} maxLength={14} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vatNumber">Numero de TVA</Label>
                  <Input id="vatNumber" defaultValue={organization?.vat_number ?? ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" defaultValue={organization?.address_line1 ?? ''} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input id="postalCode" defaultValue={organization?.postal_code ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" defaultValue={organization?.city ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telephone</Label>
                  <Input id="phone" type="tel" defaultValue={organization?.phone ?? ''} />
                </div>
              </div>
              <Button>{t('settings.saveChanges')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil utilisateur</CardTitle>
              <CardDescription>Vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                  <Input id="firstName" defaultValue={user.firstName ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.lastName')}</Label>
                  <Input id="lastName" defaultValue={user.lastName ?? ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input id="email" type="email" defaultValue={user.email} disabled />
              </div>
              <Button>{t('settings.saveChanges')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
              <CardDescription>Mettez a jour votre mot de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" />
              </div>
              <Button>Mettre a jour le mot de passe</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Double authentification</CardTitle>
              <CardDescription>Securisez votre compte avec la 2FA</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline">{t('auth.enable2FA')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abonnement actuel</CardTitle>
              <CardDescription>Gerez votre abonnement PA-Facture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    Plan {subscriptionLabels[organization?.subscription_tier ?? 'free']}
                    <Badge variant="secondary">Actif</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {organization?.subscription_tier === 'free' 
                      ? '10 factures par mois incluses'
                      : 'Factures illimitees'}
                  </div>
                </div>
                <Button variant="outline">Changer de plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Personnalisez votre experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.language')}</Label>
                <Select value={locale} onValueChange={(value) => setLocale(value as 'fr' | 'en')}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Francais</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('settings.currency')}</Label>
                <Select defaultValue="EUR">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('settings.defaultTvaRate')}</Label>
                <Select defaultValue="20">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20">20% (taux normal)</SelectItem>
                    <SelectItem value="10">10% (taux intermediaire)</SelectItem>
                    <SelectItem value="5.5">5.5% (taux reduit)</SelectItem>
                    <SelectItem value="2.1">2.1% (taux super-reduit)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button>{t('settings.saveChanges')}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
