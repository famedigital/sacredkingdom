import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { PageMasthead } from '@/components/public/PageMasthead';
import { CTASection } from '@/components/public/CTASection';
import { Folio } from '@/components/public/Folio';
import { EditorialSection } from '@/components/public/EditorialSection';

const travelInfo = [
  {
    title: 'Getting to Bhutan',
    items: [
      'By air: Paro International Airport (PBH) from Bangkok, Delhi, Kolkata, Kathmandu, Singapore, and more',
      'DrukAir and Bhutan Airlines operate international flights',
      'By land: Phuntsholing (from India), Gelephu and Samdrup Jongkhar border crossings',
      'Road travel from India requires valid entry permits',
    ],
  },
  {
    title: 'Visa & permits',
    items: [
      'Visa required for all nationalities (we arrange for you)',
      'Apply at least 30 days before travel with passport copy and photo',
      'SIM (Restricted Area Permit) included for most destinations',
      'Special permits needed for some eastern regions',
    ],
  },
  {
    title: 'When to go',
    items: [
      'Spring (Mar–May): pleasant weather, rhododendrons',
      'Summer (Jun–Aug): monsoon, lush valleys',
      'Autumn (Sep–Nov): clear skies, festival season',
      'Winter (Dec–Feb): cold but sunny, strong for lower altitudes',
    ],
  },
  {
    title: 'Currency',
    items: [
      'Bhutanese Ngultrum (BTN) = Indian Rupee (INR)',
      'USD/EUR accepted for tour payments',
      'Credit cards limited to major hotels',
      'Carry cash for markets and small purchases',
    ],
  },
  {
    title: 'Communication',
    items: [
      'Local SIM cards in major towns',
      'International roaming works in most areas',
      'WiFi in hotels and urban areas',
      'Limited connectivity in remote regions',
    ],
  },
  {
    title: 'Getting around',
    items: [
      'Private vehicle with driver included on our journeys',
      'Comfortable SUVs for mountain roads',
      'Domestic flights: Paro–Bumthang, Paro–Yongphula',
      'No trains in Bhutan',
    ],
  },
];

export default function TravelInfoPage() {
  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="flex-1 pt-16">
        <PageMasthead
          index="01"
          label="Travel info"
          title="Stress-free travel to Bhutan"
          dek="From booking flights to visas, lodgings, and touring — we handle the details so you can enjoy the kingdom. Office hours Monday–Friday 9:00 AM–6:00 PM, Saturday 9:00 AM–3:00 PM."
        />

        <EditorialSection
          content={{
            eyebrow: 'Kingdom',
            title: 'Arrive with the visa already arranged',
            titleColor: '',
            body: 'As a locally owned, licensed Bhutan tour operator we arrange the visa with your booking. Most guests land at Paro International Airport; we meet you and stay with you through the valleys — Tiger’s Nest, festivals, and the carbon-negative landscapes of the last Buddhist kingdom.',
            image:
              'https://res.cloudinary.com/hqxti5zm/image/upload/sacred-himalaya/generated-punakha.png',
          }}
        />

        <section className="wash-dusk border-y border-primary/20 py-16 md:py-24">
          <div className="container">
            <Folio index="02" label="Notes" />
            <h2 className="font-accent mb-12 max-w-[16ch] text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
              What guests ask before they book
            </h2>
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-16">
              {travelInfo.map((info) => (
                <div key={info.title} className="border-t border-primary/20 py-8">
                  <h3 className="font-heading text-base font-medium">{info.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {info.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="wash-paper py-16 md:py-24">
          <div className="container grid gap-12 md:grid-cols-2">
            <div>
              <Folio index="03" label="Pack" />
              <h2 className="font-accent text-3xl font-medium tracking-tight">What to bring</h2>
              <div className="mt-8 grid gap-8 sm:grid-cols-2">
                <div>
                  <h3 className="font-heading text-sm font-medium">Essential</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <li>Valid passport (6+ months)</li>
                    <li>Travel insurance documents</li>
                    <li>Comfortable walking shoes</li>
                    <li>Layers for changing temperatures</li>
                    <li>Rain jacket</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-heading text-sm font-medium">Recommended</h3>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <li>Sun protection</li>
                    <li>Modest clothing for temples</li>
                    <li>Camera with extra batteries</li>
                    <li>Personal medications</li>
                    <li>Small daypack</li>
                  </ul>
                </div>
              </div>
            </div>
            <div>
              <Folio index="04" label="Health" />
              <h2 className="font-accent text-3xl font-medium tracking-tight">Altitude &amp; care</h2>
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Allow time to acclimatize, drink water, and avoid alcohol at first. Most tourist areas sit around
                2,000–2,500m. Basic care is available in major towns; comprehensive insurance is essential.
              </p>
            </div>
          </div>
        </section>

        <CTASection chapter="05" />
      </main>

      <Footer />
    </div>
  );
}
