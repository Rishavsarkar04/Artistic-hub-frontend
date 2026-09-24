import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, Search } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { products, collections as collectionData } from '../data/products';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ProductCard, fromPrice, allSoldOut } from '../components/product/ProductCard';
import { matchScent } from './HomePage';

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';

const scents = ['Woody', 'Floral', 'Fresh', 'Sweet', 'Amber', 'Earthy', 'Citrus'];
const collectionTabs = ['All', 'Signature', 'Botanical', 'Coastal', 'Gift Sets'];
const sizes = ['Small', 'Medium', 'Large'];
const prices = [
  { id: 'u40', label: 'Under $40', test: (v: number) => v < 40 },
  { id: '40-70', label: '$40 to $70', test: (v: number) => v >= 40 && v <= 70 },
  { id: 'o70', label: 'Over $70', test: (v: number) => v > 70 },
];

interface Filters { scents: string[]; sizes: string[]; prices: string[]; inStockOnly: boolean }
const EMPTY: Filters = { scents: [], sizes: [], prices: [], inStockOnly: false };

const HEADERS: Record<string, { title: string; sub: string; img?: string }> = {
  All: { title: 'All candles', sub: 'Every scent we pour, from quiet florals to smoky woods.' },
  Signature: { title: 'Signature', sub: collectionData[0].description, img: collectionData[0].image },
  Botanical: { title: 'Botanical', sub: collectionData[1].description, img: collectionData[1].image },
  Coastal: { title: 'Coastal', sub: 'Salt air, driftwood and clean linen for bright rooms.' },
  'Gift Sets': { title: 'Gift sets', sub: collectionData[2].description, img: collectionData[2].image },
};

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <fieldset className="border-b border-border py-5">
      <legend className="sr-only">{title}</legend>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="w-full flex items-center justify-between text-sm font-medium">
        {title}<ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-4 flex flex-wrap gap-2">{children}</div>}
    </fieldset>
  );
}

function Chip({ on, onClick, children, count }: { on: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} disabled={count === 0 && !on}
      className={`h-9 px-3.5 rounded-full text-[13px] border flex items-center gap-1.5 disabled:opacity-35 disabled:cursor-not-allowed ${on ? 'bg-ink text-[#F7F4EF] border-ink' : 'bg-card border-border hover:border-foreground/40'}`}>
      {children}{count !== undefined && <span className={`tabular ${on ? 'text-white/60' : 'text-muted-foreground'}`}>{count}</span>}
    </button>
  );
}

