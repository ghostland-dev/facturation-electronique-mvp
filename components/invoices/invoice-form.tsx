'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2, Loader2, Save, Send } from 'lucide-react'

interface Client {
  id: string
  name: string
  siren: string | null
  contact_email: string | null
  payment_terms_days: number
}

interface Product {
  id: string
  name: string
  description: string | null
  reference: string | null
  unit_price_ht: number
  tva_rate: number
  unit: string
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPriceHt: number
  tvaRate: number
  discountPercent: number
}

interface InvoiceFormProps {
  clients: Client[]
  products: Product[]
  suggestedInvoiceNumber: string
}

const TVA_RATES = [
  { value: 20, label: '20% (normal)' },
  { value: 10, label: '10% (intermediaire)' },
  { value: 5.5, label: '5.5% (reduit)' },
  { value: 2.1, label: '2.1% (super-reduit)' },
  { value: 0, label: '0% (exonere)' },
]

export function InvoiceForm({ clients, products, suggestedInvoiceNumber }: InvoiceFormProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  
  const today = new Date().toISOString().split('T')[0]
  const defaultDueDate = new Date()
  defaultDueDate.setDate(defaultDueDate.getDate() + 30)
  
  const [formData, setFormData] = useState({
    invoiceNumber: suggestedInvoiceNumber,
    clientId: '',
    issueDate: today,
    dueDate: defaultDueDate.toISOString().split('T')[0],
    notes: '',
    terms: 'Paiement a 30 jours. Penalites de retard : 3 fois le taux d\'interet legal.',
  })

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPriceHt: 0,
      tvaRate: 20,
      discountPercent: 0,
    },
  ])

  const handleClientChange = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    if (client) {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + client.payment_terms_days)
      setFormData(prev => ({
        ...prev,
        clientId,
        dueDate: dueDate.toISOString().split('T')[0],
      }))
    } else {
      setFormData(prev => ({ ...prev, clientId }))
    }
  }

  const addItem = () => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPriceHt: 0,
      tvaRate: 20,
      discountPercent: 0,
    }])
  }

  const addProductAsItem = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product) {
      setItems(prev => [...prev, {
        id: crypto.randomUUID(),
        description: product.description ?? product.name,
        quantity: 1,
        unitPriceHt: Number(product.unit_price_ht),
        tvaRate: Number(product.tva_rate),
        discountPercent: 0,
      }])
    }
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const calculateItemTotal = (item: InvoiceItem) => {
    const ht = item.quantity * item.unitPriceHt * (1 - item.discountPercent / 100)
    const tva = ht * (item.tvaRate / 100)
    return { ht, tva, ttc: ht + tva }
  }

  const totals = items.reduce(
    (acc, item) => {
      const itemTotals = calculateItemTotal(item)
      return {
        ht: acc.ht + itemTotals.ht,
        tva: acc.tva + itemTotals.tva,
        ttc: acc.ttc + itemTotals.ttc,
      }
    },
    { ht: 0, tva: 0, ttc: 0 }
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const handleSubmit = async (status: 'draft' | 'pending') => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPriceHt: item.unitPriceHt,
            tvaRate: item.tvaRate,
            discountPercent: item.discountPercent,
          })),
          status,
        }),
      })

      if (response.ok) {
        router.push('/invoices')
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/invoices">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t('invoices.newInvoice')}</h1>
          <p className="text-muted-foreground">Creez une nouvelle facture</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details de la facture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">{t('invoices.invoiceNumber')}</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">{t('invoices.client')}</Label>
                  <Select value={formData.clientId} onValueChange={handleClientChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selectionnez un client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">{t('invoices.issueDate')}</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">{t('invoices.dueDate')}</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('invoices.items')}</CardTitle>
              <div className="flex gap-2">
                {products.length > 0 && (
                  <Select onValueChange={addProductAsItem}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Ajouter un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('invoices.addItem')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-start p-4 border rounded-lg">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label>{t('invoices.description')}</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Description du produit ou service"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-4">
                        <div className="space-y-2">
                          <Label>{t('invoices.quantity')}</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.001"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('invoices.unitPrice')} HT</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPriceHt}
                            onChange={(e) => updateItem(item.id, 'unitPriceHt', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('invoices.tva')}</Label>
                          <Select 
                            value={item.tvaRate.toString()} 
                            onValueChange={(v) => updateItem(item.id, 'tvaRate', parseFloat(v))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TVA_RATES.map(rate => (
                                <SelectItem key={rate.value} value={rate.value.toString()}>
                                  {rate.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('invoices.total')} HT</Label>
                          <div className="h-9 px-3 py-2 bg-muted rounded-md text-sm font-medium">
                            {formatCurrency(calculateItemTotal(item).ht)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive mt-6"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t('invoices.notes')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes pour le client</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes visibles sur la facture..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Conditions de paiement</Label>
                <Textarea
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resume</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('invoices.subtotal')} HT</span>
                  <span>{formatCurrency(totals.ht)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('invoices.tva')}</span>
                  <span>{formatCurrency(totals.tva)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>{t('invoices.total')} TTC</span>
                  <span className="text-lg">{formatCurrency(totals.ttc)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button 
                  className="w-full" 
                  onClick={() => handleSubmit('pending')}
                  disabled={isLoading || !formData.invoiceNumber || items.some(i => !i.description)}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Valider et envoyer
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleSubmit('draft')}
                  disabled={isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer en brouillon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
