import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { CollectionHero } from '../features/products/components/CollectionHero';
import { UserNavbar } from '../components/navigation/UserNavbar';
import { useCategories } from '../features/categories/hooks/useCategories';
import { useBrowseProducts } from '../features/products/hooks/useProducts';
import { ProductCard } from '../features/products/components/ProductCard';
import { ProductDetailModal } from '../features/products/components/ProductDetailModal';
import { ProductDTO, ProductQueryParams } from '../types/product.types';

export const HomePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const catalogRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (location.hash !== '#search') return;

    requestAnimationFrame(() => {
      searchInputRef.current?.focus({ preventScroll: true });
      searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }, [location.hash]);

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
  const visibleCategories = categoriesExpanded ? categories : categories.slice(0, 5);
  const products = productData?.content || [];
  const totalElements = productData?.totalElements || 0;
  const totalPages = productData?.totalPages || 1;
  const currentPage = productData?.pageNumber || 0;
  const activeCategory = categories.find((c) => c.categoryId === selectedCategoryId);

  const browsingCatalog = !keyword && !selectedCategoryId;

  const sectionTitle = keyword
    ? `Results for “${keyword}”`
    : activeCategory
      ? activeCategory.categoryName
      : 'Latest arrivals';

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-neutral-950">
      <UserNavbar showSearch={false} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-8 sm:pb-16 sm:pt-8">
        <form
          id="search"
          className="relative mt-1 sm:mt-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSearch(draft.trim());
          }}
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-neutral-900" />
          <input
            ref={searchInputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search products or categories..."
            className="h-12 w-full rounded-full border border-slate-200 bg-[#f0efed] pl-12 pr-11 text-[16px] text-neutral-900 placeholder:text-neutral-500 shadow-[inset_0_1px_1px_rgba(0,0,0,0.025)] transition focus:outline-none focus:ring-2 focus:ring-brand-300 sm:text-base"
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

        <section className="mt-7 sm:mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-[19px] font-semibold tracking-tight sm:text-2xl">Shop by categories</h2>
            {categories.length > 5 && (
              <button
                type="button"
                onClick={() => setCategoriesExpanded((open) => !open)}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-neutral-600 transition hover:text-neutral-950"
              >
                {categoriesExpanded ? 'Show less' : 'See all'}
              </button>
            )}
          </div>

          <div
            className={
              categoriesExpanded
                ? 'flex flex-wrap gap-x-4 gap-y-5'
                : 'flex gap-4 overflow-x-auto pb-2 no-scrollbar sm:gap-6'
            }
          >
            {categoriesLoading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex w-14 flex-shrink-0 flex-col items-center gap-2 sm:w-[88px]">
                    <div className="h-14 w-14 animate-pulse rounded-full bg-[#eceae6] sm:h-[88px] sm:w-[88px]" />
                    <div className="h-2 w-12 animate-pulse rounded bg-[#eceae6]" />
                  </div>
                ))
              : visibleCategories.map((category) => (
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
          <div className="mt-7 sm:mt-10">
            <CollectionHero
              onShopNow={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            />
          </div>
        )}

        <section ref={catalogRef} className="mt-8 scroll-mt-24 sm:mt-10">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[19px] font-semibold tracking-tight sm:text-2xl">{sectionTitle}</h2>
              <p className="mt-1 text-[11px] text-neutral-500">
                {productsLoading ? 'Finding pieces for you…' : `${totalElements} ${totalElements === 1 ? 'piece' : 'pieces'}`}
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
                className="rounded-full bg-[#f0efed] px-3 py-1.5 text-xs font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
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
      className="flex w-14 flex-shrink-0 flex-col items-center gap-2 sm:w-[88px]"
    >
      <span
        className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#eceae6] text-sm text-neutral-600 transition duration-200 sm:h-[88px] sm:w-[88px] ${
          selected ? 'ring-2 ring-brand-700 ring-offset-2 ring-offset-[#fbfaf8]' : 'hover:scale-[1.03]'
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

export default HomePage;
