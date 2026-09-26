import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, ArrowLeft, ChevronDown, ImageOff, Plus, Trash2 } from 'lucide-react';
import { paths } from '@/router/paths';
import { formatPaise, rupeesToPaise } from '@/lib/money';
import { cn } from '@/lib/utils';
import { createMockProduct, getMockProduct, slugify, updateMockProduct, uploadMockImage } from '@/data/admin/products';
import { DeleteProductDialog } from '@/components/admin/DeleteProductDialog';
import { ImageUploader, toImageDrafts, type ImageDraft } from '@/components/admin/ImageUploader';
import { TagPicker, useTagList } from '@/components/admin/TagPicker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TextField } from '@/components/shared/FormField';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { AdminProduct, AdminVariant, NewAdminProduct } from '@/types';

/** A variant as edited in the form. Prices are rupees as typed ("499.50") and become paise on save. */
interface VariantDraft {
  key: number;
  /** The saved variant's id when editing; new variants have none. */
  id?: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  originalPrice: string;
  effectivePrice: string;
  stock: string;
  isActive: boolean;
  images: ImageDraft[];
  tagIds: number[];
  /** Slug and SKU follow the names until edited by hand. */
  slugEdited: boolean;
  skuEdited: boolean;
  /** Card expanded for editing. */
  open: boolean;
}
type VariantField = 'name' | 'slug' | 'sku' | 'originalPrice' | 'effectivePrice' | 'stock' | 'images';
type VariantErrors = Partial<Record<VariantField, string>>;

let nextKey = 1;
const emptyVariant = (): VariantDraft => ({
  key: nextKey++, name: '', slug: '', sku: '', description: '', originalPrice: '', effectivePrice: '', stock: '0',
  isActive: true, images: [], tagIds: [], slugEdited: false, skuEdited: false, open: true,
});
/** 49950 paise → "499.50"; 99900 → "999". */
const paiseToInput = (paise: number) => (paise % 100 === 0 ? String(paise / 100) : (paise / 100).toFixed(2));
/** A saved variant as a (collapsed) form card. Its slug and SKU count as hand-set, so renaming won't change them. */
const fromVariant = (v: AdminVariant): VariantDraft => ({
  key: nextKey++, id: v.id, name: v.name, slug: v.slug, sku: v.sku, description: v.description ?? '',
  originalPrice: paiseToInput(v.original_price), effectivePrice: paiseToInput(v.effective_price), stock: String(v.stock),
  isActive: v.is_active, images: toImageDrafts([...v.images].sort((a, b) => a.sort_order - b.sort_order)), tagIds: v.tags.map((t) => t.id),
  slugEdited: true, skuEdited: true, open: false,
});

