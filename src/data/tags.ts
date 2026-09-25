import type { Product, Tag } from '@/types';

/** Product tags offered as a filter; products reference these by id. */
export const tags: Tag[] = [
  { id: 'woody', name: 'Woody' },
  { id: 'floral', name: 'Floral' },
  { id: 'fresh', name: 'Fresh' },
  { id: 'sweet', name: 'Sweet' },
  { id: 'smoky', name: 'Smoky' },
  { id: 'coastal', name: 'Coastal' },
  { id: 'earthy', name: 'Earthy' },
  { id: 'warm', name: 'Warm' },
  { id: 'calming', name: 'Calming' },
];

const byId = new Map(tags.map((t) => [t.id, t]));

export const getTag = (id: string) => byId.get(id);
export const productHasTag = (p: Product, id: string) => p.tags.includes(id);

/** Tag names for text search. */
export const tagSearchText = (p: Product) => p.tags.map((id) => byId.get(id)?.name ?? id).join(' ');

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
