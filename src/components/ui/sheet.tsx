import * as React from 'react';
import * as SheetPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sheet = (props: React.ComponentProps<typeof SheetPrimitive.Root>) => <SheetPrimitive.Root data-slot="sheet" {...props} />;
const SheetTrigger = (props: React.ComponentProps<typeof SheetPrimitive.Trigger>) => <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
const SheetClose = (props: React.ComponentProps<typeof SheetPrimitive.Close>) => <SheetPrimitive.Close data-slot="sheet-close" {...props} />;

function SheetContent({ className, children, side = 'right', ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: 'top' | 'right' | 'bottom' | 'left' }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-ember/40 backdrop-blur-[6px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed z-50 flex flex-col bg-background shadow-2xl outline-none transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:duration-500 data-[state=closed]:duration-300',
          side === 'right' && 'inset-y-0 right-0 h-full w-full max-w-md data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right',
          side === 'left' && 'inset-y-0 left-0 h-full w-full max-w-md data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left',
          side === 'bottom' && 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom',
          side === 'top' && 'inset-x-0 top-0 data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top',
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute right-5 top-3.5 flex size-9 items-center justify-center rounded-full bg-secondary hover:bg-muted" aria-label="Close">
          <X size={16} />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}

const SheetHeader = ({ className, ...props }: React.ComponentProps<'div'>) => <div data-slot="sheet-header" className={cn('flex h-16 shrink-0 items-center border-b border-border px-6', className)} {...props} />;
const SheetFooter = ({ className, ...props }: React.ComponentProps<'div'>) => <div data-slot="sheet-footer" className={cn('mt-auto flex gap-2 border-t border-border p-4', className)} {...props} />;
const SheetTitle = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) => <SheetPrimitive.Title data-slot="sheet-title" className={cn('font-serif text-2xl', className)} {...props} />;
const SheetDescription = ({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) => <SheetPrimitive.Description data-slot="sheet-description" className={cn('text-sm text-muted-foreground', className)} {...props} />;

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
