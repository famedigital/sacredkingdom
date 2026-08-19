'use client';

import Link from 'next/link';
import {
  BookOpen,
  LayoutDashboard,
  Images,
  MapPin,
  FileText,
  Image,
  Calendar,
  Mail,
  Users,
  Settings,
  Palette,
  Server,
  Database,
  Cloud,
  Globe,
  Shield,
  History,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Home,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const cmsGuides = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    steps: [
      'Open Dashboard for bookings, pending counts, revenue, and active tours.',
      'Recent Bookings → View / Edit opens that booking on the Bookings page (detail + deposits).',
      'Use pending numbers as your daily follow-up list.',
    ],
  },
  {
    title: 'Hero slides',
    href: '/admin/hero',
    icon: Images,
    steps: [
      'Add or edit homepage slideshow images and headlines.',
      'Upload images from Media library (Cloudinary) for best quality and speed.',
      'Prefer wide landscape photos (about 1920×1080). The site fills the screen and keeps the top of the photo visible.',
      'Set CTA button text and link (e.g. “Explore tours” → /tours).',
      'Toggle Active so only finished slides appear on the live site.',
    ],
  },
  {
    title: 'Homepage',
    href: '/admin/homepage',
    icon: Home,
    steps: [
      'Edit Featured journeys headings and Sacred Himalaya Difference section.',
      'Change titles, descriptions, and icons — then Save changes.',
      'Open the public homepage to confirm the updated text.',
    ],
  },
  {
    title: 'Tours',
    href: '/admin/tours',
    icon: MapPin,
    steps: [
      'Create categories first (e.g. International / Regional) — they power the public Tours menu.',
      'Add New Tour: Basic → Content → Media → Itinerary → Pricing → SEO → Preview.',
      'Published to public = show on /tours. Turn off to keep a draft/private package.',
      'Copy naked itinerary link to share the day-by-day plan with a client (prices hidden).',
      'Clients button on a tour → see everyone who booked/asked, or Add client under that tour.',
      'Each client engagement links to a master client and has its own ops, docs, and itinerary changes.',
      'After save, open the public URL and test Book / Inquire.',
    ],
  },
  {
    title: 'Blog',
    href: '/admin/blog',
    icon: FileText,
    steps: [
      'Create a post with title, slug, excerpt, featured image, and body.',
      'Set category and tags; publish only when ready.',
      'Edit anytime from the blog list — changes appear on /blog after save.',
    ],
  },
  {
    title: 'Media library',
    href: '/admin/media',
    icon: Image,
    steps: [
      'Upload one or many images (stored on Cloudinary under the client account).',
      'Tap an image to select it; use Select all for the current search results.',
      'Delete one image with the trash icon, or select many and click Delete (N).',
      'Copy URL to paste into forms, or pick images from the media picker in editors.',
      'Prefer landscape for heroes; square crops work well for team photos.',
    ],
  },
  {
    title: 'Bookings',
    href: '/admin/bookings',
    icon: Calendar,
    steps: [
      'New booking requests appear here and in the bell notifications (pending status).',
      'Open a booking to set/edit the tour total (Use tour price if amount is $0).',
      'Confirm opens a deposit dialog — enter an installment (or leave blank); deposits can be added many times.',
      'Operations tab: record guide, driver, and hotels after confirm.',
      'Itinerary tab: customize days for this client (shared links use the custom version).',
      'Documents tab: upload room vouchers, SDF papers, invoices, payment proofs (PDF/DOC/image).',
      'Share tab: Client naked itinerary link, or Guide & driver link (no rates, includes ops).',
      'Download Invoice opens a printable Sacred Himalaya invoice (Print / Save PDF).',
      'Confirming or cancelling a booking clears it from the pending notification badge.',
    ],
  },
  {
    title: 'Inquiries',
    href: '/admin/inquiries',
    icon: Mail,
    steps: [
      'Contact form and quote messages land here with status New.',
      'Change status: New → Read → Replied → Closed as you work the inbox.',
      'Clicking a “New inquiry” notification marks it read and opens this page focused on that message.',
      '“Mark inquiries read” in the bell clears all new inquiry badges.',
    ],
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
    steps: [
      'Combined list of people who booked or inquired (email + phone when available).',
      'Use it to spot repeat guests before you reply.',
    ],
  },
  {
    title: 'Account recovery',
    href: '/admin/forgot-password',
    icon: Shield,
    steps: [
      'Login → “Forgot password or login email?”',
      'Forgot password: enter admin email → 1-hour reset link → set new password (min 8 chars).',
      'Forgot login email: enter registered name or email → reminder sent to that account.',
      'Production needs free Gmail SMTP (SMTP_HOST/USER/PASS) or RESEND_API_KEY, plus NEXT_PUBLIC_APP_URL in Vercel.',
    ],
  },
  {
    title: 'Admin users',
    href: '/admin/settings/users',
    icon: Shield,
    steps: [
      'Add staff: email, name, role, and a temporary password (min 6–8 characters).',
      'Edit a user to change name, role, or reset their password from this screen.',
      'Header → My Profile also opens this page.',
      'Only trusted people should have access — the CMS can change the live site.',
      'New users sign in at /admin/login with the email you registered (that is their username).',
    ],
  },
  {
    title: 'About page',
    href: '/admin/settings/site',
    icon: Home,
    steps: [
      'Edit hero, Our Story, Values, Statistics, Timeline, and Team with photos.',
      'Save Changes, then open /about on the public site to verify.',
    ],
  },
  {
    title: 'Privacy Policy',
    href: '/admin/settings/privacy',
    icon: FileText,
    steps: [
      'Edit page title, last-updated date, and each section heading/body.',
      'Start a line with - for bullet points. Type {company} to insert the brand name.',
      'Save, then open /privacy on the public site to verify.',
    ],
  },
  {
    title: 'Terms & Conditions',
    href: '/admin/settings/terms',
    icon: FileText,
    steps: [
      'Edit booking, cancellation, and other legal sections the same way as Privacy.',
      'Save, then open /terms on the public site to verify.',
    ],
  },
  {
    title: 'Contact & general',
    href: '/admin/settings/general',
    icon: Settings,
    steps: [
      'Keep phone, email, WhatsApp, address, and office hours current.',
      'CRM alerts: set your WhatsApp so new bookings/inquiries ping your phone.',
      'Use Send test alert after configuring CallMeBot or Twilio in Vercel env.',
      'These details feed contact areas and visitor outreach.',
    ],
  },
  {
    title: 'SEO',
    href: '/admin/settings/navigation',
    icon: Globe,
    steps: [
      'Set site-wide SEO defaults when available.',
      'Per-tour and per-blog SEO fields live inside those editors.',
    ],
  },
  {
    title: 'FAQ',
    href: '/admin/settings/payments',
    icon: Mail,
    steps: [
      'Manage FAQs on the public FAQ page (visa, season, safety, pricing).',
      'Keep answers short and accurate.',
    ],
  },
];

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>
      <div>
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function AdminDocumentation() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>CMS guide</Badge>
          <Badge variant="outline">Client ownership</Badge>
        </div>
      </div>

      <Tabs defaultValue="cms">
        <TabsList className="mb-2 flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="cms">CMS how-to</TabsTrigger>
          <TabsTrigger value="stack">Technology</TabsTrigger>
          <TabsTrigger value="brand">Brand &amp; color</TabsTrigger>
          <TabsTrigger value="history">Build history</TabsTrigger>
          <TabsTrigger value="ownership">Ownership &amp; handover</TabsTrigger>
        </TabsList>

        {/* CMS HOW-TO */}
        <TabsContent value="cms" className="space-y-6">
          <SectionTitle
            icon={BookOpen}
            title="Using the admin CMS"
            description="Follow these steps whenever you update the live website."
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Before you edit</CardTitle>
              <CardDescription>
                Small habits that prevent broken pages and missing images.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Log in at <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">/admin/login</code>.</p>
              <p>2. Prefer uploading images in <strong className="text-foreground">Media library</strong> first, then pick them in forms.</p>
              <p>3. After saving, open the public page in a new tab and check mobile + desktop.</p>
              <p>4. Book / Inquire on tours should land on the contact form (with the tour prefilled).</p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {cmsGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <Card key={guide.href}>
                  <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 items-center justify-center rounded-md bg-muted">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{guide.title}</CardTitle>
                        <CardDescription className="mt-1 font-mono text-xs">
                          {guide.href}
                        </CardDescription>
                      </div>
                    </div>
                    <Link
                      href={guide.href}
                      className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
                    >
                      Open
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
                      {guide.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex gap-3 p-5 text-sm">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="font-medium text-foreground">Quick publish checklist</p>
                <p className="mt-1 text-muted-foreground">
                  Media uploaded → content saved → Active/Published on → public page refreshed →
                  Book/Inquire tested on mobile.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TECHNOLOGY */}
        <TabsContent value="stack" className="space-y-6">
          <SectionTitle
            icon={Server}
            title="Technology stack"
            description="Everything runs on accounts and services registered for the client."
          />

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-muted">
                  <Globe className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Next.js website</CardTitle>
                <CardDescription>
                  Modern App Router site (React + TypeScript) with public pages and the admin CMS in
                  one codebase.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Hosted on <strong className="text-foreground">Vercel</strong>. Deployments update when
                code is pushed; environment keys live in the Vercel project for this site.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-muted">
                  <Database className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Supabase (database &amp; auth data)</CardTitle>
                <CardDescription>
                  Stores tours, blog posts, bookings, inquiries, CMS page content, and related data.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Supabase is connected through the <strong className="text-foreground">client&apos;s Google account</strong>.
                Credentials and project ownership stay with Sacred Himalaya Travel — not locked to
                Innovates.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-muted">
                  <Cloud className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Cloudinary (all images)</CardTitle>
                <CardDescription>
                  Hero slides, tour galleries, blog images, About team photos, and media library
                  uploads.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Images are optimized for the web automatically. The Media library in admin is the
                day-to-day way to upload and reuse files.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-muted">
                  <Globe className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Domain — bt.bt</CardTitle>
                <CardDescription>
                  Domain purchased from <strong className="text-foreground">www.bt.bt</strong> (Bhutan
                  domain registry).
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                DNS should point the domain to Vercel. Renewal and WHOIS control remain with the
                client&apos;s registrar account at bt.bt.
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Also in the stack</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                <strong className="text-foreground">shadcn/ui + Tailwind CSS</strong> — admin and form
                components (buttons, inputs, dialogs).
              </p>
              <p>
                <strong className="text-foreground">Framer Motion</strong> — light motion on the public
                site (kept fast so scrolling never feels blank).
              </p>
              <p>
                <strong className="text-foreground">GitHub</strong> — source code repository for
                deployments and future developers.
              </p>
              <p>
                <strong className="text-foreground">Vercel + env vars</strong> — production secrets
                (Supabase keys, Cloudinary, JWT) configured on the hosting project.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BRAND */}
        <TabsContent value="brand" className="space-y-6">
          <SectionTitle
            icon={Palette}
            title="Why these colors"
            description="The palette is meant to feel Bhutanese, premium, and trustworthy — not generic tech purple."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="h-16 rounded-lg bg-primary" />
                <div>
                  <p className="font-medium">Monastery red</p>
                  <p className="font-mono text-xs text-muted-foreground">#9f1239 · Primary</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Inspired by Bhutanese monastery robes, dzong accents, and prayer-flag crimson.
                    Used for CTAs, active menu states, and key highlights.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="h-16 rounded-lg bg-secondary" />
                <div>
                  <p className="font-medium">Charcoal</p>
                  <p className="font-mono text-xs text-muted-foreground">#0c1222 · Secondary</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Deep Himalayan night / ink — gives luxury contrast for footers and strong text
                    without harsh pure black.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-5">
                <div className="h-16 rounded-lg bg-accent" />
                <div>
                  <p className="font-medium">Antique gold</p>
                  <p className="font-mono text-xs text-muted-foreground">#c4a35a · Accent</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Soft gold like temple metalwork and festival ornaments — used sparingly so the
                    site stays calm and premium.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
              <p>
                Surfaces use a warm stone background so photography of dzongs, mountains, and
                festivals feels natural. Typography pairs a clear sans for reading with a refined
                display face for titles — editorial travel, not a loud brochure.
              </p>
              <p>
                We avoided trendy purple gradients and generic “AI cream + terracotta” looks so the
                brand stays distinctly Sacred Himalaya / Bhutan.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HISTORY */}
        <TabsContent value="history" className="space-y-6">
          <SectionTitle
            icon={History}
            title="How this project was built"
            description="Timeline and engineering effort from first commit to the live CMS."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-primary">23 Jun 2026</p>
                <p className="mt-1 text-sm text-muted-foreground">Project started (first Next.js commit)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-primary">50+</p>
                <p className="mt-1 text-sm text-muted-foreground">Git commits across design, CMS, and deploy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-3xl font-semibold text-primary">40+</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fix / debug / production diagnosis cycles (TypeScript, Vercel, Supabase keys,
                  Cloudinary URLs, hero slider, tours 500s, RLS, mobile UI, and more)
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">
                  Jun 23
                </Badge>
                <p className="text-muted-foreground">
                  Initial Next.js app created — foundation for the public site and admin.
                </p>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">
                  Jun 25
                </Badge>
                <p className="text-muted-foreground">
                  Premium red theme, navigation, tour cards, and early admin mock dashboard for
                  client review.
                </p>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">
                  Jul 5+
                </Badge>
                <p className="text-muted-foreground">
                  Live data stack: Supabase + Cloudinary, Vercel production hardening, null-safety
                  on tours, auth/key fixes for serverless, hero &amp; blog CMS, mobile bottom nav.
                </p>
              </div>
              <Separator />
              <div className="flex gap-3">
                <Badge variant="outline" className="shrink-0">
                  Jul 19
                </Badge>
                <p className="text-muted-foreground">
                  Luxury design system, stock shadcn forms, contact deep-links, About CMS sync,
                  multi-deposit bookings + printable invoices, notification deep-links &amp; badge
                  refresh, session auto-refresh, forgot password / login-email recovery, media
                  multi-select delete, and this operations manual.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex gap-3 p-5 text-sm">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
              <div className="text-muted-foreground">
                <p className="font-medium text-foreground">About the “errors &amp; debugging”</p>
                <p className="mt-1">
                  The 40+ figure counts engineering commits that fixed build failures, production
                  crashes, missing env keys, image URL bugs, TypeScript errors, and Vercel-only
                  issues — normal for shipping a full CMS to production. The live site is the result
                  of that hardening, not a single unbroken first draft.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OWNERSHIP */}
        <TabsContent value="ownership" className="space-y-6">
          <SectionTitle
            icon={Shield}
            title="Ownership &amp; independence"
            description="Clear rights so the client is never locked to Innovates."
          />

          <Card className="border-primary/25 bg-primary/5">
            <CardContent className="space-y-3 p-6 text-sm leading-relaxed">
              <p className="text-base font-medium text-foreground">
                All website content, media, accounts, and technology for this project belong to
                Sacred Himalaya Travel (the client).
              </p>
              <p className="text-muted-foreground">
                Supabase, Cloudinary, Vercel, GitHub, domain registration at{' '}
                <strong className="text-foreground">www.bt.bt</strong>, and related Google-linked
                access were set up for the client. If Sacred Himalaya Travel later chooses not
                to continue with Innovates, they can keep the site, data, images, domain, and
                hosting — and hand the tech stack to any future developer or agency without
                losing ownership.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What the client owns</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>Domain (purchased via www.bt.bt)</li>
                  <li>Website source code (GitHub repository)</li>
                  <li>Database &amp; CMS content (Supabase)</li>
                  <li>All uploaded images (Cloudinary)</li>
                  <li>Hosting project &amp; env configuration (Vercel)</li>
                  <li>Admin login access and future staff accounts</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Handover tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  <li>Keep Google / registrar / Vercel passwords in a secure client vault.</li>
                  <li>Document who has admin CMS logins.</li>
                  <li>Renew the .bt domain on time at bt.bt.</li>
                  <li>Share this Docs page with any new developer as the operations brief.</li>
                  <li>Export or back up Supabase and Cloudinary periodically.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Support contacts (fill as needed)</CardTitle>
              <CardDescription>
                Replace with your preferred client contacts when handing over.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <p>
                Public site contact: <span className="text-foreground">info@sacredhimalayatravel.com</span>
              </p>
              <p>
                WhatsApp (site): <span className="text-foreground">+975 17 643 416</span>
              </p>
              <p>
                Domain registrar: <span className="text-foreground">www.bt.bt</span>
              </p>
              <p>
                Built with: Next.js · Vercel · Supabase · Cloudinary · shadcn/ui
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <p className="text-center text-xs text-muted-foreground">
        Last updated for the admin documentation module · Sacred Himalaya Travel CMS
      </p>
    </div>
  );
}
