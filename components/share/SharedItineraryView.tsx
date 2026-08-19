'use client';

import { useEffect, useState } from 'react';
import { Loader2, MapPin, Calendar, Users, User, Car, Building2 } from 'lucide-react';

import { useCompanyBrand } from '@/hooks/use-company-brand';
import { BrandLogo } from '@/components/BrandLogo';

type ItineraryDay = {
  day?: string | number;
  title?: string;
  location?: string;
  description?: string;
  meals?: string;
  accommodation?: string;
  activities?: string[];
};

type SharePayload = {
  audience?: 'client' | 'staff';
  booking?: {
    booking_number?: string;
    client_name?: string;
    travel_date?: string;
    travelers?: number;
    tour_title?: string;
  };
  tour?: {
    title?: string;
    tagline?: string;
    duration?: number;
    category?: string;
    itinerary?: ItineraryDay[];
    highlights?: string[];
    hero_image_url?: string | null;
  } | null;
  hotels?: Array<{
    name?: string;
    location?: string;
    check_in?: string;
    check_out?: string;
    room_type?: string;
    confirmation_no?: string;
    notes?: string;
  }>;
  operations?: {
    guide_name?: string | null;
    guide_phone?: string | null;
    guide_email?: string | null;
    guide_notes?: string | null;
    driver_name?: string | null;
    driver_phone?: string | null;
    driver_email?: string | null;
    driver_notes?: string | null;
  } | null;
};

