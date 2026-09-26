import type { AdminTag } from '@/types';
import { tags as shopTags } from '@/data/tags';
import { ApiError } from '@/api/client';

// MOCK: the tag list until endpoints.admin.tags is connected. Starts from the shop's tags.
export const mockAdminTags: AdminTag[] = [
  ...shopTags.map((t, i) => ({ id: i + 1, name: t.name, slug: t.id })),
  // Admin-only tags that suit single variants.
  { id: shopTags.length + 1, name: 'Best seller', slug: 'best-seller' },
  { id: shopTags.length + 2, name: 'Limited edition', slug: 'limited-edition' },
];

const toSlug = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const findTag = (slug: string) => mockAdminTags.find((t) => t.slug === slug);

/** MOCK: stands in for POST endpoints.admin.tags.create; rejects a taken name with a 422 like the API. */
export async function createMockTag(name: string): Promise<AdminTag> {
  await new Promise((r) => setTimeout(r, 300));
  const slug = toSlug(name);
  if (mockAdminTags.some((t) => t.slug === slug)) throw new ApiError(422, `There's already a tag called ${name.trim()}.`);
  const tag: AdminTag = { id: Math.max(0, ...mockAdminTags.map((t) => t.id)) + 1, name: name.trim(), slug };
  mockAdminTags.push(tag);
  return tag;
}
