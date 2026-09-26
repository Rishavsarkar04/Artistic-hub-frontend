import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, ChevronDown, ImageOff, MoreHorizontal, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { paths } from '@/router/paths';
import { formatPaise } from '@/lib/money';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { LOW_STOCK, priceRange, queryMockProducts, totalStock, variantCover } from '@/data/admin/products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination, SearchBox, SegmentedTabs, SortSelect, useListQuery } from '@/components/admin/ListControls';
import { DeleteProductDialog } from '@/components/admin/DeleteProductDialog';
import { RemoveVariantDialog } from '@/components/admin/RemoveVariantDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { AdminProduct, AdminVariant, ProductQuery, ProductSort, ProductStatusFilter } from '@/types';

const STATUS_TABS: { id: ProductStatusFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
];
const SORTS: { id: ProductSort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'name', label: 'Name A–Z' },
  { id: 'price-low', label: 'Price: low to high' },
  { id: 'price-high', label: 'Price: high to low' },
  { id: 'stock-low', label: 'Lowest stock' },
];

const DEFAULTS: ProductQuery = { q: '', status: 'all', sort: 'newest', page: 1, pageSize: 10 };
const parse = (p: URLSearchParams): ProductQuery => ({
  ...DEFAULTS,
  q: p.get('q') ?? '',
  status: STATUS_TABS.find((t) => t.id === p.get('status'))?.id ?? 'all',
  sort: SORTS.find((s) => s.id === p.get('sort'))?.id ?? 'newest',
  page: Math.max(1, Number(p.get('page')) || 1),
});

/**
 * The product list for the current query, each product with its variants.
 * MOCK: swap the body for `useApiQuery<Paginated<AdminProduct>>(endpoints.admin.products.list, query)`.
 */
function useProducts(query: ProductQuery) {
  // `refetch` reloads after a change (e.g. a delete), as useApiQuery's will.
  const [reloadKey, setReloadKey] = useState(0);
  const data = useMemo(() => queryMockProducts(query), [query, reloadKey]);
  return { data, isLoading: false, refetch: () => setReloadKey((k) => k + 1) };
}

/** Row actions (the product name also opens Edit); Delete sits in here so it isn't one mis-click away. */
function ProductActions({ product, onDelete }: { product: AdminProduct; onDelete: () => void }) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="size-9 rounded-full border border-border flex items-center justify-center hover:border-foreground/40 outline-none focus-visible:ring-4 focus-visible:ring-ring/25 data-[state=open]:bg-secondary"
          aria-label={`More actions for ${product.name}`}>
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onSelect={() => navigate(paths.adminProductEdit(product.id))}><Pencil />Edit product</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDelete} className="text-destructive data-[highlighted]:bg-destructive/10 [&_svg]:text-destructive"><Trash2 />Delete product</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ActiveBadge({ active }: { active: boolean }) {
  return <Badge variant={active ? 'success' : 'secondary'}>{active ? 'Active' : 'Inactive'}</Badge>;
}

/** "₹899" or "₹899 – ₹2,499": selling prices across a product's variants. */
function PriceRange({ product }: { product: AdminProduct }) {
  const [min, max] = priceRange(product);
  return <>{min === max ? formatPaise(min) : `${formatPaise(min)} – ${formatPaise(max)}`}</>;
}

/** A product's total stock, plus how many of its variants are out or running low. */
function ProductStock({ product }: { product: AdminProduct }) {
  const total = totalStock(product);
  if (total === 0) return <span className="text-destructive font-medium">Out of stock</span>;
  const out = product.variants.filter((v) => v.stock === 0).length;
  const low = product.variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK).length;
  return (
    <span className="tabular">
      {total}
      {out > 0 && <span className="text-destructive font-medium"> · {out} out</span>}
      {low > 0 && <span className="text-[#8A5A12] font-medium"> · {low} low</span>}
    </span>
  );
}

const variantLabel = (n: number) => `${n} ${n === 1 ? 'variant' : 'variants'}`;