export function ProductListingPage() {
  const { state, navigate } = useApp();
  const collection = state.listingCollection || 'All';
  const [sort, setSort] = useState<SortOption>('featured');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ ...EMPTY, scents: state.listingScent ? [state.listingScent] : [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t); }, [filters, search, sort]);

  const toggle = (k: 'scents' | 'sizes' | 'prices', v: string) =>
    setFilters((f) => ({ ...f, [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v] }));
  const clearAll = () => { setFilters(EMPTY); setSearch(''); };

  const test = (p: (typeof products)[number], skip?: keyof Filters) => {
    const q = search.trim().toLowerCase();
    return (collection === 'All' || p.collection === collection) &&
      (!q || [p.name, p.scent, ...p.tags].join(' ').toLowerCase().includes(q)) &&
      (skip === 'scents' || !filters.scents.length || filters.scents.some((s) => matchScent(p.tags, p.scent, s))) &&
      (skip === 'sizes' || !filters.sizes.length || p.sizes.some((s) => filters.sizes.includes(s.label))) &&
      (skip === 'prices' || !filters.prices.length || filters.prices.some((id) => prices.find((x) => x.id === id)!.test(fromPrice(p)))) &&
      (skip === 'inStockOnly' || !filters.inStockOnly || !allSoldOut(p));
  };
  const count = (skip: keyof Filters, fn: (p: (typeof products)[number]) => boolean) => products.filter((p) => test(p, skip) && fn(p)).length;

  const filtered = useMemo(() => {
    const list = products.filter((p) => test(p));
    if (sort === 'price-asc') list.sort((a, b) => fromPrice(a) - fromPrice(b));
    if (sort === 'price-desc') list.sort((a, b) => fromPrice(b) - fromPrice(a));
    if (sort === 'newest') list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return list;
  }, [filters, search, sort, collection]);

  const chips: [keyof Filters, string, string][] = [
    ...filters.scents.map((v) => ['scents', v, v] as [keyof Filters, string, string]),
    ...filters.sizes.map((v) => ['sizes', v, v] as [keyof Filters, string, string]),
    ...filters.prices.map((v) => ['prices', v, prices.find((x) => x.id === v)!.label] as [keyof Filters, string, string]),
    ...(filters.inStockOnly ? [['inStockOnly', 'in', 'In stock'] as [keyof Filters, string, string]] : []),
  ];
  const removeChip = (k: keyof Filters, v: string) => (k === 'inStockOnly' ? setFilters((f) => ({ ...f, inStockOnly: false })) : toggle(k as 'scents', v));
  const head = HEADERS[collection] ?? HEADERS.All;

  const panel = (
    <div>
      <Group title="Scent family">
        {scents.map((s) => <Chip key={s} on={filters.scents.includes(s)} onClick={() => toggle('scents', s)} count={count('scents', (p) => matchScent(p.tags, p.scent, s))}>{s}</Chip>)}
      </Group>
      <Group title="Size">
        {sizes.map((s) => <Chip key={s} on={filters.sizes.includes(s)} onClick={() => toggle('sizes', s)} count={count('sizes', (p) => p.sizes.some((x) => x.label === s))}>{s}</Chip>)}
      </Group>
      <Group title="Price">
        {prices.map((b) => <Chip key={b.id} on={filters.prices.includes(b.id)} onClick={() => toggle('prices', b.id)} count={count('prices', (p) => b.test(fromPrice(p)))}>{b.label}</Chip>)}
      </Group>
      <div className="py-5">
        <label className="flex items-center justify-between text-sm font-medium cursor-pointer">
          In stock only
          <span className="relative">
            <input type="checkbox" className="peer sr-only" checked={filters.inStockOnly} onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))} />
            <span className="block w-10 h-6 rounded-full bg-border peer-checked:bg-ink transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
            <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header band */}
      <section className="px-3 sm:px-4 pt-3">
        <div className={`relative rounded-[28px] overflow-hidden ${head.img ? 'bg-ink text-[#F7F4EF]' : 'bg-secondary'} `}>
          {head.img && <><img src={head.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-r from-ink/85 to-ink/10" /></>}
          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
            <nav aria-label="Breadcrumb" className={`text-sm mb-6 flex gap-2 ${head.img ? 'text-white/60' : 'text-muted-foreground'}`}>
              <button onClick={() => navigate('home')} className="hover:underline">Home</button><span>/</span>
              {collection !== 'All' && <><button onClick={() => navigate('listing', { collection: 'All' })} className="hover:underline">Shop</button><span>/</span></>}
              <span aria-current="page" className={head.img ? 'text-white' : 'text-foreground'}>{head.title}</span>
            </nav>
            <h1 className="display-xl text-6xl sm:text-7xl lg:text-8xl">{head.title}</h1>
            <p className={`mt-4 max-w-md ${head.img ? 'text-white/80' : 'text-muted-foreground'}`}>{head.sub}</p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Collection tabs + toolbar */}
        <div className="sticky top-16 lg:top-[72px] z-30 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 glass-light border-b border-border/70 mt-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 py-3">
            <div className="no-scrollbar flex gap-1 overflow-x-auto" role="tablist" aria-label="Collections">
              {collectionTabs.map((c) => (
                <button key={c} role="tab" aria-selected={collection === c} onClick={() => navigate('listing', { collection: c, scent: filters.scents[0] ?? null })}
                  className={`h-9 px-4 rounded-full text-sm whitespace-nowrap ${collection === c ? 'bg-ink text-[#F7F4EF]' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'}`}>
                  {c === 'All' ? 'All' : c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 lg:ml-auto">
              <div className="relative flex-1 lg:w-64 lg:flex-none">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="search" placeholder="Search this collection" aria-label="Search products" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-full border border-border bg-card text-sm focus:outline-none focus:border-foreground/50" />
              </div>
              <Button variant="outline" size="sm" className="lg:hidden h-10" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal size={15} />Filter{chips.length > 0 && <span className="tabular">({chips.length})</span>}
              </Button>
              <div className="relative">
                <label htmlFor="sort" className="sr-only">Sort by</label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}
                  className="h-10 pl-4 pr-9 rounded-full border border-border bg-card text-sm appearance-none cursor-pointer focus:outline-none focus:border-foreground/50">
                  <option value="featured">Featured</option><option value="newest">Newest</option>
                  <option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option>
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-12 mt-8">
          <aside className="hidden lg:block w-64 shrink-0" aria-label="Filters">
            <div className="sticky top-40">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground" aria-live="polite">{loading ? 'Updating' : `${filtered.length} ${filtered.length === 1 ? 'candle' : 'candles'}`}</p>
                {chips.length > 0 && <button onClick={clearAll} className="text-sm underline underline-offset-4">Clear all</button>}
              </div>
              {panel}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {chips.map(([k, v, l]) => (
                  <button key={k + v} onClick={() => removeChip(k, v)} className="h-8 pl-3 pr-2 rounded-full bg-secondary text-[13px] flex items-center gap-1 hover:bg-muted" aria-label={`Remove ${l}`}>
                    {l}<X size={14} />
                  </button>
                ))}
                <button onClick={clearAll} className="text-[13px] underline underline-offset-4 ml-1 lg:hidden">Clear all</button>
              </div>
            )}
            {loading ? (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} aria-hidden><div className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" /><div className="h-5 w-2/3 bg-muted rounded mt-4 animate-pulse" /><div className="h-4 w-1/2 bg-muted rounded mt-2 animate-pulse" /></div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl bg-card p-12 text-center">
                <p className="font-serif text-3xl">Nothing matches yet</p>
                <p className="text-sm text-muted-foreground mt-2 mb-6">Remove a filter, switch collection, or search for a note like cedar or rose.</p>
                <Button variant="outline" onClick={clearAll}>Clear all filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4 gap-y-10 sm:gap-x-6">
                {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="right">
          <SheetHeader><SheetTitle>Filter</SheetTitle><SheetDescription className="sr-only">Narrow the candles shown</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto px-6">{panel}</div>
          <SheetFooter>
            <Button variant="outline" className="flex-1" onClick={clearAll}>Clear all</Button>
            <Button className="flex-1" onClick={() => setFilterOpen(false)}>Show {products.filter((p) => test(p)).length} candles</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
