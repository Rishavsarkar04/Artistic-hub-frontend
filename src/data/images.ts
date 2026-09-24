/**
 * All photography goes through this helper so image sources live in one place.
 * Photos are free Unsplash images (unsplash.com/license); swap the ids for your own shots,
 * or change this function to point at your CDN.
 */
export function photo(id: string, w = 1000, h = Math.round(w * 1.25)) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;
}
