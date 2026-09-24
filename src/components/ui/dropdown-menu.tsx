import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const DropdownMenu = (props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) => <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
const DropdownMenuTrigger = (props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) => <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;

function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn('z-50 min-w-56 overflow-hidden rounded-2xl border border-border/70 bg-card p-1.5 shadow-[0_20px_50px_-20px_rgba(22,19,15,.35)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0', className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}
function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" className={cn('flex cursor-pointer select-none items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none data-[highlighted]:bg-secondary [&_svg]:size-4 [&_svg]:text-muted-foreground', className)} {...props} />;
}
function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label>) {
  return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" className={cn('px-3 py-2', className)} {...props} />;
}
function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn('my-1.5 h-px bg-border', className)} {...props} />;
}
const DropdownMenuRadioGroup = (props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) => <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn('flex cursor-pointer select-none items-center justify-between gap-6 rounded-xl px-3 py-2.5 text-sm text-muted-foreground outline-none transition-colors data-[highlighted]:bg-secondary data-[highlighted]:text-foreground data-[state=checked]:font-medium data-[state=checked]:text-foreground', className)}
      {...props}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator><Check size={16} /></DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  );
}

export { DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator };
