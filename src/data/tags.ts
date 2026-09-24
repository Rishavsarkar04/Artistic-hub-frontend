import type { Product, Tag } from '../types';

/**
 * Tags form a tree via `parentId`. Products are tagged with any node (usually the
 * most specific note); a product matches a tag if it carries that tag or any tag
 * beneath it.
 */
export const tags: Tag[] = [
  { id: 'woody', name: 'Woody', parentId: null },
  { id: 'cedar', name: 'Cedar', parentId: 'woody' },
  { id: 'sandalwood', name: 'Sandalwood', parentId: 'woody' },
  { id: 'oud', name: 'Oud', parentId: 'woody' },
  { id: 'smoky', name: 'Smoky', parentId: 'woody' },
  { id: 'smoke', name: 'Smoke', parentId: 'smoky' },
  { id: 'leather', name: 'Leather', parentId: 'smoky' },

  { id: 'floral', name: 'Floral', parentId: null },
  { id: 'rose', name: 'Rose', parentId: 'floral' },
  { id: 'lavender', name: 'Lavender', parentId: 'floral' },
  { id: 'jasmine', name: 'Jasmine', parentId: 'floral' },

  { id: 'fresh', name: 'Fresh', parentId: null },
  { id: 'coastal', name: 'Coastal', parentId: 'fresh' },
  { id: 'sea-salt', name: 'Sea salt', parentId: 'coastal' },
  { id: 'driftwood', name: 'Driftwood', parentId: 'coastal' },
  { id: 'green', name: 'Green', parentId: 'fresh' },
  { id: 'fern', name: 'Fern', parentId: 'green' },
  { id: 'moss', name: 'Moss', parentId: 'green' },
  { id: 'petrichor', name: 'Petrichor', parentId: 'green' },
  { id: 'linen', name: 'Clean linen', parentId: 'fresh' },

  { id: 'sweet', name: 'Sweet', parentId: null },
  { id: 'amber', name: 'Amber', parentId: 'sweet' },
  { id: 'vanilla', name: 'Vanilla', parentId: 'sweet' },
  { id: 'honey', name: 'Honey', parentId: 'sweet' },
  { id: 'saffron', name: 'Saffron', parentId: 'sweet' },
];

const byId = new Map(tags.map((t) => [t.id, t]));

export const getTag = (id: string) => byId.get(id);
export const topLevelTags = tags.filter((t) => t.parentId === null);
export const childrenOf = (id: string) => tags.filter((t) => t.parentId === id);

/** The tag and everything beneath it. */
export function descendantIds(id: string): string[] {
  return [id, ...childrenOf(id).flatMap((c) => descendantIds(c.id))];
}

/** Root-first chain from the top-level tag down to this one. */
export function tagPath(id: string): Tag[] {
  const path: Tag[] = [];
  for (let t = byId.get(id); t; t = t.parentId ? byId.get(t.parentId) : undefined) path.unshift(t);
  return path;
}

export const productHasTag = (p: Product, id: string) => {
  const ids = descendantIds(id);
  return p.tags.some((t) => ids.includes(t));
};

/** Names of a product's tags plus their ancestors, for text search. */
export const tagSearchText = (p: Product) => [...new Set(p.tags.flatMap((id) => tagPath(id).map((t) => t.name)))].join(' ');

/** Candle colours offered as a filter; products reference these by id. */
export const colors = [
  { id: 'white', name: 'White', hex: '#F7F4EF' },
  { id: 'ivory', name: 'Ivory', hex: '#EDE3CF' },
  { id: 'amber', name: 'Amber', hex: '#B8742A' },
  { id: 'blush', name: 'Blush', hex: '#E4B9B0' },
  { id: 'lilac', name: 'Lilac', hex: '#B9A7CF' },
  { id: 'sage', name: 'Sage', hex: '#A3B19A' },
  { id: 'black', name: 'Black', hex: '#1F1B17' },
];
