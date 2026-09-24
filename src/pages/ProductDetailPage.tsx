import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Check, Truck, RotateCcw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { products } from '../data/products';
import type { ProductSize } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/shared/Modal';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { ProductCard } from '../components/product/ProductCard';

export function ProductDetailPage() {
  const { state, navigate, addToCart } = useApp();
  const product = products.find((p) => p.id === state.currentProductId) ?? products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(product.sizes.find((s) => s.inStock) ?? null);
  const [quantity, setQuantity] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const price = selectedSize?.price ?? product.price;
  const isAvailable = selectedSize?.inStock ?? false;

  const related = [...products.filter((p) => p.id !== product.id && p.collection === product.collection), ...products.filter((p) => p.id !== product.id && p.collection !== product.collection)].slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedSize.inStock) return;
    addToCart({ productId: product.id, product, size: selectedSize, quantity });
    setConfirmOpen(true);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const accordionItems = [
    {
      id: 'scent',
      trigger: 'Scent Notes',
      content: (
        <div className="space-y-2">
          <div><span className="font-medium text-foreground">Top: </span>{product.scentNotes.top.join(', ')}</div>
          <div><span className="font-medium text-foreground">Middle: </span>{product.scentNotes.middle.join(', ')}</div>
          <div><span className="font-medium text-foreground">Base: </span>{product.scentNotes.base.join(', ')}</div>
        </div>
      ),
    },
    {
      id: 'details',
      trigger: 'Product Details',
      content: (
        <div className="space-y-2">
          <div><span className="font-medium text-foreground">Wax type: </span>{product.waxType}</div>
          <div><span className="font-medium text-foreground">Burn time: </span>{product.burnTime}</div>
          <div><span className="font-medium text-foreground">Dimensions: </span>{product.dimensions}</div>
        </div>
      ),
    },
    {
      id: 'care',
      trigger: 'Candle Care',
      content: (
        <ul className="space-y-1.5 list-disc list-inside">
          <li>Trim wick to ¼" before each burn for a clean, even flame.</li>
          <li>Allow wax to pool to the edges on the first burn to prevent tunnelling.</li>
          <li>Never burn for more than 4 hours at a time.</li>
          <li>Keep away from drafts, children, and pets.</li>
          <li>Stop use when ½" of wax remains.</li>
        </ul>
      ),
    },
    {
      id: 'shipping',
      trigger: 'Shipping & Returns',
      content: (
        <div className="space-y-2">
          <p>Free standard shipping on orders over $75. Expedited and overnight options available at checkout.</p>
          <p>Unused candles in original packaging may be returned within 30 days. Personalized or gift-wrapped items are final sale.</p>
        </div>
      ),
    },
  ];

  const notes: [string, string[]][] = [['Top', product.scentNotes.top], ['Heart', product.scentNotes.middle], ['Base', product.scentNotes.base]];

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
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3">
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
          <div className="relative flex-1 aspect-[4/5] rounded-3xl overflow-hidden bg-muted">
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
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <p className="text-sm text-muted-foreground">{product.collection} collection</p>
          <h1 className="display-lg text-5xl sm:text-6xl mt-2">{product.name}</h1>
          <p className="text-muted-foreground mt-3">{product.scent}</p>

          <div className="flex items-baseline gap-3 mt-6">
            <p className="font-serif text-4xl tabular">${price}</p>
            {selectedSize && <p className="text-sm text-muted-foreground">{selectedSize.weight}</p>}
          </div>

          <p className="text-[15px] text-muted-foreground leading-relaxed mt-6">{product.description}</p>

          <div className="mt-8">
            <p className="text-sm font-medium mb-3">Size</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Size">
              {product.sizes.map((size) => {
                const on = selectedSize?.label === size.label;
                return (
                  <button
                    key={size.label}
                    role="radio"
                    aria-checked={on}
                    onClick={() => size.inStock && setSelectedSize(size)}
                    disabled={!size.inStock}
                    className={`rounded-2xl border px-3 py-3 text-left transition ${on ? 'border-foreground bg-card ring-1 ring-foreground' : size.inStock ? 'border-border hover:border-foreground/40 bg-card/60' : 'border-dashed border-border opacity-50 cursor-not-allowed'}`}
                  >
                    <span className="block text-sm font-medium">{size.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{size.inStock ? `${size.weight}, $${size.price}` : 'Sold out'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <div className="flex items-center h-13 rounded-full border border-border bg-card" role="group" aria-label="Quantity">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-12 h-full flex items-center justify-center rounded-l-full hover:bg-foreground/5 disabled:opacity-30" disabled={quantity <= 1} aria-label="Decrease quantity"><Minus size={15} /></button>
              <span className="w-6 text-center text-sm font-medium tabular" aria-live="polite">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)} className="w-12 h-full flex items-center justify-center rounded-r-full hover:bg-foreground/5" aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
            <Button size="lg" onClick={handleAddToCart} disabled={!isAvailable || !selectedSize} className="flex-1">
              {addedToCart ? <><Check size={17} /> Added</> : !selectedSize ? 'Select a size' : !isAvailable ? 'Out of stock' : <>Add to cart, ${(price * quantity).toFixed(0)}</>}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-2 rounded-2xl bg-secondary/70 px-4 py-3"><Truck size={16} className="text-foreground" />Free shipping over $75</div>
            <div className="flex items-center gap-2 rounded-2xl bg-secondary/70 px-4 py-3"><RotateCcw size={16} className="text-foreground" />30-day returns</div>
          </div>

          <div className="mt-8 rounded-3xl bg-card p-6">
            <p className="text-sm font-medium">Scent notes</p>
            <dl className="mt-4 space-y-3">
              {notes.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[64px_1fr] gap-3 items-baseline">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="flex flex-wrap gap-1.5">{v.map((n) => <span key={n} className="px-2.5 py-1 rounded-full bg-secondary text-[13px]">{n}</span>)}</dd>
                </div>
              ))}
            </dl>
            <dl className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-border text-sm">
              {[['Wax', product.waxType], ['Burn time', product.burnTime], ['Size', product.dimensions]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="mt-1 leading-snug">{v}</dd></div>
              ))}
            </dl>
          </div>

          <Accordion type="single" collapsible className="mt-6 border-t border-border">
            {accordionItems.filter((a) => a.id === 'care' || a.id === 'shipping').map((a) => (
              <AccordionItem key={a.id} value={a.id}>
                <AccordionTrigger>{a.trigger}</AccordionTrigger>
                <AccordionContent>{a.content}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <section className="mt-24 lg:mt-32">
        <div className="flex items-end justify-between mb-8">
          <h2 className="display-lg text-4xl sm:text-5xl">Pairs <em>well</em> with</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('listing', { collection: 'All' })}>Shop all</Button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Sticky mobile purchase bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden glass-light border-t border-border p-3 flex items-center gap-3 z-30" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <img src={product.image} alt="" className="w-11 h-12 rounded-lg object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">{selectedSize ? `${selectedSize.label}, $${price}` : 'Choose a size'}</p>
        </div>
        <Button onClick={handleAddToCart} disabled={!isAvailable || !selectedSize}>
          {isAvailable && selectedSize ? 'Add to cart' : 'Select size'}
        </Button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Added to your cart">
        <div className="flex items-center gap-4">
          <img src={product.image} alt="" className="w-20 h-24 rounded-2xl object-cover" />
          <div>
            <p className="font-serif text-xl leading-tight">{product.name}</p>
            <p className="text-sm text-muted-foreground mt-1">{selectedSize?.label} ({selectedSize?.weight}), qty {quantity}</p>
            <p className="text-sm font-medium mt-1 tabular">${(price * quantity).toFixed(2)}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-7">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>Keep shopping</Button>
          <Button onClick={() => { navigate('cart'); setConfirmOpen(false); }}>View cart</Button>
        </div>
      </Modal>
    </div>
  );
}
