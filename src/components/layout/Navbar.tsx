import React, { useEffect, useRef, useState } from 'react';
import { ShoppingBag, User, Search, Menu, X, ArrowRight, ArrowUpRight, ChevronDown, Package, MapPin, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { products, collections } from '../../data/products';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

const SHOP_COLLECTIONS = [
  { label: 'All candles', collection: 'All' },
  { label: 'Signature', collection: 'Signature' },
  { label: 'Botanical', collection: 'Botanical' },
  { label: 'Coastal', collection: 'Coastal' },
  { label: 'Gift sets', collection: 'Gift Sets' },
];
const SHOP_SCENTS = ['Woody', 'Floral', 'Fresh', 'Sweet'];
const popular = ['Sandalwood', 'Lavender', 'Rose', 'Sea salt'];
const countIn = (c: string) => (c === 'All' ? products.length : products.filter((p) => p.collection === c).length);

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.5c-3.2 4.3-5.2 7.6-5.2 10.6a5.2 5.2 0 0 0 10.4 0c0-3-2-6.3-5.2-10.6Z" fill={light ? '#F2C27B' : '#1B1814'} />
        <path d="M12 10.2c-1.3 1.9-2.1 3.3-2.1 4.6a2.1 2.1 0 0 0 4.2 0c0-1.3-.8-2.7-2.1-4.6Z" fill={light ? '#1B1814' : '#F2C27B'} />
      </svg>
      <span className="font-serif text-[22px] leading-none tracking-[-0.02em]">Ember &amp; Bloom</span>
    </span>
  );
}

