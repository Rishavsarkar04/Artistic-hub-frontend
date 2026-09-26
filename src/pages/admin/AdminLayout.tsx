import React, { useState } from 'react';
import { Link, Outlet, matchPath, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ExternalLink, LogOut, Menu, Package, Tag, Users } from 'lucide-react';
import { ROUTES, paths } from '@/router/paths';
import { useAdminAuthStore } from '@/stores/adminAuthStore';
import { Logo } from '@/components/layout/Navbar';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

/** Admin sections in the sidebar. Add new admin pages here. */
const NAV = [
  { label: 'Customers', to: paths.adminCustomers(), match: ROUTES.adminCustomers, icon: Users },
  { label: 'Orders', to: paths.adminOrders(), match: ROUTES.adminOrders, icon: Package },
  // `/*` keeps Products highlighted on its sub-pages, e.g. Add product.
  { label: 'Products', to: paths.adminProducts(), match: `${ROUTES.adminProducts}/*`, icon: Tag },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-8">
        <Logo light />
        <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#F7F4EF]/50">Admin</p>
      </div>

      <nav className="flex-1 px-3 space-y-1" aria-label="Admin">
        {NAV.map(({ label, to, match, icon: Icon }) => {
          const active = !!matchPath(match, pathname);
          return (
            <Link key={label} to={to} onClick={onNavigate} aria-current={active ? 'page' : undefined}
              className={cn('flex items-center gap-3 rounded-xl px-3 h-10 text-sm transition-colors', active ? 'bg-white/10 text-white font-medium' : 'text-[#F7F4EF]/65 hover:bg-white/5 hover:text-white')}>
              <Icon size={17} /> {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-5 space-y-1">
        <Link to={paths.home} target="_blank" className="flex items-center gap-3 rounded-xl px-3 h-10 text-sm text-[#F7F4EF]/65 hover:bg-white/5 hover:text-white">
          <ExternalLink size={17} /> View shop
        </Link>
      </div>
    </div>
  );
}

/** The signed-in admin in the top-right corner: avatar that opens name, email and sign out. */
function AdminMenu({ dark = false }: { dark?: boolean }) {
  const navigate = useNavigate();
  const admin = useAdminAuthStore((s) => s.admin);
  const logout = useAdminAuthStore((s) => s.logout);
  if (!admin) return null;
  const initials = admin.name.split(' ').map((w) => w[0]).slice(0, 2).join('');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn('group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 outline-none focus-visible:ring-4 focus-visible:ring-ring/25', dark ? 'hover:bg-white/10' : 'hover:bg-foreground/5')} aria-label="Admin account menu">
          <span className="size-8 rounded-full bg-glow text-ink text-xs font-semibold flex items-center justify-center">{initials}</span>
          <span className={cn('hidden sm:block text-sm font-medium', dark ? 'text-[#F7F4EF]' : 'text-foreground')}>{admin.name}</span>
          <ChevronDown size={15} className={cn('hidden sm:block transition-transform group-data-[state=open]:rotate-180', dark ? 'text-[#F7F4EF]/60' : 'text-muted-foreground')} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        <DropdownMenuLabel>
          <p className="text-sm font-medium">{admin.name}</p>
          <p className="text-xs text-muted-foreground font-normal truncate">{admin.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => { logout(); navigate(paths.adminLogin); }}><LogOut />Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Shell for every admin page: dark sidebar on desktop, a slide-out menu on mobile. */
export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-secondary/40 text-foreground lg:flex">
      <aside className="hidden lg:block w-64 shrink-0 bg-ink sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between h-14 px-4 bg-ink text-[#F7F4EF]">
        <button onClick={() => setMenuOpen(true)} className="-ml-2 size-10 flex items-center justify-center rounded-full hover:bg-white/10" aria-label="Open admin menu">
          <Menu size={20} />
        </button>
        <Logo light />
        <AdminMenu dark />
      </div>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="bg-ink border-0 p-0 w-72">
          <SheetHeader className="sr-only"><SheetTitle>Admin menu</SheetTitle><SheetDescription>Admin navigation</SheetDescription></SheetHeader>
          <SidebarContent onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 min-w-0">
        <div className="hidden lg:flex sticky top-0 z-20 h-16 items-center justify-end px-10 border-b border-border/70 glass-light">
          <AdminMenu />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