export function SharedItineraryView({
  mode,
  token,
}: {
  mode: 'booking' | 'tour';
  token: string;
}) {
  const brand = useCompanyBrand();
  const [data, setData] = useState<SharePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url =
      mode === 'booking' ? `/api/share/itinerary/${token}` : `/api/share/tour/${token}`;
    fetch(url)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.error || 'Unable to load itinerary');
        setData(json);
      })
      .catch((err) => setError(err.message || 'Unable to load itinerary'))
      .finally(() => setLoading(false));
  }, [mode, token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center wash-paper">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.tour) {
    return (
      <div className="flex min-h-screen items-center justify-center wash-paper px-4">
        <div className="max-w-md text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">Link unavailable</h1>
          <p className="mt-2 text-muted-foreground">{error || 'This itinerary link is invalid or expired.'}</p>
        </div>
      </div>
    );
  }

  const title = data.booking?.tour_title || data.tour.title || 'Itinerary';
  const days = Array.isArray(data.tour.itinerary) ? data.tour.itinerary : [];
  const hotels = Array.isArray(data.hotels) ? data.hotels.filter((h) => h?.name) : [];
  const ops = data.operations;
  const isStaff = data.audience === 'staff';

  return (
    <div className="min-h-screen wash-paper text-foreground">
      <header className="border-b border-primary/20 bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5">
          <BrandLogo height={40} className="h-10" />
          <div>
            <p className="font-heading text-sm font-semibold">{brand.name}</p>
            <p className="text-xs text-muted-foreground">
              {isStaff ? 'Operations itinerary (no rates)' : 'Shared itinerary'}
            </p>
          </div>
        </div>
      </header>

      {data.tour.hero_image_url ? (
        <div className="relative h-48 w-full overflow-hidden md:h-64">
          <img
            src={data.tour.hero_image_url}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-3xl px-4 pb-6">
            <h1 className="font-accent text-2xl font-medium text-[#E8D5A3] md:text-3xl">{title}</h1>
            {data.tour.tagline ? (
              <p className="mt-1 text-sm text-white/85">{data.tour.tagline}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl px-4 pt-8">
          <h1 className="font-accent text-3xl font-medium">{title}</h1>
          {data.tour.tagline ? <p className="mt-2 text-muted-foreground">{data.tour.tagline}</p> : null}
        </div>
      )}

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <section className="grid gap-3 rounded-xl border border-primary/20 bg-card p-4 sm:grid-cols-3">
          {data.booking?.travel_date ? (
            <div className="flex items-start gap-2 text-sm">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Travel date</p>
                <p className="font-medium">{data.booking.travel_date}</p>
              </div>
            </div>
          ) : null}
          {data.tour.duration ? (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Duration</p>
                <p className="font-medium">{data.tour.duration} days</p>
              </div>
            </div>
          ) : null}
          {data.booking?.travelers ? (
            <div className="flex items-start gap-2 text-sm">
              <Users className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Travelers</p>
                <p className="font-medium">
                  {data.booking.travelers}
                  {data.booking.client_name ? ` · ${data.booking.client_name}` : ''}
                </p>
              </div>
            </div>
          ) : null}
        </section>

        {Array.isArray(data.tour.highlights) && data.tour.highlights.length > 0 ? (
          <section>
            <h2 className="font-heading mb-3 text-lg font-semibold">Highlights</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground/80">
              {data.tour.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h2 className="font-heading mb-4 text-lg font-semibold">Day-by-day itinerary</h2>
          <div className="space-y-4">
            {days.length === 0 ? (
              <p className="text-sm text-muted-foreground">Itinerary details will appear here.</p>
            ) : (
              days.map((day, idx) => (
                <article
                  key={`${day.day ?? idx}-${day.title ?? idx}`}
                  className="rounded-xl border border-primary/20 bg-card p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Day {day.day ?? idx + 1}
                    {day.location ? ` · ${day.location}` : ''}
                  </p>
                  <h3 className="mt-1 font-heading text-base font-semibold">
                    {day.title || `Day ${day.day ?? idx + 1}`}
                  </h3>
                  {day.description ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                      {day.description}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {day.meals ? <span>Meals: {day.meals}</span> : null}
                    {day.accommodation ? <span>Stay: {day.accommodation}</span> : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {hotels.length > 0 ? (
          <section>
            <h2 className="font-heading mb-3 flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5" /> Hotels
            </h2>
            <div className="space-y-3">
              {hotels.map((hotel, i) => (
                <div key={`${hotel.name}-${i}`} className="rounded-xl border border-primary/20 bg-card p-4 text-sm">
                  <p className="font-medium">{hotel.name}</p>
                  <p className="text-muted-foreground">
                    {[hotel.location, hotel.room_type].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {[hotel.check_in && `In ${hotel.check_in}`, hotel.check_out && `Out ${hotel.check_out}`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  {hotel.confirmation_no ? (
                    <p className="mt-1 text-xs text-muted-foreground">Conf: {hotel.confirmation_no}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {isStaff && ops ? (
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-primary/20 bg-card p-4">
              <h2 className="font-heading mb-2 flex items-center gap-2 text-base font-semibold">
                <User className="h-4 w-4" /> Guide
              </h2>
              <p className="text-sm font-medium">{ops.guide_name || 'TBA'}</p>
              {ops.guide_phone ? <p className="text-sm text-muted-foreground">{ops.guide_phone}</p> : null}
              {ops.guide_email ? <p className="text-sm text-muted-foreground">{ops.guide_email}</p> : null}
              {ops.guide_notes ? <p className="mt-2 text-sm text-muted-foreground">{ops.guide_notes}</p> : null}
            </div>
            <div className="rounded-xl border border-primary/20 bg-card p-4">
              <h2 className="font-heading mb-2 flex items-center gap-2 text-base font-semibold">
                <Car className="h-4 w-4" /> Driver
              </h2>
              <p className="text-sm font-medium">{ops.driver_name || 'TBA'}</p>
              {ops.driver_phone ? <p className="text-sm text-muted-foreground">{ops.driver_phone}</p> : null}
              {ops.driver_email ? <p className="text-sm text-muted-foreground">{ops.driver_email}</p> : null}
              {ops.driver_notes ? <p className="mt-2 text-sm text-muted-foreground">{ops.driver_notes}</p> : null}
            </div>
          </section>
        ) : null}

        <p className="pb-8 text-center text-xs text-muted-foreground/70">
          Rates are intentionally hidden on this shared link.
        </p>
      </main>
    </div>
  );
}
