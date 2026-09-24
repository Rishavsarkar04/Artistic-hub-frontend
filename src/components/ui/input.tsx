import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-12 w-full min-w-0 rounded-xl border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground transition-[color,box-shadow,border-color] outline-none',
        'hover:border-foreground/25 focus-visible:border-foreground/60 focus-visible:ring-4 focus-visible:ring-ring/15',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

export { Input };
