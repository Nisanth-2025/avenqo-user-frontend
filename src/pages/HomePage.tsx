import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Home, MapPin, Search, User, X, type LucideIcon } from 'lucide-react';
import { UserNavbar } from '../components/navigation/UserNavbar';
import { useCategories } from '../features/categories/hooks/useCategories';
import { useBrowseProducts } from '../features/products/hooks/useProducts';
import { ProductCard } from '../features/products/components/ProductCard';
import { ProductDetailModal } from '../features/products/components/ProductDetailModal';
import { ProductDTO, ProductQueryParams } from '../types/product.types';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useUserProfile } from '../features/profile/hooks/useUserProfile';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category')
    ? Number(searchParams.get('category'))
    : null;

  const [keyword, setKeyword] = useState<string>(queryParam);
  const [draft, setDraft] = useState<string>(queryParam);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(categoryParam);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [queryParams, setQueryParams] = useState<ProductQueryParams>({
    pageNumber: 0,
    pageSize: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);

  useEffect(() => {
    setKeyword(queryParam);
    setDraft(queryParam);
    setSelectedCategoryId(categoryParam);
  }, [queryParam, categoryParam]);

  const { data: categoryData, isLoading: categoriesLoading } = useCategories({
    pageSize: 50,
    sortBy: 'categoryName',
    sortOrder: 'asc',
  });

  const { data: productData, isLoading: productsLoading, isFetching } = useBrowseProducts({
    keyword: keyword || undefined,
    categoryId: selectedCategoryId,
    params: queryParams,
  });

  const handleSearch = (term: string) => {
    setKeyword(term);
    setDraft(term);
    setQueryParams((prev) => ({ ...prev, pageNumber: 0 }));

    const nextParams = new URLSearchParams(searchParams);
    if (term) {
      nextParams.set('q', term);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleSelectCategory = (catId: number | null) => {
    setSelectedCategoryId(catId);
    setKeyword('');
    setDraft('');
    setQueryParams((prev) => ({ ...prev, pageNumber: 0 }));

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    if (catId) {
      nextParams.set('category', catId.toString());
    } else {
      nextParams.delete('category');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearAllFilters = () => {
    setKeyword('');
    setDraft('');
    setSelectedCategoryId(null);
    setQueryParams((prev) => ({ ...prev, pageNumber: 0 }));
    setSearchParams({}, { replace: true });
  };

  const categories = categoryData?.content || [];
  const products = productData?.content || [];
  const totalElements = productData?.totalElements || 0;
  const totalPages = productData?.totalPages || 1;
  const currentPage = productData?.pageNumber || 0;
  const activeCategory = categories.find((c) => c.categoryId === selectedCategoryId);

  const browsingCatalog = !keyword && !selectedCategoryId;
  const featured =
    browsingCatalog && !productsLoading
      ? products.find((product) => product.images?.length) || products[0]
      : undefined;
  const featuredImage =
    featured?.images?.find((img) => img.primaryImage) || featured?.images?.[0];

  const firstName =
    profile?.firstName ||
    profile?.username ||
    user?.email?.split('@')[0] ||
    'there';

  const sectionTitle = keyword
    ? `Results for “${keyword}”`
    : activeCategory
      ? activeCategory.categoryName
      : 'Latest arrivals';

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-neutral-900">
      <UserNavbar showSearch={false} />

      <main className="mx-auto w-full max-w-6xl px-5 pb-28 pt-6 sm:px-8 sm:pb-16 sm:pt-8">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eceae6] text-sm text-neutral-700"
            aria-label="Open profile"
          >
            {profile?.imageUrl ? (
              <img src={profile.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              firstName.charAt(0).toUpperCase()
            )}
          </Link>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium leading-tight">Hi, {firstName}</p>
            <p className="mt-0.5 text-xs text-neutral-500">Browse the marketplace</p>
          </div>
        </div>

        <form
          className="relative mt-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch(draft.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search..."
            className="w-full rounded-full border-0 bg-[#efece8] py-3 pl-11 pr-11 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
          {draft && (
            <button
              type="button"
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium">Shop by categories</h2>
            {categories.length > 5 && (
              <button
                type="button"
                onClick={() => setCategoriesExpanded((open) => !open)}
                className="text-sm text-neutral-500 hover:text-neutral-900"
              >
                {categoriesExpanded ? 'Show less' : 'See all'}
              </button>
            )}
          </div>

          <div
            className={
              categoriesExpanded
                ? 'flex flex-wrap gap-x-5 gap-y-6'
                : 'flex gap-5 overflow-x-auto pb-1 no-scrollbar'
            }
          >
            <CategoryCircle
              label="All"
              selected={selectedCategoryId === null && !keyword}
              onClick={() => handleSelectCategory(null)}
            />
            {categoriesLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex w-[72px] flex-shrink-0 flex-col items-center gap-2">
                    <div className="h-[72px] w-[72px] animate-pulse rounded-full bg-[#eceae6]" />
                    <div className="h-2 w-12 animate-pulse rounded bg-[#eceae6]" />
                  </div>
                ))
              : categories.map((category) => (
                  <CategoryCircle
                    key={category.categoryId}
                    label={category.categoryName}
                    imageUrl={category.categoryImageUrl}
                    selected={selectedCategoryId === category.categoryId}
                    onClick={() => handleSelectCategory(category.categoryId)}
                  />
                ))}
          </div>
        </section>

        {browsingCatalog && (
          <section className="mt-10">
            {productsLoading ? (
              <div className="h-[340px] animate-pulse rounded-2xl bg-[#eceae6] sm:h-[400px]" />
            ) : featured ? (
              <button
                type="button"
                onClick={() => setSelectedProduct(featured)}
                className="relative block h-[340px] w-full overflow-hidden rounded-2xl bg-[#e7e2da] text-left sm:h-[420px]"
              >
                {featuredImage && (
                  <img
                    src={featuredImage.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover object-[center_20%]"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent" />
                <div className="relative z-10 px-7 pt-10 sm:px-12 sm:pt-14">
                  <p className="max-w-[16rem] text-3xl font-medium leading-tight tracking-tight text-white sm:max-w-sm sm:text-4xl">
                    {featured.productName}
                  </p>
                  <span className="mt-5 inline-flex w-fit rounded-full bg-white px-5 py-2 text-sm text-neutral-900">
                    Shop now
                  </span>
                </div>
                <p className="pointer-events-none absolute inset-x-4 bottom-[-0.12em] text-center font-display text-7xl leading-none text-white sm:text-[7.25rem]">
                  Avenquo
                </p>
              </button>
            ) : null}
          </section>
        )}

        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[15px] font-medium">{sectionTitle}</h2>
              <p className="mt-1 text-xs text-neutral-500">
                {productsLoading ? 'Loading' : `${totalElements} ${totalElements === 1 ? 'piece' : 'pieces'}`}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="hidden sm:inline">Sort</span>
              <select
                value={`${queryParams.sortBy}-${queryParams.sortOrder}`}
                onChange={(event) => {
                  const [sortBy, sortOrder] = event.target.value.split('-') as [
                    'productId' | 'productName' | 'price' | 'specialPrice' | 'createdAt',
                    'asc' | 'desc',
                  ];
                  setQueryParams((prev) => ({ ...prev, sortBy, sortOrder, pageNumber: 0 }));
                }}
                className="bg-transparent py-1 text-xs text-neutral-700 focus:outline-none"
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="price-asc">Price, low to high</option>
                <option value="price-desc">Price, high to low</option>
                <option value="productName-asc">Name, A to Z</option>
                <option value="productName-desc">Name, Z to A</option>
              </select>
            </label>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index}>
                  <div className="aspect-[4/5] animate-pulse rounded-2xl bg-[#eceae6]" />
                  <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-[#eceae6]" />
                  <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[#eceae6]" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-neutral-800">Nothing matches this view.</p>
              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-neutral-500">
                {keyword
                  ? `No active items matched “${keyword}”. Try another word, or clear the search.`
                  : 'There are no active products in this part of the catalog.'}
              </p>
              {(keyword || selectedCategoryId) && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="mt-5 text-sm text-neutral-900 underline underline-offset-4"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  onClick={(item) => setSelectedProduct(item)}
                />
              ))}
            </div>
          )}

          {productData && totalElements > 0 && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-neutral-200/80 pt-5 text-sm">
              <p className="text-xs text-neutral-500">
                Page {currentPage + 1} of {totalPages}
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={currentPage === 0 || isFetching}
                  onClick={() =>
                    setQueryParams((prev) => ({
                      ...prev,
                      pageNumber: Math.max(0, (prev.pageNumber ?? 0) - 1),
                    }))
                  }
                  className="text-neutral-800 disabled:text-neutral-300"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={productData.lastPage || isFetching}
                  onClick={() =>
                    setQueryParams((prev) => ({
                      ...prev,
                      pageNumber: (prev.pageNumber ?? 0) + 1,
                    }))
                  }
                  className="text-neutral-800 disabled:text-neutral-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200/80 bg-[#f7f5f2]/95 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-end justify-between px-8 pb-3 pt-2">
          <NavItem to="/home" icon={Home} label="Home" active />
          <button
            type="button"
            onClick={() => searchInputRef.current?.focus()}
            className="flex flex-col items-center gap-1 pb-1 text-[11px] text-neutral-500"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
            Search
          </button>
          <NavItem to="/addresses" icon={MapPin} label="Addresses" />
          <NavItem to="/profile" icon={User} label="Profile" />
        </div>
      </nav>

      <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};

function CategoryCircle({
  label,
  imageUrl,
  selected,
  onClick,
}: {
  label: string;
  imageUrl?: string | null;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[72px] flex-shrink-0 flex-col items-center gap-2"
    >
      <span
        className={`flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-[#eceae6] text-sm text-neutral-600 ${
          selected ? 'ring-2 ring-neutral-900 ring-offset-2 ring-offset-[#f7f5f2]' : ''
        }`}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          label.charAt(0).toUpperCase()
        )}
      </span>
      <span className="w-full truncate text-center text-[11px] text-neutral-600">{label}</span>
    </button>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  active = false,
}: {
  to: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 pb-1 text-[11px] ${
        active ? 'text-neutral-900' : 'text-neutral-500'
      }`}
    >
      <span
        className={
          active
            ? 'flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 text-white'
            : ''
        }
      >
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      {label}
    </Link>
  );
}

export default HomePage;
