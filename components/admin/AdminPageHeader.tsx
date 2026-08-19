import type { ReactNode } from 'react';
import { Folio } from '@/components/public/Folio';

export function AdminPageHeader({
  index,
  section,
  title,
  description,
  actions,
}: {
  index: string;
  section: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Folio index={index} label={section} />
        <div className="gold-rule mb-4" />
        <h1 className="font-accent text-3xl font-medium tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