/** The labelled button that opens a product's variants: "3 variants ⌄", filled dark while open. */
function VariantsToggle({ product, expanded, onToggle, controls }: { product: AdminProduct; expanded: boolean; onToggle: () => void; controls: string }) {
  return (
    <button onClick={onToggle} aria-expanded={expanded} aria-controls={controls}
      aria-label={`${expanded ? 'Hide' : 'Show'} ${variantLabel(product.variants.length)} of ${product.name}`}
      className={cn('inline-flex items-center gap-1.5 h-8 pl-3.5 pr-2.5 rounded-full border text-[0.9375rem] font-medium whitespace-nowrap transition-colors',
        expanded ? 'bg-ink text-[#F7F4EF] border-ink' : 'bg-card border-border hover:border-foreground/50')}>
      {expanded ? 'Hide variants' : variantLabel(product.variants.length)}
      <ChevronDown size={15} className={cn('transition-transform', expanded && 'rotate-180')} />
    </button>
  );
}

/** A variant's stock, flagged when it runs low or out. */
function VariantStock({ count }: { count: number }) {
  if (count === 0) return <span className="text-destructive font-medium">Out of stock</span>;
  if (count <= LOW_STOCK) return <span className="text-[#8A5A12] font-medium tabular">{count} · Low</span>;
  return <span className="tabular">{count}</span>;
}

/** Selling price, with the original struck through when discounted. */
function VariantPrice({ v }: { v: AdminVariant }) {
  return (
    <span className="tabular whitespace-nowrap">
      {v.original_price > v.effective_price && <span className="text-muted-foreground line-through mr-1.5 text-xs">{formatPaise(v.original_price)}</span>}
      <span className="font-medium">{formatPaise(v.effective_price)}</span>
    </span>
  );
}

function VariantThumb({ v }: { v: AdminVariant }) {
  const cover = variantCover(v);
  return cover
    ? <img src={cover.url} alt="" className="size-11 shrink-0 rounded-lg object-cover bg-muted" />
    : <span className="size-11 shrink-0 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground"><ImageOff size={14} /></span>;
}

