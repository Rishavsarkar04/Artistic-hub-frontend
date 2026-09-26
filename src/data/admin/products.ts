import type { AdminProduct, AdminVariant, AdminVariantImage, NewAdminProduct, NewAdminVariant, Paginated, ProductQuery } from '@/types';
import { products } from '@/data/products';
import { ApiError } from '@/api/client';
import { photo } from '@/data/images';
import { findTag, mockAdminTags } from './tags';

// MOCK: sample catalogue for the admin panel until endpoints.admin.products is connected.
// Shaped like the API's `products` + `product_variants` (+ `product_variant_images`) rows. Built from the
// shop's own products: each size becomes a variant, with the shop's prices converted to paise.

/** Low enough to flag a variant for restocking. */
export const LOW_STOCK = 5;

/** "Winter Spice", "Small · 4 oz" → "winter-spice-small-4-oz". */
export const slugify = (...parts: string[]) =>
  parts.join(' ').toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const initials = (name: string) => name.replace(/&/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').toUpperCase();
// Deterministic stock per variant: sold-out sizes are 0, a few are running low.
const stockFor = (n: number, inStock: boolean) => (!inStock ? 0 : n % 7 === 3 ? 2 + (n % 3) : 8 + ((n * 17) % 45));
const stamp = (date: string) => `${date}T10:00:00Z`;

let variantId = 1;
let imageId = 1;
const variantImages = (variantId: number, alt: string, urls: string[], at: string): AdminVariantImage[] =>
  urls.map((url, i) => ({ id: imageId++, variant_id: variantId, url, alt_text: i === 0 ? alt : `${alt}, photo ${i + 1}`, sort_order: i, created_at: at, updated_at: at }));

const fromShop: AdminProduct[] = products.map((p, pi) => {
  const id = pi + 1;
  const created = stamp(`2025-${String(1 + pi).padStart(2, '0')}-${String(4 + pi * 3).padStart(2, '0')}`);
  return {
    id,
    name: p.name,
    description: p.description,
    is_active: true,
    created_at: created,
    updated_at: created,
    variants: p.sizes.map<AdminVariant>((s, si) => {
      const vid = variantId++;
      return {
        id: vid,
        product_id: id,
        name: `${s.label} · ${s.weight}`,
        slug: slugify(p.name, s.label),
        description: null,
        sku: `EB-${initials(p.name)}-${s.label[0].toUpperCase()}`,
        original_price: (s.originalPrice ?? s.price) * 100,
        effective_price: s.price * 100,
        stock: stockFor(pi * 3 + si, s.inStock),
        is_active: true,
        created_at: created,
        updated_at: created,
        // The first size gets every shop photo; the others just the main one.
        images: variantImages(vid, `${p.name}, ${s.label}`, si === 0 ? p.images : p.images.slice(0, 1), created),
        // Every size carries the shop product's scent tags; a bestseller's smallest size is also "Best seller".
        tags: [...p.tags.map(findTag), ...(p.isBestseller && si === 0 ? [findTag('best-seller')] : [])].filter((t) => !!t),
      };
    }),
  };
});

// An active product with one variant not on sale yet, and a product that's switched off entirely.
const extra: AdminProduct[] = [
  {
    id: 9, name: 'Winter Spice', description: 'Clove, orange peel and cinnamon bark over warm amber.', is_active: true,
    created_at: stamp('2026-09-10'), updated_at: stamp('2026-09-12'),
    variants: [
      { id: variantId++, product_id: 9, name: 'Small · 4 oz', slug: 'winter-spice-small', description: null, sku: 'EB-WS-S', original_price: 99900, effective_price: 89950, stock: 12, is_active: true, created_at: stamp('2026-09-10'), updated_at: stamp('2026-09-10'), images: [], tags: ['warm', 'sweet', 'limited-edition'].map(findTag).filter((t) => !!t) },
      { id: variantId++, product_id: 9, name: 'Medium · 8 oz', slug: 'winter-spice-medium', description: 'Arrives in November.', sku: 'EB-WS-M', original_price: 169900, effective_price: 169900, stock: 0, is_active: false, created_at: stamp('2026-09-10'), updated_at: stamp('2026-09-12'), images: [], tags: ['warm', 'sweet'].map(findTag).filter((t) => !!t) },
    ],
  },
  {
    id: 10, name: 'Summer Citrus', description: 'Bergamot, lime and neroli.', is_active: false,
    created_at: stamp('2024-04-18'), updated_at: stamp('2025-10-01'),
    variants: [
      { id: variantId++, product_id: 10, name: 'Medium · 8 oz', slug: 'summer-citrus-medium', description: null, sku: 'EB-SC-M', original_price: 139900, effective_price: 139900, stock: 3, is_active: true, created_at: stamp('2024-04-18'), updated_at: stamp('2024-04-18'), images: [], tags: ['fresh'].map(findTag).filter((t) => !!t) },
    ],
  },
];
extra[0].variants[0].images = variantImages(extra[0].variants[0].id, 'Winter Spice, Small', [photo('photo-1605101600616-a8c6db5b98aa', 600, 750)], stamp('2026-09-10'));

export const mockAdminProducts: AdminProduct[] = [...fromShop, ...extra];

/** Lowest and highest selling price (paise) across a product's variants. */
export const priceRange = (p: AdminProduct) => {
  const prices = p.variants.map((v) => v.effective_price);
  return [Math.min(...prices), Math.max(...prices)] as const;
};
export const totalStock = (p: AdminProduct) => p.variants.reduce((n, v) => n + v.stock, 0);

const byOrder = <T extends { sort_order: number }>(list: T[]) => [...list].sort((a, b) => a.sort_order - b.sort_order);
/** A variant's cover: its lowest sort_order photo. */
export const variantCover = (v: AdminVariant) => byOrder(v.images)[0];
/** The product's cover: the first variant (active ones first) that has a photo. */
export const coverImage = (p: AdminProduct) =>
  [...p.variants].sort((a, b) => Number(b.is_active) - Number(a.is_active)).map(variantCover).find(Boolean);
export const photoCount = (p: AdminProduct) => p.variants.reduce((n, v) => n + v.images.length, 0);
/** Every tag used by any of the product's variants, once each. */
export const productTags = (p: AdminProduct) => [...new Map(p.variants.flatMap((v) => v.tags).map((t) => [t.id, t])).values()];

/**
 * MOCK: stands in for POST endpoints.admin.uploads.image. "Uploads" a photo and returns its URL; here a
 * local preview URL that lasts for this visit. With the API:
 *   const form = new FormData(); form.append('file', file);
 *   const { url } = await api.post<{ url: string }>(endpoints.admin.uploads.image, form);
 */
export async function uploadMockImage(file: File): Promise<{ url: string }> {
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
  return { url: URL.createObjectURL(file) };
}

/** MOCK: stands in for GET endpoints.admin.products.detail(id). */
export const getMockProduct = (id: number) => mockAdminProducts.find((p) => p.id === id);

/** Rejects a SKU or slug another product already uses, with a 422 like the unique columns will. */
function checkUnique(variants: NewAdminVariant[], exceptProductId?: number) {
  const taken = mockAdminProducts.filter((p) => p.id !== exceptProductId).flatMap((p) => p.variants);
  for (const v of variants) {
    if (taken.some((t) => t.sku === v.sku)) throw new ApiError(422, `The SKU ${v.sku} is already used by another product.`);
    if (taken.some((t) => t.slug === v.slug)) throw new ApiError(422, `The slug ${v.slug} is already used by another product.`);
  }
}

const tagsFor = (ids: number[]) => ids.map((id) => mockAdminTags.find((t) => t.id === id)).filter((t) => !!t);

/** Builds stored variants from the form's, keeping ids of existing variants and images. */
function toVariants(productId: number, input: NewAdminVariant[], previous: AdminVariant[], now: string): AdminVariant[] {
  return input.map(({ images, tag_ids, id, ...v }) => {
    const old = previous.find((p) => p.id === id);
    const vid = old?.id ?? variantId++;
    return {
      ...v,
      id: vid,
      product_id: productId,
      created_at: old?.created_at ?? now,
      updated_at: now,
      tags: tagsFor(tag_ids),
      images: images.map((img) => {
        const kept = old?.images.find((o) => o.url === img.url);
        return { ...img, id: kept?.id ?? imageId++, variant_id: vid, created_at: kept?.created_at ?? now, updated_at: now };
      }),
    };
  });
}

/** MOCK: stands in for POST endpoints.admin.products.create. Adds the product for this visit (lost on refresh). */
export async function createMockProduct(input: NewAdminProduct): Promise<AdminProduct> {
  await new Promise((r) => setTimeout(r, 700));
  checkUnique(input.variants);
  const now = new Date().toISOString();
  const id = Math.max(...mockAdminProducts.map((p) => p.id)) + 1;
  const product: AdminProduct = { ...input, id, created_at: now, updated_at: now, variants: toVariants(id, input.variants, [], now) };
  mockAdminProducts.unshift(product);
  return product;
}

/**
 * MOCK: stands in for PUT endpoints.admin.products.update(id). Variants sent with an id are updated,
 * without one are created, and ones left out are deleted, as the API will.
 */
export async function updateMockProduct(id: number, input: NewAdminProduct): Promise<AdminProduct> {
  await new Promise((r) => setTimeout(r, 700));
  const index = mockAdminProducts.findIndex((p) => p.id === id);
  if (index < 0) throw new ApiError(404, 'This product no longer exists.');
  checkUnique(input.variants, id);
  const old = mockAdminProducts[index];
  const now = new Date().toISOString();
  const product: AdminProduct = { ...old, ...input, updated_at: now, variants: toVariants(id, input.variants, old.variants, now) };
  mockAdminProducts[index] = product;
  return product;
}

/** MOCK: stands in for DELETE endpoints.admin.products.delete(id). Removes it for this visit. */
export async function deleteMockProduct(id: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  const index = mockAdminProducts.findIndex((p) => p.id === id);
  if (index < 0) throw new ApiError(404, 'This product no longer exists.');
  mockAdminProducts.splice(index, 1);
}

/** MOCK: stands in for DELETE endpoints.admin.products.variants.delete(id, variantId); refuses the last variant. */
export async function deleteMockVariant(productId: number, variantId: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 600));
  const product = mockAdminProducts.find((p) => p.id === productId);
  if (!product || !product.variants.some((v) => v.id === variantId)) throw new ApiError(404, 'This variant no longer exists.');
  if (product.variants.length === 1) throw new ApiError(422, 'A product needs at least one variant. Delete the product instead.');
  product.variants = product.variants.filter((v) => v.id !== variantId);
  product.updated_at = new Date().toISOString();
}

