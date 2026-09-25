import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { paths, ACCOUNT_TABS, type AccountTab } from '@/router/paths';

import { fullName } from '@/lib/utils';
import { User, MapPin, Package, LogOut } from 'lucide-react';

import { useAuthStore } from '@/stores/authStore';

import type { AccountSection } from '@/types';

import { ProfileSection } from './ProfileSection';
import { AddressesSection } from './AddressesSection';
import { OrdersSection } from './OrdersSection';
import { OrderDetailSection } from './OrderDetailSection';

const navItems: { id: AccountSection; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
  { id: 'orders', label: 'Order History', icon: Package },
];

export function AccountPage() {
  const navigate = useNavigate();
  const { tab, orderId } = useParams();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const signOut = () => { logout(); navigate(paths.home); };
  const section: AccountSection = orderId ? 'order-detail' : (tab as AccountSection);

  // RequireAuth in the router keeps signed-out visitors away; unknown tabs fall back to Profile.
  if (!user) return null;
  if (!orderId && !ACCOUNT_TABS.includes(tab as AccountTab)) return <Navigate to={paths.account()} replace />;

  const setSection = (s: AccountSection) => navigate(paths.account(s as AccountTab));
  const handleViewOrderDetail = (id: string) => navigate(paths.accountOrder(id));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">My Account</p>
          <h1 className="font-serif text-4xl font-semibold">{fullName(user)}</h1>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="space-y-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  (section === id || (section === 'order-detail' && id === 'orders'))
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden w-full mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSection(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${
                  section === id || (section === 'order-detail' && id === 'orders')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0 bg-muted text-muted-foreground"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === 'profile' && <ProfileSection />}
          {section === 'addresses' && <AddressesSection />}
          {section === 'orders' && <OrdersSection onViewDetail={handleViewOrderDetail} />}
          {section === 'order-detail' && orderId && (
            <OrderDetailSection orderId={orderId} onBack={() => setSection('orders')} />
          )}
        </div>
      </div>
    </div>
  );
}
