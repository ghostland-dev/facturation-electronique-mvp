import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { FileText, Shield, Zap, Globe, CheckCircle2, ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const session = await getSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PA-Facture</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Connexion
            </Link>
            <Button asChild>
              <Link href="/register">Essai gratuit</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <span className="mr-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Nouveau
            </span>
            Conforme a la reforme 2026-2027
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
            La facturation electronique simplifiee pour les entreprises francaises
          </h1>
          <p className="mb-8 text-lg text-muted-foreground text-pretty">
            PA-Facture vous accompagne dans la transition vers la facturation electronique obligatoire. 
            Creez, envoyez et gerez vos factures conformes Factur-X en quelques clics.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Decouvrir les fonctionnalites</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Tout ce qu&apos;il vous faut pour facturer</h2>
            <p className="text-muted-foreground">Une solution complete pour gerer votre facturation au quotidien</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Factures Factur-X</h3>
              <p className="text-sm text-muted-foreground">
                Generez des factures au format Factur-X, le standard europeen de facturation electronique.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">100% Conforme</h3>
              <p className="text-sm text-muted-foreground">
                Respectez toutes les obligations legales de la reforme de la facturation electronique.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Transmission automatique</h3>
              <p className="text-sm text-muted-foreground">
                Envoyez vos factures directement vers les plateformes agreees (PPF, Chorus Pro).
              </p>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 font-semibold">Multi-langues</h3>
              <p className="text-sm text-muted-foreground">
                Interface disponible en francais et en anglais pour vos equipes internationales.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Calendrier de la reforme</h2>
            <p className="text-muted-foreground">Preparez-vous aux echeances de la facturation electronique</p>
          </div>
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <div className="h-full w-0.5 bg-border"></div>
              </div>
              <div className="pb-8">
                <div className="font-semibold">1er septembre 2026</div>
                <div className="text-muted-foreground">Obligation de reception pour toutes les entreprises</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <div className="h-full w-0.5 bg-border"></div>
              </div>
              <div className="pb-8">
                <div className="font-semibold">1er septembre 2026</div>
                <div className="text-muted-foreground">Obligation d&apos;emission pour les grandes entreprises et ETI</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background font-bold">
                  3
                </div>
              </div>
              <div>
                <div className="font-semibold">1er septembre 2027</div>
                <div className="text-muted-foreground">Obligation d&apos;emission pour les PME et micro-entreprises</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold">Tarifs simples et transparents</h2>
            <p className="text-muted-foreground">Commencez gratuitement, evoluez selon vos besoins</p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4">
                <div className="text-sm font-medium text-muted-foreground">Gratuit</div>
                <div className="text-3xl font-bold">0 EUR</div>
                <div className="text-sm text-muted-foreground">/ mois</div>
              </div>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  10 factures / mois
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  1 utilisateur
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Export PDF
                </li>
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">Commencer</Link>
              </Button>
            </div>
            <div className="rounded-xl border-2 border-primary bg-card p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                Populaire
              </div>
              <div className="mb-4">
                <div className="text-sm font-medium text-muted-foreground">Pro</div>
                <div className="text-3xl font-bold">29 EUR</div>
                <div className="text-sm text-muted-foreground">/ mois</div>
              </div>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Factures illimitees
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  5 utilisateurs
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Transmission PPF
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Support prioritaire
                </li>
              </ul>
              <Button className="w-full" asChild>
                <Link href="/register">Essai gratuit</Link>
              </Button>
            </div>
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4">
                <div className="text-sm font-medium text-muted-foreground">Entreprise</div>
                <div className="text-3xl font-bold">Sur mesure</div>
                <div className="text-sm text-muted-foreground">&nbsp;</div>
              </div>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Tout illimite
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  API complete
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Integration ERP
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  SLA garanti
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">Pret a simplifier votre facturation ?</h2>
          <p className="mb-8 text-muted-foreground">
            Rejoignez les entreprises qui font confiance a PA-Facture
          </p>
          <Button size="lg" asChild>
            <Link href="/register">
              Creer mon compte gratuit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">PA-Facture</span>
            </div>
            <div className="text-sm text-muted-foreground">
              2026 PA-Facture. Solution de facturation electronique conforme.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
