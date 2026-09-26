import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.8125rem] font-medium leading-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-card/90 text-foreground backdrop-blur-sm',
        secondary: 'bg-secondary text-secondary-foreground',
        outline: 'ring-1 ring-inset ring-border text-foreground',
        success: 'bg-[#E4EEE3] text-[#2F5E36]',
        warning: 'bg-[#F6EAD2] text-[#8A5A12]',
        destructive: 'bg-[#F6E1DD] text-[#9E3326]',
        dark: 'bg-ink text-[#F7F4EF]',
        glow: 'bg-glow text-ink',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, asChild = false, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
