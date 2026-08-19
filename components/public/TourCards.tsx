'use client';

import { TourCard } from '@/components/public/TourCard';

type TourCardsProps = {
  tours: any[];
  featured?: boolean;
};

export function TourCards({ tours, featured = false }: TourCardsProps) {
  if (!tours.length) return null;

  const list = featured ? tours.slice(0, 3) : tours;

  return (
    <div
      className={
        featured
          ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4'
          : 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 lg:gap-4'
      }
    >
      {list.map((tour, index) => (
        <TourCard key={tour.id || tour.slug || index} tour={tour} index={index} />
      ))}
    </div>
  );
}
