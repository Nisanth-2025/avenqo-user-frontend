import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Search, User } from 'lucide-react';

const destinations = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Search', href: '/home#search', icon: Search },
  { label: 'Addresses', href: '/addresses', icon: MapPin },
  { label: 'Account', href: '/profile', icon: User },
] as const;

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const activeIndex =
    location.pathname === '/home'
      ? location.hash === '#search'
        ? 1
        : 0
      : location.pathname === '/addresses'
        ? 2
        : location.pathname === '/profile'
          ? 3
          : -1;

  if (activeIndex < 0) return null;

  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(16,38,72,0.08)] backdrop-blur-xl sm:hidden"
    >
      <div className="relative grid grid-cols-4 px-1">
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1 z-0 h-10 w-10 rounded-full bg-[#173b70] shadow-[0_4px_12px_rgba(23,59,112,0.24)] transition-[left] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
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
              aria-label={label}
              className={`relative z-10 flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#376cac] focus-visible:ring-offset-2 motion-reduce:transition-none ${
                active ? 'text-[#173b70]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon
                aria-hidden="true"
                className={`h-5 w-5 transition duration-300 ease-out motion-reduce:transition-none ${
                  active ? 'scale-105 text-white' : 'text-current'
                }`}
                strokeWidth={active ? 2 : 1.6}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
