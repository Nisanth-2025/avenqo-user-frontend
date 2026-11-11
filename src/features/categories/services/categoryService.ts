import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import {
  CategoryDTO,
  CategoryPageResponseDTO,
  CategoryListParams,
} from '../../../types/category.types';
import { ProductPageResponseDTO, ProductQueryParams } from '../../../types/product.types';

export const categoryService = {
  /**
   * List active marketplace categories (paged).
   * GET /api/v1/categories
   */
  async listCategories(params?: CategoryListParams): Promise<CategoryPageResponseDTO> {
    try {
      const response = await apiAxios.get<CategoryPageResponseDTO>(API_ENDPOINTS.CATEGORIES.LIST, {
        params: {
          pageNumber: params?.pageNumber ?? 0,
          pageSize: params?.pageSize ?? 50,
          sortBy: params?.sortBy ?? 'categoryName',
          sortOrder: params?.sortOrder ?? 'asc',
        },
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Get single active category by ID.
   * GET /api/v1/categories/{categoryId}
   */
  async getCategoryById(categoryId: number | string): Promise<CategoryDTO> {
    try {
      const response = await apiAxios.get<CategoryDTO>(
        API_ENDPOINTS.CATEGORIES.BY_ID(categoryId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Browse active products in a category (paged).
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
