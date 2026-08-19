import type { ReactNode } from 'react';
import { Folio } from '@/components/public/Folio';
import { cn } from '@/lib/utils';

export function PageMasthead({
  index,
  label,
  title,
  dek,
  variant = 'paper',
  align = 'left',
  children,
}: {
  index: string;
  label: string;
  title: string;
  dek?: string;
  variant?: 'paper' | 'dusk';
  align?: 'left' | 'center';
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        'border-b border-primary/20 pt-16 pb-16 md:pt-20 md:pb-20',
        variant === 'dusk' ? 'wash-dusk' : 'wash-paper'
      )}
    >
      <div className="container">
        <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
          <Folio index={index} label={label} />
          <h1 className="font-accent text-5xl font-medium tracking-tight text-foreground md:text-6xl">
            {title}
          </h1>
          {dek ? (
            <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
              {dek}
            </p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}
