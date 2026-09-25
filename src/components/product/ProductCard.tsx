import React from 'react';
import { formatPrice } from '@/lib/money';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '@/types';
import { Link } from 'react-router-dom';
import { paths } from '@/router/paths';
import { Badge } from '@/components/ui/badge';
import { defaultSize, productPrice, allSoldOut } from '@/lib/product';

interface ProductCardProps {
  product: Product;
  /** Slightly larger type for carousels and featured rows */
  size?: 'md' | 'lg';
  className?: string;
}

/**
 * Shared product card: portrait photo that cross-fades to the second shot on hover,
 * status pill, and a "View" chip. Used on home, listing and related products.
 */
export function ProductCard({ product, size = 'md', className = '' }: ProductCardProps) {
  const soldOut = allSoldOut(product);
  const alt = product.images[1] ?? product.images[0];
  const low = product.sizes.some((s) => !s.inStock) && !soldOut;
  const price = productPrice(product);
  const original = defaultSize(product).originalPrice;

  return (
    <article className={`group relative ${className}`}>
      <Link
        to={paths.product(product.id)}
        className="block w-full text-left"
        aria-label={`${product.name}, ${formatPrice(price)}`}
      >
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out-soft group-hover:scale-[1.04]"
          />
          {alt && alt !== product.images[0] && (
            <img
              src={alt}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {soldOut ? <Badge variant="dark">Sold out</Badge>
              : product.isBestseller ? <Badge>Bestseller</Badge>
              : product.isNew ? <Badge variant="glow">New</Badge>
              : null}
          </div>
          <span className="absolute bottom-3 right-3 w-10 h-10 rounded-full glass-light text-ink flex items-center justify-center translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <div className="pt-4 px-0.5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className={`font-serif leading-tight ${size === 'lg' ? 'text-2xl' : 'text-xl'}`}>{product.name}</h3>
            <p className="text-[15px] font-medium tabular shrink-0 flex items-baseline gap-1.5">
              {original && original > price && <span className="text-[13px] font-normal text-muted-foreground line-through"><span className="sr-only">Original price </span>{formatPrice(original)}</span>}
              <span>{original && original > price && <span className="sr-only">Sale price </span>}{formatPrice(price)}</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.scent}</p>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
            <span>{product.sizes.length > 1 ? `${product.sizes.length} sizes` : product.sizes[0].weight}</span>
            <span className="w-1 h-1 rounded-full bg-border" aria-hidden />
            <span className={soldOut ? 'text-destructive' : low ? 'text-[#8A5A12]' : ''}>
              {soldOut ? 'Out of stock' : low ? 'Some sizes sold out' : product.burnTime + ' burn'}
            </span>
          </p>
        </div>
      </Link>
    </article>
  );
}
