import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import {
  ProductDTO,
  ProductPageResponseDTO,
  ProductQueryParams,
  ProductKeywordSearchParams,
} from '../../../types/product.types';

export const productService = {
  /**
   * Browse active marketplace products (paged).
   * GET /api/v1/products
   */
  async listProducts(params?: ProductQueryParams): Promise<ProductPageResponseDTO> {
    try {
      const response = await apiAxios.get<ProductPageResponseDTO>(API_ENDPOINTS.PRODUCTS.LIST, {
        params: {
          pageNumber: params?.pageNumber ?? 0,
          pageSize: params?.pageSize ?? 50,
          sortBy: params?.sortBy ?? 'productName',
          sortOrder: params?.sortOrder ?? 'asc',
        },
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Read single active product detail.
   * GET /api/v1/products/{productId}
   */
  async getProductById(productId: number | string): Promise<ProductDTO> {
    try {
      const response = await apiAxios.get<ProductDTO>(
        API_ENDPOINTS.PRODUCTS.BY_ID(productId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Search products by product name keyword (paged).
   * GET /api/v1/products/keyword?productName=...
   */
  async searchProductsByKeyword(
    params: ProductKeywordSearchParams
  ): Promise<ProductPageResponseDTO> {
    try {
      const response = await apiAxios.get<ProductPageResponseDTO>(API_ENDPOINTS.PRODUCTS.KEYWORD, {
        params: {
          productName: params.productName.trim(),
          pageNumber: params.pageNumber ?? 0,
          pageSize: params.pageSize ?? 50,
          sortBy: params.sortBy ?? 'productName',
          sortOrder: params.sortOrder ?? 'asc',
        },
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Browse active products in a specific category.
   * GET /api/v1/categories/{categoryId}/products
   */
  async listProductsByCategory(
    categoryId: number | string,
    params?: ProductQueryParams
  ): Promise<ProductPageResponseDTO> {
    try {
      const response = await apiAxios.get<ProductPageResponseDTO>(
        API_ENDPOINTS.CATEGORIES.PRODUCTS(categoryId),
        {
          params: {
            pageNumber: params?.pageNumber ?? 0,
            pageSize: params?.pageSize ?? 50,
            sortBy: params?.sortBy ?? 'productName',
            sortOrder: params?.sortOrder ?? 'asc',
          },
        }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
