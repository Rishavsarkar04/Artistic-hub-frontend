import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

/** Convenience wrapper around the shadcn Dialog for simple title + body modals. */
export function Modal({ open, onClose, title, description, children, className }: {
  open: boolean; onClose: () => void; title?: string; description?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={cn(className)}>
        <DialogHeader>
          {title && <DialogTitle>{title}</DialogTitle>}
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">{title}</DialogDescription>}
        </DialogHeader>
        <div>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
