import * as React from 'react';
import { cn } from '@/lib/utils';

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex min-h-28 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground outline-none transition-[box-shadow,border-color]',
        'hover:border-foreground/25 focus-visible:border-foreground/60 focus-visible:ring-4 focus-visible:ring-ring/15 aria-invalid:border-destructive disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
