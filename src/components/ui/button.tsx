import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn/ui Button, extended with the Ember & Bloom "light" and "glass" variants and a loading state.
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium cursor-pointer transition-all active:scale-[.98] disabled:pointer-events-none disabled:opacity-40 outline-none focus-visible:ring-4 focus-visible:ring-ring/30 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-flame text-primary-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-foreground/15 bg-transparent text-foreground hover:border-foreground/40 hover:bg-card',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-muted',
        ghost: 'bg-transparent text-foreground hover:bg-foreground/5',
        link: 'h-auto px-0 text-foreground underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground',
        light: 'bg-[#F7F4EF] text-ink hover:bg-white',
        glass: 'glass text-white hover:bg-white/25',
      },
      size: {
        default: 'h-11 px-6 text-sm',
        md: 'h-11 px-6 text-sm',
        sm: 'h-9 px-4 text-[0.9375rem]',
        lg: 'h-13 px-8 text-[1rem]',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps extends React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }: ButtonProps) {
  if (asChild) {
    return <Slot data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>{children}</Slot>;
  }
  const Comp = 'button';
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), variant === 'link' && 'h-auto px-0', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
