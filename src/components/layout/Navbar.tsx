import React, { useEffect, useState } from 'react';
import { ShoppingBag, User, Menu, ArrowRight, Package, MapPin, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn, fullName } from '@/lib/utils';


export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2.5c-3.2 4.3-5.2 7.6-5.2 10.6a5.2 5.2 0 0 0 10.4 0c0-3-2-6.3-5.2-10.6Z" fill={light ? '#F2C27B' : '#1B1814'} />
        <path d="M12 10.2c-1.3 1.9-2.1 3.3-2.1 4.6a2.1 2.1 0 0 0 4.2 0c0-1.3-.8-2.7-2.1-4.6Z" fill={light ? '#1B1814' : '#F2C27B'} />
      </svg>
      <span className="font-serif text-[22px] leading-none tracking-[-0.02em]">Ember <em>&amp;</em> Bloom</span>
    </span>
  );
}

export function Navbar() {
  const { state, navigate, cartCount, dispatch } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  const go = (fn: () => void) => { fn(); setMobileOpen(false); };

  const onShop = state.currentPage === 'listing' || state.currentPage === 'detail';
  const primaryLinks: { label: string; page: 'home' | 'story' | 'contact' | 'listing'; active: boolean; opts?: { collection: string } }[] = [
    { label: 'Home', page: 'home', active: state.currentPage === 'home' },
    { label: 'Shop', page: 'listing', opts: { collection: 'All' }, active: onShop },
    { label: 'Our story', page: 'story', active: state.currentPage === 'story' },
    { label: 'Contact', page: 'contact', active: state.currentPage === 'contact' },
  ];

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
        className={cn('sticky top-0 z-40 transition-all duration-300', scrolled ? 'glass-light border-b border-border/70' : 'bg-background border-b border-transparent')}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 lg:h-[72px]">
            <div className="flex items-center">
              <button onClick={() => setMobileOpen(true)} className="lg:hidden -ml-2 size-10 flex items-center justify-center rounded-full hover:bg-foreground/5" aria-label="Open menu">
                <Menu size={20} />
              </button>
              <nav className="hidden lg:flex items-center gap-1 -ml-3" aria-label="Main">
                {primaryLinks.map((l) => (
                  <button key={l.label} onClick={() => go(() => navigate(l.page, l.opts))} aria-current={l.active ? 'page' : undefined}
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex size-10 items-center justify-center rounded-full hover:bg-foreground/5 outline-none focus-visible:ring-4 focus-visible:ring-ring/25" aria-label={state.user ? 'Account menu' : 'Account'}>
                    {state.user
                      ? <span className="size-7 rounded-full bg-ink text-[#F7F4EF] text-[11px] font-semibold flex items-center justify-center">{(state.user.firstName[0] ?? '') + (state.user.lastName[0] ?? '')}</span>
                      : <User size={19} />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {state.user ? (
                    <>
                      <DropdownMenuLabel><p className="text-sm font-medium">{fullName(state.user)}</p><p className="text-xs text-muted-foreground font-normal">{state.user.email}</p></DropdownMenuLabel>
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

      </header>

      {/* Mobile navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left">
          <SheetHeader><SheetTitle><Logo /></SheetTitle><SheetDescription className="sr-only">Site navigation</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {[['Home', () => navigate('home')], ['Shop', () => navigate('listing', { collection: 'All' })], ['Our story', () => navigate('story')], ['Contact', () => navigate('contact')]].map(([l, fn]) => (
              <button key={l as string} onClick={() => go(fn as () => void)} className="w-full flex items-center justify-between py-4 border-b border-border text-left">
                <span className="font-serif text-3xl">{l as string}</span><ArrowRight size={18} className="text-muted-foreground" />
              </button>
            ))}
            <div className="grid grid-cols-2 gap-3 mt-8 pb-6">
              <button onClick={() => go(() => (state.user ? navigate('account') : navigate('auth')))} className="h-12 rounded-full border border-border flex items-center justify-center gap-2 text-sm font-medium">
                <User size={16} />{state.user ? state.user.firstName : 'Sign in'}
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
