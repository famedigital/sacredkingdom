'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { TourCards } from '@/components/public/TourCards';
import { PageMasthead } from '@/components/public/PageMasthead';
import { CTASection } from '@/components/public/CTASection';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, X } from 'lucide-react';
import { categoryMatches } from '@/lib/tour-category';

export function ToursPageClient({ tours }: { tours: any[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([
    { value: 'all', label: 'All Trips' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/tour-categories')
      .then((r) => r.json())
      .then((data) => {
        const cats = (data.categories || []).map((c: any) => ({
          value: c.slug,
          label: c.name,
        }));
        setCategories([{ value: 'all', label: 'All Trips' }, ...cats]);
      })
      .catch(() => {
        setCategories([
          { value: 'all', label: 'All Trips' },
          { value: 'cultural', label: 'Cultural Trip' },
          { value: 'festivals', label: 'Festival Tour' },
          { value: 'trekking', label: 'Trekking' },
          { value: 'wildlife', label: 'Wildlife' },
        ]);
      });
  }, []);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const filteredTours = tours.filter((tour) => {
    if (!categoryMatches(tour.category, selectedCategory)) {
      return false;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableText =
        `${tour.title} ${tour.description || ''} ${tour.tagline || ''} ${tour.locations?.join(' ') || ''}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    return true;
  });

  const activeFiltersCount = (selectedCategory !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0);

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="flex-1 pt-16">
        <PageMasthead
          index="01"
          label="Holiday packages"
          title="Holiday tour packages in Bhutan"
          dek="Signature journeys from a six-day western circuit to treks, festivals, and the far east — cultural trips, festival tours, trekking, and wildlife."
        >
          <div className="mt-10 max-w-xl">
            <div className="relative">
              <Compass className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 bg-card pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                type="button"
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                className="rounded-full text-[11px] uppercase tracking-[0.14em]"
                onClick={() => setSelectedCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </PageMasthead>

        <section className="wash-paper py-16 md:py-20">
          <div className="container">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="font-heading text-2xl font-medium text-foreground">
                  {filteredTours.length} {filteredTours.length === 1 ? 'journey' : 'journeys'}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Private itineraries, not a catalogue dump.</p>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{activeFiltersCount} active</Badge>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              )}
            </div>

            {filteredTours.length > 0 ? (
              <TourCards tours={filteredTours} />
            ) : (
              <div className="py-20 text-center">
                <h3 className="mb-3 font-accent text-2xl font-medium">No journeys match</h3>
                <p className="mx-auto mb-8 max-w-md text-muted-foreground">
                  Try another search, or ask us to shape a private route.
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </section>

        <CTASection chapter="02" />
      </main>

      <Footer />
    </div>
  );
}
