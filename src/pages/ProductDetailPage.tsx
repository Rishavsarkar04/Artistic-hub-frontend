import React, { useState } from 'react';
import { formatPrice } from '@/lib/money';
import { ChevronLeft, ChevronRight, Minus, Plus, Check, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { products } from '../data/products';
import type { Product, ProductSize } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard, allSoldOut } from '../components/product/ProductCard';
import { getTag } from '../data/tags';

export function ProductDetailPage() {
  const { state, navigate, addToCart } = useApp();
  const product = products.find((p) => p.id === state.currentProductId) ?? products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  // No size picker: the product is sold in its first available size.
  const selectedSize: ProductSize | null = product.sizes.find((s) => s.inStock) ?? null; // same size as defaultSize() when in stock
  const [quantity, setQuantity] = useState(1);
  // After adding, the button becomes "View cart" until the quantity changes.
  const [addedToCart, setAddedToCart] = useState(false);
  const changeQuantity = (fn: (q: number) => number) => { setQuantity(fn); setAddedToCart(false); };

  const price = selectedSize?.price ?? product.price;
  const originalPrice = selectedSize?.originalPrice;
  const discount = originalPrice && originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const isAvailable = selectedSize?.inStock ?? false;
  const soldOut = allSoldOut(product);

  const variants = product.variantIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => !!p);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSize.inStock) return;
    addToCart({ productId: product.id, product, size: selectedSize, quantity });
    setAddedToCart(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-0">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <button onClick={() => navigate('home')} className="hover:text-foreground">Home</button>
        <span>/</span>
        <button onClick={() => navigate('listing', { collection: product.collection })} className="hover:text-foreground">{product.collection}</button>
        <span>/</span>
        <span className="text-foreground" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-12 gap-8 xl:gap-14">
        {/* Gallery */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-3 self-start">
          {product.images.length > 1 && (
            <div className="no-scrollbar flex sm:flex-col gap-3 overflow-x-auto sm:w-20 shrink-0" role="tablist" aria-label="Product images">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === selectedImage}
                  aria-label={`Image ${i + 1} of ${product.images.length}`}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 shrink-0 aspect-[4/5] rounded-xl overflow-hidden ring-offset-2 ring-offset-background transition ${i === selectedImage ? 'ring-2 ring-foreground' : 'opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="relative flex-1 aspect-square max-h-[560px] rounded-3xl overflow-hidden bg-muted">
            <img key={selectedImage} src={product.images[selectedImage]} alt={product.name} className="absolute inset-0 w-full h-full object-cover fade-in" />
            <div className="absolute top-4 left-4 flex gap-1.5">
              {product.isBestseller && <Badge>Bestseller</Badge>}
              {product.isNew && <Badge variant="glow">New</Badge>}
            </div>
            {product.images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button onClick={() => setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length)} className="w-11 h-11 glass-light rounded-full flex items-center justify-center hover:bg-white" aria-label="Previous image"><ChevronLeft size={18} /></button>
                <button onClick={() => setSelectedImage((i) => (i + 1) % product.images.length)} className="w-11 h-11 glass-light rounded-full flex items-center justify-center hover:bg-white" aria-label="Next image"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
        </div>

        {/* Buy box */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 self-start">
          <h1 className="display-lg text-5xl sm:text-6xl">{product.name}</h1>
          <p className="text-lg text-muted-foreground mt-3">{product.shortNote}</p>

          {product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 mt-4" aria-label="Tags">
              {product.tags.map((id) => (
                <li key={id} className="h-7 px-3 rounded-full bg-secondary text-xs text-foreground/80 flex items-center">{getTag(id)?.name ?? id}</li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 mt-6">
            <p className="font-serif text-4xl tabular">
              <span className="sr-only">{discount ? 'Sale price ' : 'Price '}</span>{formatPrice(price)}
            </p>
            {discount > 0 && (
              <>
                <p className="text-lg text-muted-foreground line-through tabular"><span className="sr-only">Original price </span>{formatPrice(originalPrice!)}</p>
                <p className="self-center h-6 px-2.5 rounded-full bg-[#F2C27B]/35 text-[#6B4410] text-xs font-semibold flex items-center">Save {discount}%</p>
              </>
            )}
            <p className={`ml-auto self-center inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium ${soldOut ? 'bg-destructive/10 text-destructive' : 'bg-[#3F7A4E]/10 text-[#3F7A4E]'}`}>
              <span className={`size-1.5 rounded-full ${soldOut ? 'bg-destructive' : 'bg-[#3F7A4E]'}`} aria-hidden />
              {soldOut ? 'Out of stock' : 'In stock'}
            </p>
          </div>

          <p className="text-[15px] text-muted-foreground leading-relaxed mt-6">{product.description}</p>

          <div className="flex gap-3 mt-6">
            <div className="flex items-center h-13 rounded-full border border-border bg-card" role="group" aria-label="Quantity">
              <button onClick={() => changeQuantity((q) => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center rounded-l-full hover:bg-foreground/5 disabled:opacity-30" disabled={quantity <= 1} aria-label="Decrease quantity"><Minus size={15} /></button>
              <span className="w-6 text-center text-sm font-medium tabular" aria-live="polite">{quantity}</span>
              <button onClick={() => changeQuantity((q) => q + 1)} className="w-12 h-full flex items-center justify-center rounded-r-full hover:bg-foreground/5" aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
            {addedToCart ? (
              <Button size="lg" variant="outline" onClick={() => navigate('cart')} className="flex-1">
                <Check size={17} /> Added · View cart <ArrowRight size={17} />
              </Button>
            ) : (
              <Button size="lg" onClick={handleAddToCart} disabled={!isAvailable || !selectedSize} className="flex-1">
                {!selectedSize || !isAvailable ? 'Out of stock' : <>Add to cart, {formatPrice(price * quantity)}</>}
              </Button>
            )}
          </div>
        </div>
      </div>

      {variants.length > 0 && (
        <section className="mt-24 lg:mt-32">
          <h2 className="display-lg text-4xl sm:text-5xl mb-8">Variants</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
            {variants.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Sticky mobile purchase bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden glass-light border-t border-border p-3 flex items-center gap-3 z-30" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <img src={product.image} alt="" className="w-11 h-12 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">{selectedSize ? formatPrice(price) : 'Out of stock'}</p>
        </div>
        {addedToCart ? (
          <Button variant="outline" onClick={() => navigate('cart')}>View cart <ArrowRight size={16} /></Button>
        ) : (
          <Button onClick={handleAddToCart} disabled={!isAvailable || !selectedSize}>
            {isAvailable && selectedSize ? 'Add to cart' : 'Out of stock'}
          </Button>
        )}
      </div>
    </div>
  );
}
