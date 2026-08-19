'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatTourPrice, isTourPriceVisible } from '@/lib/tour-options';
import { categoryDisplayName } from '@/lib/tour-category';
import { focalToObjectPosition } from '@/lib/image-focal';
import { cn } from '@/lib/utils';

interface TourCardProps {
  tour: any;
  index: number;
}

export function TourCard({ tour, index }: TourCardProps) {
  const imageUrl =
    tour.hero_image_url || tour.hero_image || tour.thumbnail_url || tour.thumbnail || '/placeholder.jpg';
  const objectPosition = focalToObjectPosition(tour.hero_image_focal_x, tour.hero_image_focal_y);
  const categoryLabel = categoryDisplayName(tour.category);
  const price = tour.price || 0;
  const duration = tour.duration || 0;
  const difficulty = tour.difficulty_level || tour.difficulty || 'easy';
  const tagline = tour.tagline || tour.description || '';

  return (
    <motion.div
      initial={{ opacity: 0.01, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: '80px 0px' }}
      transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.1), ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Card
        size="sm"
        className="hover-lift group h-full gap-0 rounded-xl border-primary/20 wash-paper py-0 shadow-none ring-1 ring-foreground/10"
      >
        <Link href={`/tours/${tour.slug}`} className="relative block overflow-hidden">
          <img
            src={imageUrl}
            alt={tour.title}
            className="hover-lift-media luxury-photo aspect-[16/10] w-full object-cover"
            style={{ objectPosition }}
            loading="lazy"
          />
          <Badge className="absolute top-2 left-2 rounded-full border-0 bg-secondary px-2 py-0 text-[9px] tracking-[0.12em] text-primary uppercase">
            {categoryLabel}
          </Badge>
        </Link>

        <div className="flex min-h-0 flex-1 flex-col px-3 pt-2.5">
          <CardHeader className="gap-1 p-0">
            <CardTitle className="font-accent text-[1.05rem] leading-snug font-medium">{tour.title}</CardTitle>
            {tagline ? (
              <CardDescription className="line-clamp-2 text-xs leading-relaxed">{tagline}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-0.5 p-0 pt-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3 text-primary" />
              {duration} days
            </span>
            <span className="inline-flex items-center gap-1 capitalize">
              <TrendingUp className="size-3 text-primary" />
              {difficulty}
            </span>
            <span className="ml-auto font-medium text-foreground">
              {isTourPriceVisible(tour) ? formatTourPrice(price, tour.category) : 'Contact for price'}
            </span>
          </CardContent>
        </div>
        <CardFooter className="mt-2 border-t border-primary/15 bg-transparent px-3 py-2">
          <Link
            href={`/tours/${tour.slug}`}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'xs' }),
              'rounded-full px-0 hover:bg-transparent hover:text-primary'
            )}
          >
            View itinerary
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