export function Navbar() {
  const { state, navigate, cartCount, dispatch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const hoverTimer = useRef<number | undefined>(undefined);
  const openedAt = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!searchOpen && !megaOpen) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMegaOpen(false); closeSearch(); } };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [searchOpen, megaOpen]);

  const q = searchQuery.trim().toLowerCase();
  const searchResults = q.length > 1 ? products.filter((p) => [p.name, p.scent, ...p.tags].join(' ').toLowerCase().includes(q)) : [];
  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };
  const go = (fn: () => void) => { fn(); setMegaOpen(false); setMobileOpen(false); closeSearch(); };

  const openMega = () => { window.clearTimeout(hoverTimer.current); setSearchOpen(false); if (!megaOpen) openedAt.current = Date.now(); setMegaOpen(true); };
  // Hover opens the menu; a click right after hovering keeps it open instead of toggling it shut.
  const toggleMega = () => (megaOpen && Date.now() - openedAt.current > 400 ? setMegaOpen(false) : openMega());
  const closeMegaSoon = () => { window.clearTimeout(hoverTimer.current); hoverTimer.current = window.setTimeout(() => setMegaOpen(false), 120); };

  const onShop = state.currentPage === 'listing' || state.currentPage === 'detail';
  const primaryLinks: { label: string; page: 'story' | 'contact' | 'listing'; active: boolean; opts?: { collection: string } }[] = [
    { label: 'Gift sets', page: 'listing', opts: { collection: 'Gift Sets' }, active: state.currentPage === 'listing' && state.listingCollection === 'Gift Sets' },
    { label: 'Our story', page: 'story', active: state.currentPage === 'story' },
    { label: 'Contact', page: 'contact', active: state.currentPage === 'contact' },
  ];
  const newest = products.find((p) => p.isNew)!;

  return (
    <>
      <div className="bg-ink text-[#E9E2D6] text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-center gap-6">
          <p>Free shipping over $75</p>
          <span className="hidden sm:block w-1 h-1 rounded-full bg-[#E9E2D6]/40" aria-hidden />
          <button className="hidden sm:block hover:text-white underline-offset-4 hover:underline" onClick={() => navigate('story')}>Hand-poured in Portland in batches of fifty</button>
        </div>
      </div>

      <header
        className={cn('sticky top-0 z-40 transition-all duration-300', scrolled || searchOpen || megaOpen ? 'glass-light border-b border-border/70' : 'bg-background border-b border-transparent')}
        onMouseLeave={closeMegaSoon}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 lg:h-[72px]">
            <div className="flex items-center">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-2 size-10 flex items-center justify-center rounded-full hover:bg-foreground/5" aria-label="Open menu">
                <Menu size={20} />
              </button>
              <nav className="hidden lg:flex items-center gap-1 -ml-3" aria-label="Main">
                <button
                  onMouseEnter={openMega}
                  onClick={toggleMega}
                  aria-expanded={megaOpen}
                  aria-controls="shop-menu"
                  className={cn('px-3 h-9 rounded-full text-sm flex items-center gap-1', megaOpen || onShop ? 'text-foreground bg-foreground/[.06]' : 'text-muted-foreground hover:text-foreground')}
                >
                  Shop <ChevronDown size={15} className={cn('transition-transform', megaOpen && 'rotate-180')} />
                </button>
                {primaryLinks.map((l) => (
                  <button key={l.label} onMouseEnter={closeMegaSoon} onClick={() => go(() => navigate(l.page, l.opts))} aria-current={l.active ? 'page' : undefined}
                    className={cn('px-3 h-9 rounded-full text-sm', l.active ? 'text-foreground bg-foreground/[.06]' : 'text-muted-foreground hover:text-foreground')}>
                    {l.label}
                  </button>
                ))}
              </nav>
            </div>

            <button onClick={() => go(() => navigate('home'))} aria-label="Ember & Bloom home" className="justify-self-center">
              <Logo />
            </button>

            <div className="flex items-center justify-end gap-1 -mr-2">
              <button onClick={() => (searchOpen ? closeSearch() : (setMegaOpen(false), setSearchOpen(true)))} className="size-10 flex items-center justify-center rounded-full hover:bg-foreground/5" aria-label="Search" aria-expanded={searchOpen}>
                {searchOpen ? <X size={19} /> : <Search size={19} />}
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex size-10 items-center justify-center rounded-full hover:bg-foreground/5 outline-none focus-visible:ring-4 focus-visible:ring-ring/25" aria-label={state.user ? 'Account menu' : 'Account'}>
                    {state.user
                      ? <span className="size-7 rounded-full bg-ink text-[#F7F4EF] text-[11px] font-semibold flex items-center justify-center">{state.user.fullName.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>
                      : <User size={19} />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {state.user ? (
                    <>
                      <DropdownMenuLabel><p className="text-sm font-medium">{state.user.fullName}</p><p className="text-xs text-muted-foreground font-normal">{state.user.email}</p></DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate('account', { accountSection: 'profile' })}><User />Profile</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate('account', { accountSection: 'orders' })}><Package />Orders</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate('account', { accountSection: 'addresses' })}><MapPin />Addresses</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => dispatch({ type: 'LOGOUT' })}><LogOut />Sign out</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onSelect={() => { dispatch({ type: 'SET_AUTH_MODE', mode: 'login' }); navigate('auth'); }}><LogIn />Sign in</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { dispatch({ type: 'SET_AUTH_MODE', mode: 'register' }); navigate('auth'); }}><UserPlus />Create an account</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate('contact')}><Package />Help with an order</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <button onClick={() => go(() => navigate('cart'))} className="ml-1 h-10 pl-3.5 pr-4 rounded-full bg-ink text-[#F7F4EF] text-sm font-medium flex items-center gap-2 hover:bg-ink-soft"
                aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
                <ShoppingBag size={16} /><span className="tabular">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Shop mega menu */}
        {megaOpen && (
          <div id="shop-menu" className="absolute inset-x-0 top-full bg-background border-b border-border/70 shadow-[0_30px_60px_-30px_rgba(22,19,15,.35)] fade-in" onMouseEnter={openMega}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-12 gap-8">
              <div className="col-span-3">
                <p className="text-xs text-muted-foreground mb-4">Collections</p>
                <ul className="space-y-1">
                  {SHOP_COLLECTIONS.map((c) => (
                    <li key={c.label}>
                      <button onClick={() => go(() => navigate('listing', { collection: c.collection }))} className="group w-full flex items-baseline justify-between py-1.5 text-left">
                        <span className="font-serif text-2xl group-hover:underline underline-offset-4 decoration-1">{c.label}</span>
                        <span className="text-xs text-muted-foreground tabular">{countIn(c.collection)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-3">
                <p className="text-xs text-muted-foreground mb-4">Shop by scent</p>
                <ul className="space-y-1">
                  {SHOP_SCENTS.map((s) => (
                    <li key={s}><button onClick={() => go(() => navigate('listing', { collection: 'All', scent: s }))} className="py-1.5 text-[15px] hover:underline underline-offset-4">{s}</button></li>
                  ))}
                  <li className="pt-3"><button onClick={() => go(() => navigate('contact'))} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">Need help choosing? Ask us <ArrowRight size={14} /></button></li>
                </ul>
              </div>
              {[
                { title: `New: ${newest.name}`, sub: `From $${Math.min(...newest.sizes.map((s) => s.price))}`, img: newest.image, act: () => navigate('detail', { productId: newest.id }) },
                { title: 'Gift sets', sub: 'Boxed, wrapped and ready to give', img: collections[2].image, act: () => navigate('listing', { collection: 'Gift Sets' }) },
              ].map((c) => (
                <button key={c.title} onClick={() => go(c.act)} className="col-span-3 group relative aspect-[4/3] overflow-hidden rounded-2xl text-left">
                  <img src={c.img} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-[#F7F4EF] flex items-end justify-between gap-3">
                    <div><p className="font-serif text-xl leading-tight">{c.title}</p><p className="text-xs text-white/75 mt-1">{c.sub}</p></div>
                    <ArrowUpRight size={18} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        {searchOpen && (
          <div className="border-t border-border/70 fade-in">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
              <div className="relative">
                <Search size={20} className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input autoFocus type="search" placeholder="Search scents, notes or candles" aria-label="Search products" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && searchResults[0]) go(() => navigate('detail', { productId: searchResults[0].id })); }}
                  className="w-full h-14 pl-9 pr-2 bg-transparent font-serif text-2xl placeholder:text-muted-foreground/60 border-b border-foreground/20 focus:border-foreground focus:outline-none" />
              </div>
              {q.length < 2 && (
                <div className="flex flex-wrap items-center gap-2 mt-5 text-sm">
                  <span className="text-muted-foreground mr-1">Popular</span>
                  {popular.map((p) => <button key={p} onClick={() => setSearchQuery(p)} className="px-3 h-8 rounded-full border border-border hover:border-foreground/40">{p}</button>)}
                </div>
              )}
              {searchResults.length > 0 && (
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {searchResults.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <button onClick={() => go(() => navigate('detail', { productId: p.id }))} className="group text-left w-full">
                        <img src={p.image} alt="" className="w-full aspect-[4/5] object-cover rounded-xl bg-muted" />
                        <p className="font-serif text-lg mt-2 leading-tight group-hover:underline underline-offset-4">{p.name}</p>
                        <p className="text-xs text-muted-foreground">From ${Math.min(...p.sizes.map((s) => s.price))}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {q.length > 1 && searchResults.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No candles match “{searchQuery}”. Try a note like amber, rose or cedar.</p>}
            </div>
          </div>
        )}
      </header>

      {/* Mobile navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left">
          <SheetHeader><SheetTitle><Logo /></SheetTitle><SheetDescription className="sr-only">Site navigation</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2">
            <Accordion type="single" collapsible defaultValue="shop">
              <AccordionItem value="shop">
                <AccordionTrigger className="font-serif text-3xl font-normal py-4">Shop</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 pl-1">
                    {SHOP_COLLECTIONS.map((c) => (
                      <li key={c.label}>
                        <button onClick={() => go(() => navigate('listing', { collection: c.collection }))} className="w-full flex justify-between py-2 text-[15px] text-foreground">
                          {c.label}<span className="text-muted-foreground tabular">{countIn(c.collection)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {SHOP_SCENTS.map((s) => <button key={s} onClick={() => go(() => navigate('listing', { collection: 'All', scent: s }))} className="h-9 px-3.5 rounded-full border border-border text-[13px] text-foreground">{s}</button>)}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            {[['Our story', () => navigate('story')], ['Contact', () => navigate('contact')], ['Help and FAQ', () => navigate('contact')]].map(([l, fn]) => (
              <button key={l as string} onClick={() => go(fn as () => void)} className="w-full flex items-center justify-between py-4 border-b border-border text-left">
                <span className="font-serif text-3xl">{l as string}</span><ArrowRight size={18} className="text-muted-foreground" />
              </button>
            ))}
            <div className="grid grid-cols-2 gap-3 mt-8 pb-6">
              <button onClick={() => go(() => (state.user ? navigate('account') : navigate('auth')))} className="h-12 rounded-full border border-border flex items-center justify-center gap-2 text-sm font-medium">
                <User size={16} />{state.user ? state.user.fullName.split(' ')[0] : 'Sign in'}
              </button>
              <button onClick={() => go(() => navigate('cart'))} className="h-12 rounded-full bg-ink text-[#F7F4EF] flex items-center justify-center gap-2 text-sm font-medium">
                <ShoppingBag size={16} />Cart ({cartCount})
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