/** EB-WS-S from "Winter Spice" + "Small · 4 oz"; editable, it's only a starting point. */
const suggestSku = (product: string, variant: string) => {
  const p = product.replace(/&/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase();
  const v = variant.trim()[0]?.toUpperCase() ?? '';
  return p && v ? `EB-${p}-${v}` : '';
};
/** Auto-fill slug and SKU from the names unless the admin has typed their own. */
const withSuggestions = (v: VariantDraft, product: string): VariantDraft => ({
  ...v,
  slug: v.slugEdited ? v.slug : v.name.trim() ? slugify(product, v.name) : '',
  sku: v.skuEdited ? v.sku : suggestSku(product, v.name),
});

/** Rupees with at most two decimals, e.g. "999" or "499.50". */
const isRupees = (s: string) => /^\d+(\.\d{1,2})?$/.test(s.trim());
const isWholeNumber = (s: string) => /^\d+$/.test(s.trim());
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function Section({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="bg-card border border-border rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** On/off switch for `is_active`. */
function ActiveSwitch({ id, checked, onChange, label, hint }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string; hint: string }) {
  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 cursor-pointer">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span className="relative shrink-0">
        <input id={id} type="checkbox" role="switch" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="block w-10 h-6 rounded-full bg-border peer-checked:bg-ink transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-ring/25" />
        <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

/** Add product (no id in the URL) or Edit product (`/admin/products/:productId/edit`). */
export function ProductFormPage() {
  const { productId } = useParams();
  // ?variant=<id> (from the product list) opens that variant's card on arrival.
  const focusVariantId = Number(useSearchParams()[0].get('variant')) || undefined;
  // MOCK: with the API, load it with useApiQuery<AdminProduct>(endpoints.admin.products.detail(id)).
  const product = productId ? getMockProduct(Number(productId)) : undefined;
  if (productId && !product) return <NotFoundPage title="Product not found" message="It may have been deleted." />;
  // Keyed so switching between products starts a fresh form.
  return <ProductForm key={productId ?? 'new'} product={product} focusVariantId={focusVariantId} />;
}

function ProductForm({ product, focusVariantId }: { product?: AdminProduct; focusVariantId?: number }) {
  const navigate = useNavigate();
  const editing = !!product;
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  // One tag list for every picker on the page, so a tag created anywhere can be used everywhere.
  const tagList = useTagList();
  const [variants, setVariants] = useState<VariantDraft[]>(() =>
    product ? product.variants.map((v) => ({ ...fromVariant(v), open: v.id === focusVariantId })) : [emptyVariant()],
  );
  // Bring the variant opened from the list into view.
  useEffect(() => {
    if (focusVariantId === undefined) return;
    const card = document.getElementById(`variant-card-${focusVariantId}`);
    card?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    card?.querySelector<HTMLElement>('button[aria-expanded]')?.focus({ preventScroll: true });
  }, [focusVariantId]);
  const [errors, setErrors] = useState<{ name?: string; variants?: Record<number, VariantErrors> }>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setProductName = (value: string) => {
    setName(value);
    setVariants((vs) => vs.map((v) => withSuggestions(v, value)));
  };
  const updateVariant = (key: number, changes: Partial<VariantDraft>) =>
    setVariants((vs) => vs.map((v) => (v.key === key ? withSuggestions({ ...v, ...changes }, name) : v)));
  // Each variant's uploader updates only that variant's photos; functional updates keep late uploads safe.
  const setVariantImages = (key: number): React.Dispatch<React.SetStateAction<ImageDraft[]>> => (action) =>
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, images: typeof action === 'function' ? action(v.images) : action } : v)));
  const setAllOpen = (open: boolean) => setVariants((vs) => vs.map((v) => ({ ...v, open })));
  const allOpen = variants.every((v) => v.open);

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Product name is required';
    const skus = variants.map((v) => v.sku.trim().toUpperCase());
    const slugs = variants.map((v) => v.slug.trim());
    const vErrs: Record<number, VariantErrors> = {};
    variants.forEach((v, i) => {
      const e: VariantErrors = {};
      if (!v.name.trim()) e.name = 'Name the variant, e.g. Small · 4 oz';
      if (!v.slug.trim()) e.slug = 'Slug is required';
      else if (!SLUG_RE.test(v.slug.trim())) e.slug = 'Use lowercase letters, numbers and hyphens';
      else if (slugs.indexOf(slugs[i]) !== i) e.slug = 'Each variant needs its own slug';
      if (!v.sku.trim()) e.sku = 'SKU is required';
      else if (skus.indexOf(skus[i]) !== i) e.sku = 'Each variant needs its own SKU';
      if (!isRupees(v.originalPrice) || Number(v.originalPrice) <= 0) e.originalPrice = 'Enter the price in rupees, e.g. 999';
      if (!isRupees(v.effectivePrice) || Number(v.effectivePrice) <= 0) e.effectivePrice = 'Enter the price in rupees, e.g. 899';
      else if (!e.originalPrice && Number(v.effectivePrice) > Number(v.originalPrice)) e.effectivePrice = "Can't be more than the original price";
      if (!isWholeNumber(v.stock)) e.stock = 'Enter stock (0 or more)';
      if (v.images.some((img) => img.status === 'uploading')) e.images = 'Wait for the photos to finish uploading.';
      else if (v.images.some((img) => img.status === 'error')) e.images = 'Retry or remove the photos that failed to upload.';
      if (Object.keys(e).length) vErrs[v.key] = e;
    });
    if (Object.keys(vErrs).length) errs.variants = vErrs;
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      // Open the variants that need fixing, then bring the first problem into view.
      setVariants((vs) => vs.map((v) => (errs.variants?.[v.key] ? { ...v, open: true } : v)));
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"], [data-error="true"]')?.focus());
      return;
    }
    const input: NewAdminProduct = {
      name: name.trim(),
      description: description.trim() || null,
      is_active: isActive,
      variants: variants.map((v) => ({
        ...(v.id !== undefined && { id: v.id }),
        name: v.name.trim(),
        slug: v.slug.trim(),
        description: v.description.trim() || null,
        sku: v.sku.trim().toUpperCase(),
        original_price: rupeesToPaise(Number(v.originalPrice)),
        effective_price: rupeesToPaise(Number(v.effectivePrice)),
        stock: Number(v.stock),
        is_active: v.isActive,
        tag_ids: v.tagIds,
        // Saved in the order shown; the first is the variant's cover.
        images: v.images.map((img, i) => ({ url: img.url!, alt_text: img.alt.trim() || null, sort_order: i })),
      })),
    };
    setSaving(true);
    setSaveError('');
    try {
      // MOCK: with the API these become useApiMutation calls:
      //   create: useApiMutation<AdminProduct, NewAdminProduct>(endpoints.admin.products.create, 'POST')
      //   update: useApiMutation<AdminProduct, NewAdminProduct>(endpoints.admin.products.update(product.id), 'PUT')
      const saved: AdminProduct = editing ? await updateMockProduct(product.id, input) : await createMockProduct(input);
      toast.success(`${saved.name} was ${editing ? 'updated' : 'added'}.`);
      navigate(paths.adminProducts());
    } catch (err) {
      // e.g. a 422 because a SKU or slug is already used by another product.
      setSaveError(err instanceof Error ? err.message : 'The product could not be saved. Please try again.');
      setSaving(false);
    }
  };

  // Live summary for the side panel (selling prices, in paise).
  const prices = variants.filter((v) => isRupees(v.effectivePrice) && Number(v.effectivePrice) > 0).map((v) => rupeesToPaise(Number(v.effectivePrice)));
  const stock = variants.reduce((n, v) => n + (isWholeNumber(v.stock) ? Number(v.stock) : 0), 0);
  const activeCount = variants.filter((v) => v.isActive).length;
  const photos = variants.reduce((n, v) => n + v.images.length, 0);
  const tagCount = new Set(variants.flatMap((v) => v.tagIds)).size;
  const priceText = !prices.length ? '—' : Math.min(...prices) === Math.max(...prices) ? formatPaise(prices[0]) : `${formatPaise(Math.min(...prices))} – ${formatPaise(Math.max(...prices))}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <Link to={paths.adminProducts()} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft size={15} /> Products
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mt-3">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl sm:text-4xl break-words">{editing ? `Edit ${product.name}` : 'Add product'}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editing ? 'Change the product, its variants and their photos.' : 'Add the product once, then one variant for each size or option you sell.'}
          </p>
        </div>
        {editing && (
          <button type="button" onClick={() => setConfirmDelete(true)}
            className="shrink-0 self-start inline-flex items-center gap-2 h-10 px-4 rounded-full border-2 border-destructive/60 text-destructive text-sm font-semibold transition-colors hover:bg-destructive hover:text-white hover:border-destructive">
            <Trash2 size={16} strokeWidth={2.25} /> Delete product
          </button>
        )}
      </div>

      {editing && (
        <DeleteProductDialog product={product} open={confirmDelete} onClose={() => setConfirmDelete(false)}
          onDeleted={() => { toast.success(`${product.name} was deleted.`); navigate(paths.adminProducts(), { replace: true }); }} />
      )}

      <form onSubmit={handleSubmit} noValidate className="grid lg:grid-cols-[1fr_300px] gap-6 mt-6">
        <div className="space-y-6 min-w-0">
          <Section title="Details">
            <div className="space-y-4">
              <TextField id="product-name" label="Product name" value={name} onChange={(e) => setProductName(e.target.value)} error={errors.name} placeholder="e.g. Winter Spice" />
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="product-description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Textarea id="product-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="How it smells, what it's made of, how long it burns. Variants without their own description use this." />
              </div>
              <ActiveSwitch id="product-active" checked={isActive} onChange={setIsActive} label="Active" hint="Inactive products are hidden from the shop." />
            </div>
          </Section>

          <Section
            title={`Variants (${variants.length})`}
            description="Each size or option customers can buy, with its own photos. Prices are in rupees; the selling price can't be more than the original price."
            action={variants.length > 1 && (
              <button type="button" onClick={() => setAllOpen(!allOpen)} className="shrink-0 text-sm font-medium underline-offset-4 hover:underline">
                {allOpen ? 'Collapse all' : 'Expand all'}
              </button>
            )}
          >
            <ol className="space-y-3">
              {variants.map((v, i) => {
                const ve = errors.variants?.[v.key] ?? {};
                const hasErrors = Object.keys(ve).length > 0;
                const id = (f: string) => `variant-${v.key}-${f}`;
                const thumb = v.images[0];
                return (
                  <li key={v.key} id={v.id !== undefined ? `variant-card-${v.id}` : undefined} className={cn('rounded-xl border scroll-mt-24', hasErrors ? 'border-destructive/50' : 'border-border', !v.isActive && 'bg-secondary/40')}>
                    {/* Header: summary that toggles the editor, and Remove in the top-right corner */}
                    <div className="flex items-center gap-2 pr-3">
                      <button type="button" onClick={() => updateVariant(v.key, { open: !v.open })} aria-expanded={v.open} aria-controls={id('panel')}
                        data-error={hasErrors && !v.open ? 'true' : undefined}
                        className="flex-1 min-w-0 flex items-center gap-3 p-3 text-left rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/20">
                        <span className="size-10 shrink-0 rounded-lg bg-secondary overflow-hidden flex items-center justify-center text-muted-foreground">
                          {thumb ? <img src={thumb.url ?? thumb.preview} alt="" className="h-full w-full object-cover" /> : <ImageOff size={15} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium truncate">{v.name.trim() || `Variant ${i + 1}`}</span>
                          <span className="block text-xs text-muted-foreground truncate">
                            {[v.sku.trim() || 'No SKU', isRupees(v.effectivePrice) ? formatPaise(rupeesToPaise(Number(v.effectivePrice))) : 'No price', `${isWholeNumber(v.stock) ? v.stock : '?'} in stock`, `${v.images.length} ${v.images.length === 1 ? 'photo' : 'photos'}`, v.tagIds.length ? `${v.tagIds.length} ${v.tagIds.length === 1 ? 'tag' : 'tags'}` : ''].filter(Boolean).join(' · ')}
                          </span>
                        </span>
                        {hasErrors && <AlertCircle size={16} className="text-destructive shrink-0" aria-label="Has errors" />}
                        {!v.isActive && <Badge variant="secondary">Inactive</Badge>}
                        <ChevronDown size={16} className={cn('text-muted-foreground shrink-0 transition-transform', v.open && 'rotate-180')} />
                      </button>
                      <button type="button" onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))} disabled={variants.length === 1}
                        aria-label={`Remove ${v.name.trim() || `variant ${i + 1}`}`}
                        title={variants.length === 1 ? 'A product needs at least one variant' : undefined}
                        className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 sm:px-3.5 rounded-full border-2 border-destructive/60 text-destructive text-sm font-semibold transition-colors hover:bg-destructive hover:text-white hover:border-destructive disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-destructive disabled:hover:border-destructive/60">
                        <Trash2 size={15} strokeWidth={2.25} /><span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>

                    {v.open && (
                      <div id={id('panel')} className="px-4 pb-4 pt-1 border-t border-border">
                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                          <TextField id={id('name')} label="Variant name" value={v.name} onChange={(e) => updateVariant(v.key, { name: e.target.value })} error={ve.name} placeholder="Small · 4 oz" />
                          <TextField id={id('sku')} label="SKU" value={v.sku} onChange={(e) => updateVariant(v.key, { sku: e.target.value, skuEdited: true })} error={ve.sku} placeholder="EB-WS-S" className="font-mono uppercase" />
                        </div>
                        <div className="mt-4">
                          <TextField id={id('slug')} label="Slug" value={v.slug} onChange={(e) => updateVariant(v.key, { slug: e.target.value, slugEdited: true })} error={ve.slug}
                            hint="Used in the product's web address." placeholder="winter-spice-small" className="font-mono" />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                          <TextField id={id('original')} label="Original price (₹)" inputMode="decimal" value={v.originalPrice} onChange={(e) => updateVariant(v.key, { originalPrice: e.target.value })} error={ve.originalPrice} placeholder="999" />
                          <TextField id={id('effective')} label="Selling price (₹)" inputMode="decimal" value={v.effectivePrice} onChange={(e) => updateVariant(v.key, { effectivePrice: e.target.value })} error={ve.effectivePrice} placeholder="899" />
                          <TextField id={id('stock')} label="Stock" inputMode="numeric" value={v.stock} onChange={(e) => updateVariant(v.key, { stock: e.target.value })} error={ve.stock} placeholder="0" />
                        </div>
                        <div className="flex flex-col gap-1.5 mt-4">
                          <Label htmlFor={id('description')}>Variant description <span className="text-muted-foreground font-normal">(optional)</span></Label>
                          <Textarea id={id('description')} value={v.description} onChange={(e) => updateVariant(v.key, { description: e.target.value })}
                            className="min-h-20" placeholder="Leave empty to use the product description." />
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Photos <span className="text-muted-foreground font-normal">(the first is this variant's cover)</span></p>
                          <ImageUploader compact images={v.images} setImages={setVariantImages(v.key)} upload={uploadMockImage /* MOCK: upload to endpoints.admin.uploads.image */} />
                          {ve.images && <p role="alert" className="mt-2 text-sm text-destructive">{ve.images}</p>}
                        </div>
                        <div className="mt-4">
                          <TagPicker compact id={id('tags')} label="Tags" hint="used for shop filters and search, e.g. Woody, Best seller"
                            tags={tagList.tags} onCreate={tagList.create} selected={v.tagIds} onChange={(tagIds) => updateVariant(v.key, { tagIds })} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-border">
                          <ActiveSwitch id={id('active')} checked={v.isActive} onChange={(isActive) => updateVariant(v.key, { isActive })} label="Active" hint="Inactive variants can't be bought." />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
            <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setVariants((vs) => [...vs, emptyVariant()])}>
              <Plus size={15} /> Add variant
            </Button>
          </Section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <p className="text-sm font-medium">Summary</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Variants</dt><dd>{variants.length}{activeCount < variants.length && ` (${activeCount} active)`}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Photos</dt><dd>{photos}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tags</dt><dd>{tagCount}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Selling price</dt><dd className="tabular font-medium">{priceText}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Total stock</dt><dd className="tabular">{stock}</dd></div>
            </dl>
          </div>
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
          <div className="flex gap-3">
            <Button variant="outline" asChild className="flex-1"><Link to={paths.adminProducts()}>Cancel</Link></Button>
            <Button type="submit" loading={saving} className="flex-1">{editing ? 'Save changes' : 'Save product'}</Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
