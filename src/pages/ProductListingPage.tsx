import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paths } from '@/router/paths';
import { formatPrice } from '@/lib/money';
import { SlidersHorizontal, X, ChevronDown, Search, ArrowUpDown } from 'lucide-react';
import { products, collections as collectionData } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { ProductCard } from '@/components/product/ProductCard';
import { productPrice, allSoldOut } from '@/lib/product';
import { Slider } from '@/components/ui/slider';
import { photo } from '@/data/images';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { tags, getTag, productHasTag, tagSearchText } from '@/data/tags';

type SortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc';
const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

// Slider bounds, rounded out to the nearest ₹100 around the catalogue's prices.
const HEADER_BACKDROP = photo('photo-1613068431228-8cb6a1e92573', 1600, 700);

const PRICE_MIN = Math.floor(Math.min(...products.map(productPrice)) / 100) * 100;
const PRICE_MAX = Math.ceil(Math.max(...products.map(productPrice)) / 100) * 100;

interface Filters { tags: string[]; price: [number, number] }
const EMPTY: Filters = { tags: [], price: [PRICE_MIN, PRICE_MAX] };
const priceActive = (f: Filters) => f.price[0] > PRICE_MIN || f.price[1] < PRICE_MAX;

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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collection = searchParams.get('collection') ?? 'All';
  const [sort, setSort] = useState<SortOption>('featured');
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => {
    const initial = searchParams.get('tag')?.toLowerCase();
    return { ...EMPTY, tags: initial && getTag(initial) ? [initial] : [] };
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { setLoading(true); const t = setTimeout(() => setLoading(false), 350); return () => clearTimeout(t); }, [filters.tags, search, sort]); // not price: dragging the slider should update live

  const toggleTag = (id: string) =>
    setFilters((f) => ({ ...f, tags: f.tags.includes(id) ? f.tags.filter((x) => x !== id) : [...f.tags, id] }));
  const clearAll = () => { setFilters(EMPTY); setSearch(''); };

  const test = (p: (typeof products)[number], skip?: keyof Filters) => {
    const q = search.trim().toLowerCase();
    const price = productPrice(p);
    return (collection === 'All' || p.collection === collection) &&
      (!q || [p.name, p.scent, tagSearchText(p)].join(' ').toLowerCase().includes(q)) &&
      (skip === 'tags' || !filters.tags.length || filters.tags.some((t) => productHasTag(p, t))) &&
      (skip === 'price' || (price >= filters.price[0] && price <= filters.price[1]));
  };
  const count = (skip: keyof Filters, fn: (p: (typeof products)[number]) => boolean) => products.filter((p) => test(p, skip) && fn(p)).length;

  const filtered = useMemo(() => {
    const list = products.filter((p) => test(p));
    if (sort === 'price-asc') list.sort((a, b) => productPrice(a) - productPrice(b));
    if (sort === 'price-desc') list.sort((a, b) => productPrice(b) - productPrice(a));
    if (sort === 'newest') list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew));
    return list;
  }, [filters, search, sort, collection]);

  const activeCount = filters.tags.length + (priceActive(filters) ? 1 : 0);

  const head = HEADERS[collection] ?? HEADERS.All;

  const panel = (
    <div>
      <Group title="Price range">
        <div className="basis-full">
          <div className="flex items-center justify-between text-sm tabular mb-3">
            <span>{formatPrice(filters.price[0])}</span><span className="text-muted-foreground">to</span><span>{formatPrice(filters.price[1])}</span>
          </div>
          <Slider min={PRICE_MIN} max={PRICE_MAX} step={50} minStepsBetweenThumbs={1} value={filters.price} thumbLabels={['Minimum price', 'Maximum price']}
            onValueChange={(v) => setFilters((f) => ({ ...f, price: [v[0], v[1]] }))} />
          <div className="flex justify-between text-xs text-muted-foreground mt-2 tabular"><span>{formatPrice(PRICE_MIN)}</span><span>{formatPrice(PRICE_MAX)}</span></div>
        </div>
      </Group>
      <Group title="Tags">
        {tags.map((t) => (
          <Chip key={t.id} on={filters.tags.includes(t.id)} onClick={() => toggleTag(t.id)} count={count('tags', (p) => productHasTag(p, t.id))}>{t.name}</Chip>
        ))}
      </Group>
    </div>
  );

  return (
    <div>
      {/* Header band */}
      <section className="px-3 sm:px-4 pt-3">
        <div className={`relative rounded-[28px] overflow-hidden ${head.img ? 'bg-ink text-[#F7F4EF]' : 'bg-secondary'} `}>
          {head.img ? (
            <><img src={head.img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" /><div className="absolute inset-0 bg-gradient-to-r from-ink/85 to-ink/10" /></>
          ) : (
            // Backdrop for headers without their own image, washed out on the left behind the text.
            <>
              <img src={HEADER_BACKDROP} alt="" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/70 to-transparent" />
            </>
          )}
          <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
            <nav aria-label="Breadcrumb" className={`text-sm mb-6 flex gap-2 ${head.img ? 'text-white/60' : 'text-muted-foreground'}`}>
              <button onClick={() => navigate(paths.home)} className="hover:underline">Home</button><span>/</span>
              {collection !== 'All' && <><button onClick={() => navigate(paths.shop())} className="hover:underline">Shop</button><span>/</span></>}
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
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-1 max-w-md mr-auto">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="search" placeholder="Search candles, notes or scents" aria-label="Search products" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 rounded-full border border-border bg-card text-sm focus:outline-none focus:border-foreground/50" />
              </div>
              <Button variant="outline" size="sm" className="lg:hidden h-10" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal size={15} />Filter{activeCount > 0 && <span className="tabular">({activeCount})</span>}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="group h-10 pl-4 pr-3.5 rounded-full border border-border bg-card text-sm flex items-center gap-2 whitespace-nowrap outline-none hover:border-foreground/40 focus-visible:ring-4 focus-visible:ring-ring/25 data-[state=open]:border-foreground/50">
                    <ArrowUpDown size={15} className="text-muted-foreground" />
                    <span className="text-muted-foreground hidden sm:inline">Sort:</span>
                    <span className="font-medium">{SORT_OPTIONS.find((o) => o.id === sort)!.label}</span>
                    <ChevronDown size={15} className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-52">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Sort by</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setSort(v as SortOption)}>
                    {SORT_OPTIONS.map((o) => <DropdownMenuRadioItem key={o.id} value={o.id}>{o.label}</DropdownMenuRadioItem>)}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="flex gap-12 mt-8">
          <aside className="hidden lg:block w-64 shrink-0" aria-label="Filters">
            <div className="sticky top-40">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground" aria-live="polite">{loading ? 'Updating' : `${filtered.length} ${filtered.length === 1 ? 'candle' : 'candles'}`}</p>
                {activeCount > 0 && <button onClick={clearAll} className="text-sm underline underline-offset-4">Clear all</button>}
              </div>
              {panel}
            </div>
          </aside>

          <div className="flex-1 min-w-0">
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
