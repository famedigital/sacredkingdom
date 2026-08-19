import { cn } from '@/lib/utils';

export function Folio({
  index,
  label,
  onDark = false,
}: {
  index: string;
  label: string;
  onDark?: boolean;
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span
        className={cn(
          'font-accent text-sm tabular-nums',
          onDark ? 'text-primary' : 'text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)]'
        )}
      >
        {index}
      </span>
      <span className="h-px w-8 bg-primary" />
      <p
        className={cn(
          'mb-0 text-[0.6875rem] font-semibold tracking-[0.28em] uppercase',
          onDark ? 'text-primary' : 'text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)]'
        )}
      >
        {label}
      </p>
    </div>
  );
}
