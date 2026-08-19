import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function AdminSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('wash-dusk -mx-4 px-4 py-6 md:-mx-6 md:px-6', className)}>
      {children}
    </section>
  );
}