/**
 * MOCK: filters, sorts and pages the sample products the way the API will, returning the same
 * `Paginated` shape. Replace with `useApiQuery<Paginated<AdminProduct>>(endpoints.admin.products.list, query)`.
 */
export function queryMockProducts({ q, status, sort, page, pageSize }: ProductQuery): Paginated<AdminProduct> {
  const needle = q.trim().toLowerCase();
  const filtered = mockAdminProducts.filter(
    (p) =>
      (status === 'all' || p.is_active === (status === 'active')) &&
      (!needle || [p.name, ...p.variants.flatMap((v) => [v.sku, v.name, v.slug, ...v.tags.map((t) => t.name)])].join(' ').toLowerCase().includes(needle)),
  );
  const sorters: Record<ProductQuery['sort'], (a: AdminProduct, b: AdminProduct) => number> = {
    newest: (a, b) => b.created_at.localeCompare(a.created_at),
    name: (a, b) => a.name.localeCompare(b.name),
    'price-low': (a, b) => priceRange(a)[0] - priceRange(b)[0],
    'price-high': (a, b) => priceRange(b)[1] - priceRange(a)[1],
    'stock-low': (a, b) => totalStock(a) - totalStock(b),
  };
  const sorted = [...filtered].sort(sorters[sort]);
  return { items: sorted.slice((page - 1) * pageSize, page * pageSize), total: sorted.length, page, pageSize };
}
