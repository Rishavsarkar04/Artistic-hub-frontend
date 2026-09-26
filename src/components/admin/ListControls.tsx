import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type ListQuery = { page: number; pageSize: number };

/**
 * Keeps an admin list's filters in the URL, so a filtered view survives refresh and can be shared.
 * `parse` reads the query from the URL; `update` writes changes back, going to page 1 unless a page
 * is given, and leaves values that equal `defaults` out of the URL.
 */
export function useListQuery<T extends ListQuery>(defaults: T, parse: (params: URLSearchParams) => T) {
  const [params, setParams] = useSearchParams();
  const query = useMemo(() => parse(params), [params]);
  const update = (changes: Partial<Omit<T, 'pageSize'>>) => {
    const next = { ...query, page: 1, ...changes };
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(next) as [string, unknown][]) {
      if (key === 'pageSize' || value === null || value === undefined || value === '' || value === defaults[key as keyof T]) continue;
      qs.set(key, String(value));
    }
    setParams(qs, { replace: true });
  };
  return { query, update };
}

/** Search input that reports its value shortly after typing stops, not on every keystroke. */
export function SearchBox({ value, onSearch, placeholder, label }: { value: string; onSearch: (q: string) => void; placeholder: string; label: string }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]); // follow outside changes, e.g. "Clear filters"
  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => onSearch(text), 300);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div className="relative flex-1 lg:max-w-sm">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={label}
        className="w-full h-10 pl-10 pr-3 rounded-full border border-border bg-card text-sm focus:outline-none focus:border-foreground/50" />
    </div>
  );
}

export function SegmentedTabs<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="no-scrollbar inline-flex max-w-full overflow-x-auto p-1 rounded-full bg-secondary" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} role="tab" aria-selected={value === o.id} onClick={() => onChange(o.id)}
          className={cn('h-8 px-3.5 rounded-full text-sm whitespace-nowrap transition-colors', value === o.id ? 'bg-card shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SortSelect<T extends string>({ id, options, value, onChange, label }: { id: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div className="relative shrink-0">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)}
        className="h-10 pl-4 pr-9 rounded-full border border-border bg-card text-sm appearance-none cursor-pointer focus:outline-none focus:border-foreground/50">
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

/** Page numbers to show: first, last, and the current page with its neighbours; gaps become '…'. */
function pageWindow(page: number, count: number): (number | '…')[] {
  const pages = [...new Set([1, page - 1, page, page + 1, count])].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  return pages.flatMap((n, i) => (i > 0 && n - pages[i - 1] > 1 ? (['…', n] as const) : [n]));
}

/** "Showing 1–10 of 77 orders" plus previous / page numbers / next. `noun` is [singular, plural]. */
export function Pagination({ page, pageSize, total, noun, onPage }: { page: number; pageSize: number; total: number; noun: [string, string]; onPage: (page: number) => void }) {
  const count = Math.max(1, Math.ceil(total / pageSize));
  // A page number past the end (an old link, or the list got shorter) jumps to the last page.
  useEffect(() => {
    if (total > 0 && page > count) onPage(count);
  }, [total, page, count]);
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const btn = 'size-9 rounded-full flex items-center justify-center tabular';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-sm">
      <p className="text-muted-foreground" aria-live="polite">Showing {from}–{to} of {total} {total === 1 ? noun[0] : noun[1]}</p>
      {count > 1 && (
        <nav className="flex items-center gap-1" aria-label="Pagination">
          <button onClick={() => onPage(page - 1)} disabled={page <= 1} aria-label="Previous page" className={cn(btn, 'hover:bg-card disabled:opacity-35 disabled:pointer-events-none')}>
            <ChevronLeft size={16} />
          </button>
          {pageWindow(page, count).map((n, i) =>
            n === '…' ? <span key={`gap-${i}`} className="w-6 text-center text-muted-foreground">…</span> : (
              <button key={n} onClick={() => onPage(n)} aria-current={n === page ? 'page' : undefined}
                className={cn(btn, n === page ? 'bg-ink text-[#F7F4EF] font-medium' : 'hover:bg-card')}>{n}</button>
            ),
          )}
          <button onClick={() => onPage(page + 1)} disabled={page >= count} aria-label="Next page" className={cn(btn, 'hover:bg-card disabled:opacity-35 disabled:pointer-events-none')}>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </div>
  );
}
