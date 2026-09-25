export interface Tag {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  collection: string;
  scent: string;
  scentNotes: { top: string[]; middle: string[]; base: string[] };
  waxType: string;
  burnTime: string;
  dimensions: string;
  description: string;
  sizes: ProductSize[];
  /** One-line description shown under the name on product cards. */
  shortNote: string;
  /** Ids from `tags` in `src/data/tags.ts`. */
  tags: string[];
  /** Id from `colors` in `src/data/tags.ts`. */
  color: string;
  /** Ids of products listed under "Variants" on the product page. */
  variantIds: string[];
  isBestseller?: boolean;
  isNew?: boolean;
  inStock: boolean;
}

export interface ProductSize {
  label: string;
  weight: string;
  price: number;
  /** Price before discount; when higher than `price`, it's shown struck through. */
  originalPrice?: number;
  inStock: boolean;
}