/** A variant's ⋯ menu: Edit variant (opens it on the product's edit page) and Remove variant (asks first; not for the last variant). */
function VariantActions({ product, v, onlyOne, onRemove }: { product: AdminProduct; v: AdminVariant; onlyOne: boolean; onRemove: () => void }) {
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="size-8 rounded-full border border-border flex items-center justify-center hover:border-foreground/40 hover:bg-card outline-none focus-visible:ring-4 focus-visible:ring-ring/25 data-[state=open]:bg-card"
          aria-label={`Actions for ${v.name}`}>
          <MoreHorizontal size={15} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onSelect={() => navigate(paths.adminProductEdit(product.id, v.id))}><Pencil />Edit variant</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onRemove} disabled={onlyOne}
          className="text-destructive data-[highlighted]:bg-destructive/10 [&_svg]:text-destructive data-[disabled]:opacity-45 data-[disabled]:pointer-events-none">
          <Trash2 />Remove variant
        </DropdownMenuItem>
        {onlyOne && <p className="px-3 pb-2 pt-0.5 text-xs text-muted-foreground">A product needs at least one variant.</p>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SMALL_TAGS = 'h-6 px-2 rounded-full bg-secondary text-[0.8125rem] text-foreground/75 inline-flex items-center';
/** Past this many variants the panel gets a filter box; the list itself always scrolls inside a fixed height. */
const FILTER_FROM = 6;

/**
 * A product's variants, opened from its row. Scrolls inside a fixed height (header stays put) so products
 * with many variants don't stretch the page, with a filter once there are more than a handful.
 */
function VariantsPanel({ product, id, layout, onRemove }: { product: AdminProduct; id: string; layout: 'table' | 'list'; onRemove: (v: AdminVariant) => void }) {
  const [q, setQ] = useState('');
  const onlyOne = product.variants.length === 1;
  const needle = q.trim().toLowerCase();
  const list = needle
    ? product.variants.filter((v) => [v.name, v.sku, v.slug, ...v.tags.map((t) => t.name)].join(' ').toLowerCase().includes(needle))
    : product.variants;

  return (
    <div id={id} className="space-y-3">
      {product.variants.length > FILTER_FROM && (
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter variants by name, SKU or tag" aria-label={`Filter ${product.name} variants`}
            className="w-full h-9 pl-9 pr-3 rounded-full border border-border bg-card text-xs focus:outline-none focus:border-foreground/50" />
        </div>
      )}

      <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-card">
        {list.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">No variants match “{q}”.</p>
        ) : layout === 'table' ? (
          <table className="w-full text-sm" aria-label={`Variants of ${product.name}`}>
            <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_var(--border)]">
              <tr className="text-left text-xs text-muted-foreground">
                <th scope="col" className="font-medium py-2.5 pl-4 pr-3">Variant</th>
                <th scope="col" className="font-medium py-2.5 px-3">SKU</th>
                <th scope="col" className="font-medium py-2.5 px-3">Tags</th>
                <th scope="col" className="font-medium py-2.5 px-3 text-right">Price</th>
                <th scope="col" className="font-medium py-2.5 px-3 text-right">Stock</th>
                <th scope="col" className="w-28 font-medium py-2.5 px-3">Status</th>
                <th scope="col" className="w-px py-2.5 pl-4 pr-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {list.map((v) => (
                <tr key={v.id} className={cn('hover:bg-secondary/30', !v.is_active && 'text-muted-foreground')}>
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <VariantThumb v={v} />
                      <div className="min-w-0">
                        <Link to={paths.adminProductEdit(product.id, v.id)} className="font-medium hover:underline underline-offset-4">{v.name}</Link>
                        <p className="font-mono text-[0.8125rem] text-muted-foreground truncate mt-0.5">{v.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[0.9375rem] text-muted-foreground whitespace-nowrap">{v.sku}</td>
                  <td className="py-3 px-3"><span className="flex flex-wrap gap-1">{v.tags.map((t) => <span key={t.id} className={SMALL_TAGS}>{t.name}</span>)}</span></td>
                  <td className="py-3 px-3 text-right"><VariantPrice v={v} /></td>
                  <td className="py-3 px-3 text-right whitespace-nowrap"><VariantStock count={v.stock} /></td>
                  <td className="w-28 py-3 px-3"><ActiveBadge active={v.is_active} /></td>
                  <td className="w-px py-3 pl-4 pr-4"><VariantActions product={product} v={v} onlyOne={onlyOne} onRemove={() => onRemove(v)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul className="divide-y divide-border/70" aria-label={`Variants of ${product.name}`}>
            {list.map((v) => (
              <li key={v.id} className={cn('flex items-start gap-3 p-3.5 text-[0.9375rem]', !v.is_active && 'text-muted-foreground')}>
                <VariantThumb v={v} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm truncate">{v.name}</span>
                    <VariantPrice v={v} />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5 text-muted-foreground">
                    <span className="font-mono">{v.sku}</span>
                    <span className="flex items-center gap-2"><VariantStock count={v.stock} />{!v.is_active && <ActiveBadge active={false} />}</span>
                  </div>
                  {v.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-1.5">{v.tags.map((t) => <span key={t.id} className={SMALL_TAGS}>{t.name}</span>)}</div>}
                </div>
                <VariantActions product={product} v={v} onlyOne={onlyOne} onRemove={() => onRemove(v)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">{needle ? `${list.length} of ${product.variants.length}` : variantLabel(product.variants.length)}</span>
        <Link to={paths.adminProductEdit(product.id)} className="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline">Edit variants <ArrowRight size={13} /></Link>
      </div>
    </div>
  );
}

export function ProductsPage() {
  const { query, update } = useListQuery(DEFAULTS, parse);
  const { data, isLoading, refetch } = useProducts(query);
  const [toDelete, setToDelete] = useState<AdminProduct | null>(null);
  const [toRemove, setToRemove] = useState<{ product: AdminProduct; variant: AdminVariant } | null>(null);
  const filtered = query.q !== '' || query.status !== 'all';
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (id: number) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Everything in the catalogue. Each product has one or more variants, each with its own SKU, prices and stock.</p>
        </div>
        <Button asChild className="shrink-0"><Link to={paths.adminProductNew}><Plus size={16} /> Add product</Link></Button>
      </div>


      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
        <SearchBox value={query.q} onSearch={(q) => update({ q })} placeholder="Search product, tag, variant, SKU or slug" label="Search products" />
        <div className="flex items-center gap-2 lg:ml-auto min-w-0">
          <SegmentedTabs options={STATUS_TABS} value={query.status} onChange={(status) => update({ status })} label="Filter by status" />
          <SortSelect id="product-sort" options={SORTS} value={query.sort} onChange={(sort) => update({ sort })} label="Sort products" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : data.items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto size-12 rounded-full bg-secondary flex items-center justify-center"><Package size={20} className="text-muted-foreground" /></span>
            <p className="font-medium mt-4">{filtered ? 'No products match these filters' : 'No products yet'}</p>
            {filtered && <Button variant="outline" size="sm" className="mt-4" onClick={() => update({ q: '', status: 'all' })}><X size={14} /> Clear filters</Button>}
          </div>
        ) : (
          <>
            {/* Table on larger screens: one row per product; the chevron opens its variants underneath */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th scope="col" className="font-medium pl-5 pr-3 py-3">Product</th>
                    <th scope="col" className="font-medium px-3 py-3">Variants</th>
                    <th scope="col" className="font-medium px-3 py-3 text-right">Price</th>
                    <th scope="col" className="font-medium px-3 py-3 text-right">Stock</th>
                    <th scope="col" className="font-medium px-3 py-3">Updated</th>
                    <th scope="col" className="font-medium px-3 py-3">Status</th>
                    <th scope="col" className="pl-3 pr-5 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                {data.items.map((p) => {
                  const expanded = open.has(p.id);
                  return (
                  <tbody key={p.id} className="border-b border-border last:border-0">
                    <tr className={cn('hover:bg-secondary/40', expanded && 'bg-secondary/40')}>
                      <td className="pl-5 pr-3 py-3 max-w-md">
                        <Link to={paths.adminProductEdit(p.id)} className="font-medium hover:underline underline-offset-4">{p.name}</Link>
                      </td>
                      <td className="px-3 py-3">
                        <VariantsToggle product={p} expanded={expanded} onToggle={() => toggle(p.id)} controls={`variants-${p.id}`} />
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap tabular font-medium"><PriceRange product={p} /></td>
                      <td className="px-3 py-3 text-right whitespace-nowrap"><ProductStock product={p} /></td>
                      <td className="px-3 py-3 whitespace-nowrap text-muted-foreground">{formatDate(p.updated_at)}</td>
                      <td className="px-3 py-3"><ActiveBadge active={p.is_active} /></td>
                      <td className="pl-3 pr-5 py-3 text-right">
                        <ProductActions product={p} onDelete={() => setToDelete(p)} />
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="bg-secondary/40">
                        <td colSpan={7} className="px-5 pb-4 pt-0">
                          <VariantsPanel product={p} id={`variants-${p.id}`} layout="table" onRemove={(variant) => setToRemove({ product: p, variant })} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                  );
                })}
              </table>
            </div>

            {/* Cards on phones */}
            <ul className="md:hidden divide-y divide-border">
              {data.items.map((p) => {
                const expanded = open.has(p.id);
                return (
                <li key={p.id}>
                  <Link to={paths.adminProductEdit(p.id)} className="flex items-start p-4 pb-2 hover:bg-secondary/40">
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-medium">{p.name}</span>
                        <ActiveBadge active={p.is_active} />
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5"><span className="text-foreground font-medium"><PriceRange product={p} /></span> · stock <ProductStock product={p} /></span>
                    </span>
                  </Link>
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between gap-2">
                      <VariantsToggle product={p} expanded={expanded} onToggle={() => toggle(p.id)} controls={`m-variants-${p.id}`} />
                      <ProductActions product={p} onDelete={() => setToDelete(p)} />
                    </div>
                    {expanded && <div className="mt-3"><VariantsPanel product={p} id={`m-variants-${p.id}`} layout="list" onRemove={(variant) => setToRemove({ product: p, variant })} /></div>}
                  </div>
                </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {toRemove && (
        <RemoveVariantDialog product={toRemove.product} variant={toRemove.variant} onClose={() => setToRemove(null)}
          onRemoved={() => {
            toast.success(`${toRemove.variant.name} was removed from ${toRemove.product.name}.`);
            setToRemove(null);
            refetch();
          }} />
      )}

      {toDelete && (
        <DeleteProductDialog product={toDelete} open onClose={() => setToDelete(null)}
          onDeleted={() => {
            toast.success(`${toDelete.name} was deleted.`);
            setToDelete(null);
            refetch();
          }} />
      )}

      <Pagination page={data.page} pageSize={data.pageSize} total={data.total} noun={['product', 'products']} onPage={(page) => update({ page })} />
    </div>
  );
}
