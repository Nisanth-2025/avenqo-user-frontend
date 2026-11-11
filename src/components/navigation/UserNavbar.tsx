import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useUserProfile } from '../../features/profile/hooks/useUserProfile';
import { Search, User, MapPin, LogOut, ShoppingBag, X } from 'lucide-react';

interface UserNavbarProps {
  onSearch?: (term: string) => void;
  searchValue?: string;
  showSearch?: boolean;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({
  onSearch,
  searchValue,
  showSearch = true,
}) => {
  const { user, logout } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [inputTerm, setInputTerm] = useState(searchValue ?? searchParams.get('q') ?? '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchValue !== undefined) {
      setInputTerm(searchValue);
    }
  }, [searchValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputTerm.trim();
    if (onSearch) {
      onSearch(trimmed);
    } else {
      navigate(`/home?q=${encodeURIComponent(trimmed)}`);
    }
    setIsMobileMenuOpen(false);
  };

  const handleClearSearch = () => {
    setInputTerm('');
    if (onSearch) {
      onSearch('');
    } else {
      navigate('/home');
    }
  };

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName || profile?.username || user?.email?.split('@')[0] || 'Account';

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200/60 bg-[#fbfaf8]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between gap-3 px-4 sm:h-[76px] sm:px-8">
        <Link to="/home" className="flex min-w-0 flex-shrink-0 items-center gap-2.5 text-neutral-950">
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#173b70] text-white shadow-[0_4px_12px_rgba(23,59,112,0.2)] sm:h-11 sm:w-11">
            <ShoppingBag className="h-[21px] w-[21px]" strokeWidth={1.65} />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-[18px] font-bold leading-none tracking-tight sm:text-[21px]">Avenquo</span>
            <span className="mt-1 truncate text-[10px] leading-none text-neutral-500 sm:text-xs">Online marketplace</span>
          </span>
        </Link>

        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="relative hidden min-w-0 flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={inputTerm}
              onChange={(e) => setInputTerm(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border-0 bg-[#efece8] py-2 pl-10 pr-10 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
            {inputTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </form>
        )}

        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              aria-label={`Open ${displayName} account menu`}
              className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-neutral-200/70 bg-[#f0efed] text-neutral-800 transition hover:bg-neutral-200/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            >
              <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full text-xs text-neutral-700">
                {profile?.imageUrl ? (
                  <img src={profile.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-5 w-5" strokeWidth={1.6} />
                )}
              </span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-[0_16px_44px_rgba(0,0,0,0.14)]">
                <div className="px-3 py-2">
                  <p className="truncate text-sm text-neutral-900">{displayName}</p>
                  <p className="truncate text-xs text-neutral-500">{user?.email}</p>
                </div>
                <div className="my-1 border-t border-neutral-100" />
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
                >
                  <User className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                  Profile
                </Link>
                <Link
                  to="/addresses"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
                >
                  <MapPin className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                  Addresses
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
                >
                  <LogOut className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
                  Log out
                </button>
              </div>
            )}
          </div>

          {showSearch && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-600 hover:bg-black/[0.04] sm:hidden"
              aria-label="Toggle search"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {showSearch && isMobileMenuOpen && (
        <div className="border-t border-neutral-200/70 px-5 py-3 sm:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={inputTerm}
              onChange={(e) => setInputTerm(e.target.value)}
              placeholder="Search..."
              className="w-full rounded-full border-0 bg-[#efece8] py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
            />
          </form>
        </div>
      )}
    </header>
  );
};
