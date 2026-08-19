'use client';

import { Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContactActions } from '@/hooks/use-whatsapp-link';

export function EmailUsButton({
  onDark = false,
  compact = false,
  className,
}: {
  onDark?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { mailtoHref } = useContactActions();

  return (
    <a
      href={mailtoHref}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium tracking-[0.16em] uppercase transition-colors',
        '[-webkit-tap-highlight-color:transparent]',
        compact
          ? 'h-8 px-3.5 text-[11px] leading-none'
          : 'h-11 px-6 text-[13px]',
        onDark
          ? 'border border-primary text-primary hover:bg-primary/15'
          : 'border border-primary/50 text-foreground hover:bg-primary/10',
        className
      )}
    >
      <Mail className={compact ? 'size-3.5' : 'size-4'} strokeWidth={2.2} />
      Email us
    </a>
  );
}
