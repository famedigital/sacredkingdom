import { Suspense } from 'react';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { PageMasthead } from '@/components/public/PageMasthead';
import { CTASection } from '@/components/public/CTASection';
import { Folio } from '@/components/public/Folio';
import { ContactForm } from '@/components/contact/ContactForm';
import { EmailUsButton } from '@/components/public/EmailUsButton';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getContactPageContent } from '@/lib/content/get-contact';
import { phoneToTelHref } from '@/lib/content/contact';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ContactPage() {
  const content = await getContactPageContent();
  const info = content.contactInfo;
  const hours = content.officeHours;
  const officeHoursLabel = hours?.weekdays
    ? `Mon–Fri, ${hours.weekdays}`
    : 'Mon–Fri, 9:00 AM – 6:00 PM';
  const saturday = hours?.saturdays ? `Sat, ${hours.saturdays}` : 'Sat, 9:00 AM – 3:00 PM';
  const officeHoursNote = `${officeHoursLabel} · ${saturday}`;

  const contactItems = [
    {
      icon: Mail,
      title: 'Email',
      detail: info.email,
      href: `mailto:${info.email}`,
      note: 'We reply within a day',
    },
    {
      icon: Phone,
      title: 'Phone',
      detail: info.phone,
      href: phoneToTelHref(info.phone),
      note: officeHoursNote,
    },
    {
      icon: MapPin,
      title: 'Office',
      detail: info.address,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(info.address)}`,
      note: 'Thimphu, Bhutan',
    },
  ];

  const heroTitle = content.hero?.title || 'Are you ready?';
  const heroSubtitle =
    content.hero?.subtitle ||
    'Ready to experience Bhutan? Whether you want a cultural journey, a trek, a festival, or a fully custom itinerary, our local team will design the days around how you like to travel.';

  const faqs = [
    {
      q: 'Do I need a visa for Bhutan?',
      a: 'Most international visitors need a visa. We arrange it with your booking.',
    },
    {
      q: 'When is the best time to visit?',
      a: 'Spring (Mar–May) and autumn (Sep–Nov) are clearest; each season has its own character.',
    },
    {
      q: 'How much does a trip cost?',
      a: 'Pricing depends on season, group size, and itinerary. Send a short brief for a quote.',
    },
    {
      q: 'Is Bhutan safe for travelers?',
      a: 'Yes — Bhutan is widely regarded as one of the safest destinations in the region.',
    },
  ];

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="safe-bottom-padding flex-1 pt-16 pb-4 lg:pb-0">
        <PageMasthead index="01" label="Contact" title={heroTitle} dek={heroSubtitle} />

        <section className="wash-paper py-10 md:py-16">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
              <div className="order-1 lg:order-2 lg:col-span-3">
                <div
                  id="contact-form"
                  className="scroll-mt-24 rounded-xl border border-primary/20 bg-card p-6 ring-1 ring-foreground/10 md:p-8 lg:scroll-mt-28"
                >
                  <div className="mb-6">
                    <h2 className="font-heading mb-1 text-xl font-medium md:text-2xl">Drop your message</h2>
                    <p className="text-sm text-muted-foreground">
                      Booking requests usually get a reply within a day.
                    </p>
                  </div>
                  <Suspense
                    fallback={
                      <div className="py-10 text-center text-sm text-muted-foreground">Loading form…</div>
                    }
                  >
                    <ContactForm />
                  </Suspense>
                </div>
              </div>

              <aside className="order-2 space-y-8 lg:order-1 lg:col-span-2">
                <div>
                  <Folio index="02" label="Thimphu" />
                  <h2 className="font-accent text-2xl font-medium tracking-tight">Sacred Kingdom Travel</h2>
                  <ul className="mt-6 space-y-5">
                    {contactItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.title} className="border-t border-primary/20 pt-4">
                          <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)]">
                            <Icon className="size-3.5" />
                            {item.title}
                          </p>
                          <a
                            href={item.href}
                            className="mt-1 block text-foreground transition-colors hover:text-primary"
                            {...(item.title === 'Office'
                              ? { target: '_blank', rel: 'noopener noreferrer' }
                              : {})}
                          >
                            {item.detail}
                          </a>
                          <p className="text-sm text-muted-foreground">{item.note}</p>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-6">
                    <EmailUsButton />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="wash-dusk border-y border-primary/20 py-14 md:py-20">
          <div className="container">
            <Folio index="03" label="FAQ" />
            <h2 className="font-accent mb-10 max-w-[16ch] text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
              Quick answers
            </h2>
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-16">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-t border-primary/20 py-6">
                  <h3 className="font-heading text-sm font-medium md:text-base">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTASection chapter="04" />
      </main>

      <Footer />
    </div>
  );
}
