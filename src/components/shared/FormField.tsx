import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/** shadcn Input + Label with inline hint / error text. */
interface TextFieldProps extends React.ComponentProps<'input'> {
  label?: string;
  error?: string;
  hint?: string;
  rightElement?: React.ReactNode;
}

export function TextField({ label, error, hint, rightElement, className, id, ...props }: TextFieldProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  const msgId = fieldId ? `${fieldId}-msg` : undefined;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <div className="relative">
        <Input id={fieldId} aria-invalid={!!error || undefined} aria-describedby={error || hint ? msgId : undefined} className={cn(rightElement && 'pr-12', className)} {...props} />
        {rightElement && <div className="absolute right-4 top-1/2 -translate-y-1/2">{rightElement}</div>}
      </div>
      {error ? <p id={msgId} className="text-xs text-destructive">{error}</p> : hint ? <p id={msgId} className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

interface SelectFieldProps extends React.ComponentProps<'select'> {
  label?: string;
  error?: string;
}

export function SelectField({ label, error, className, id, children, ...props }: SelectFieldProps) {
  const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={fieldId}>{label}</Label>}
      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={!!error || undefined}
          className={cn('h-12 w-full appearance-none rounded-xl border border-border bg-card pl-4 pr-10 text-sm outline-none hover:border-foreground/25 focus-visible:border-foreground/60 focus-visible:ring-4 focus-visible:ring-ring/15 aria-invalid:border-destructive disabled:opacity-50', className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
