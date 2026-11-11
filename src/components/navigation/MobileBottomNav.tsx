import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../features/cart/hooks/useCart';

const destinations = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Search', href: '/home#search', icon: Search },
  { label: 'Cart', href: '/cart', icon: ShoppingCart },
  { label: 'Account', href: '/profile', icon: User },
] as const;

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { data: cart } = useCart();
  const cartCount = cart?.cartItems.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const activeIndex =
    location.pathname === '/home'
      ? location.hash === '#search'
        ? 1
        : 0
      : location.pathname === '/cart'
        ? 2
        : ['/profile', '/addresses'].includes(location.pathname)
        ? 3
        : -1;

  const isDashboardRoute = ['/home', '/cart', '/profile', '/addresses'].includes(location.pathname);
  if (!isDashboardRoute) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-1 shadow-[0_-8px_24px_rgba(16,38,72,0.08)] backdrop-blur-xl sm:hidden"
    >
      <div className="relative grid min-h-16 grid-cols-4 px-1">
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-[3px] z-0 size-10 rounded-full bg-[#2563EB] shadow-[0_4px_12px_rgba(37,99,235,0.24)] transition-[left] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ left: `calc(${12.5 + activeIndex * 25}% - 20px)` }}
          />
        )}
        {destinations.map(({ label, href, icon: Icon }, index) => {
          const active = index === activeIndex;

          return (
            <Link
              key={label}
              to={href}
              aria-current={active ? 'page' : undefined}
              aria-label={label === 'Cart' && cartCount > 0 ? `Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}` : label}
              className={`relative z-10 flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-xl text-[10px] font-semibold leading-none transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 motion-reduce:transition-none ${
                active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="relative flex size-10 shrink-0 items-center justify-center">
                <Icon
                  aria-hidden="true"
                  className={`size-5 transition duration-300 ease-out motion-reduce:transition-none ${
                    active ? 'scale-105 text-white' : 'text-current'
                  }`}
                  strokeWidth={active ? 2 : 1.6}
                />
                {label === 'Cart' && cartCount > 0 && (
                  <span aria-hidden="true" className={`absolute right-0 top-0 min-w-4 rounded-full px-1 text-center text-[9px] font-bold leading-4 ${active ? 'bg-white text-[#2563EB]' : 'bg-[#2563EB] text-white'}`}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
              <span className="relative z-10 leading-3">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
