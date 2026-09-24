import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

function Slider({ className, defaultValue, value, min = 0, max = 100, thumbLabels, ...props }: React.ComponentProps<typeof SliderPrimitive.Root> & { thumbLabels?: string[] }) {
  const thumbs = React.useMemo(() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]), [value, defaultValue, min, max]);
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn('relative flex w-full touch-none select-none items-center py-2 data-[disabled]:opacity-50', className)}
      {...props}
    >
      <SliderPrimitive.Track data-slot="slider-track" className="relative h-1 w-full grow overflow-hidden rounded-full bg-border">
        <SliderPrimitive.Range data-slot="slider-range" className="absolute h-full bg-ink" />
      </SliderPrimitive.Track>
      {thumbs.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          aria-label={thumbLabels?.[i]}
          data-slot="slider-thumb"
          className="block size-5 rounded-full border-2 border-ink bg-card shadow-sm transition-transform hover:scale-110 outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
        />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider };
