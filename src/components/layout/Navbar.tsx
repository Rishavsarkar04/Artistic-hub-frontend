import React, { useEffect, useState } from 'react';
import { ShoppingBag, User, Menu, ArrowRight, Package, MapPin, LogOut, LogIn, UserPlus } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router';
import { paths } from '../../routes';
import { useAuthStore } from '../../stores/authStore';
import { useCartCount } from '../../stores/cartStore';
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
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useCartCount();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  const closeMenu = () => setMobileOpen(false);
  const signOut = () => { logout(); navigate(paths.home); };

  const primaryLinks = [
    { label: 'Home', to: paths.home, active: pathname === paths.home },
    { label: 'Shop', to: paths.shop(), active: pathname.startsWith('/shop') || pathname.startsWith('/products') },
    { label: 'Our story', to: paths.story, active: pathname === paths.story },
    { label: 'Contact', to: paths.contact, active: pathname === paths.contact },
  ];

  return (
    <>
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
                  <Link key={l.label} to={l.to} aria-current={l.active ? 'page' : undefined}
                    className={cn('px-3 h-9 rounded-full text-sm flex items-center', l.active ? 'text-foreground bg-foreground/[.06]' : 'text-muted-foreground hover:text-foreground')}>
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            <Link to={paths.home} aria-label="Ember & Bloom home" className="justify-self-center">
              <Logo />
            </Link>

            <div className="flex items-center justify-end gap-1 -mr-2">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex size-10 items-center justify-center rounded-full hover:bg-foreground/5 outline-none focus-visible:ring-4 focus-visible:ring-ring/25" aria-label={user ? 'Account menu' : 'Account'}>
                    {user
                      ? <span className="size-7 rounded-full bg-ink text-[#F7F4EF] text-[11px] font-semibold flex items-center justify-center">{(user.firstName[0] ?? '') + (user.lastName[0] ?? '')}</span>
                      : <User size={19} />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {user ? (
                    <>
                      <DropdownMenuLabel><p className="text-sm font-medium">{fullName(user)}</p><p className="text-xs text-muted-foreground font-normal">{user.email}</p></DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate(paths.account('profile'))}><User />Profile</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate(paths.account('orders'))}><Package />Orders</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate(paths.account('addresses'))}><MapPin />Addresses</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={signOut}><LogOut />Sign out</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onSelect={() => navigate(paths.login)}><LogIn />Sign in</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => navigate(paths.register)}><UserPlus />Create an account</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => navigate(paths.contact)}><Package />Help with an order</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to={paths.cart} className="ml-1 h-10 pl-3.5 pr-4 rounded-full bg-ink text-[#F7F4EF] text-sm font-medium flex items-center gap-2 hover:bg-ink-soft"
                aria-label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
                <ShoppingBag size={16} /><span className="tabular">{cartCount}</span>
              </Link>
            </div>
          </div>
        </div>

      </header>

      {/* Mobile navigation */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left">
          <SheetHeader><SheetTitle><Logo /></SheetTitle><SheetDescription className="sr-only">Site navigation</SheetDescription></SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {primaryLinks.map((l) => (
              <Link key={l.label} to={l.to} onClick={closeMenu} aria-current={l.active ? 'page' : undefined} className="w-full flex items-center justify-between py-4 border-b border-border text-left">
                <span className="font-serif text-3xl">{l.label}</span><ArrowRight size={18} className="text-muted-foreground" />
              </Link>
            ))}
            <div className="grid grid-cols-2 gap-3 mt-8 pb-6">
              <Link to={user ? paths.account() : paths.login} onClick={closeMenu} className="h-12 rounded-full border border-border flex items-center justify-center gap-2 text-sm font-medium">
                <User size={16} />{user ? user.firstName : 'Sign in'}
              </Link>
              <Link to={paths.cart} onClick={closeMenu} className="h-12 rounded-full bg-ink text-[#F7F4EF] flex items-center justify-center gap-2 text-sm font-medium">
                <ShoppingBag size={16} />Cart ({cartCount})
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
