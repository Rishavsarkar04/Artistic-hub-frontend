import { Check, MapPin, Eye } from 'lucide-react';

export type Step = 'shipping' | 'review';

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: 'shipping', label: 'Shipping', icon: MapPin },
  { id: 'review', label: 'Review & pay', icon: Eye },
];

/** Two-part progress bar; finished steps stay clickable to go back. */
export function StepIndicator({ current, onSelect }: { current: Step; onSelect: (s: Step) => void }) {
  const currentIdx = steps.findIndex((s) => s.id === current);
  return (
    <ol className="grid grid-cols-2 gap-3 mb-10" aria-label="Checkout progress">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = step.icon;
        return (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => done && onSelect(step.id)}
              disabled={!done}
              aria-current={active ? 'step' : undefined}
              className="group w-full text-left disabled:cursor-default"
            >
              <span className="block h-1.5 rounded-full bg-border overflow-hidden">
                <span className={`block h-full rounded-full bg-primary transition-all duration-500 ${done || active ? 'w-full' : 'w-0'}`} />
              </span>
              <span className="mt-3 flex items-center gap-2.5">
                <span className={`size-8 shrink-0 rounded-full flex items-center justify-center transition-colors ${done ? 'bg-primary text-primary-foreground' : active ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {done ? <Check size={15} /> : <Icon size={15} />}
                </span>
                <span className="leading-tight">
                  <span className="block text-xs text-muted-foreground">Step {i + 1} of {steps.length}</span>
                  <span className={`block text-sm font-medium ${active || done ? 'text-foreground' : 'text-muted-foreground'} ${done ? 'group-hover:underline underline-offset-4' : ''}`}>{step.label}</span>
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
