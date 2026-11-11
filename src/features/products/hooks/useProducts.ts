import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { ProductQueryParams } from '../../../types/product.types';

export const PRODUCTS_QUERY_KEY = ['products'];

/**
 * Hook to browse active products, with support for keyword search or category filter.
 */
export function useBrowseProducts({
  keyword,
  categoryId,
  params,
}: {
  keyword?: string;
  categoryId?: number | string | null;
  params?: ProductQueryParams;
}) {
  const isSearch = Boolean(keyword && keyword.trim().length > 0);
  const isCategory = Boolean(categoryId && !isSearch);

  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'browse', { keyword, categoryId, params }],
    queryFn: () => {
      if (isSearch && keyword) {
        return productService.searchProductsByKeyword({
          productName: keyword.trim(),
          ...params,
        });
      }
      if (isCategory && categoryId) {
        return productService.listProductsByCategory(categoryId, params);
      }
      return productService.listProducts(params);
    },
    staleTime: 30_000,
  });
}

/**
 * Hook to read single product detail.
 */
export function useProductDetail(productId: number | string | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, 'detail', productId],
    queryFn: () => {
      if (!productId) throw new Error('Product ID is required');
      return productService.getProductById(productId);
    },
    enabled: Boolean(productId),
    staleTime: 60_000,
  });
}
