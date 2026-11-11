import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { CartDTO } from '../../../types/cart.types';

const noBodyConfig = { headers: { 'Content-Type': null } };

function assertPositiveInteger(value: number, field: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive whole number.`);
  }
}

export const cartService = {
  async getCart(): Promise<CartDTO> {
    try {
      const response = await apiAxios.get<CartDTO>(API_ENDPOINTS.CART.BASE, noBodyConfig);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async addProduct(productId: number, quantity: number): Promise<CartDTO> {
    assertPositiveInteger(productId, 'Product ID');
    assertPositiveInteger(quantity, 'Quantity');

    try {
      const response = await apiAxios.post<CartDTO>(
        API_ENDPOINTS.CART.PRODUCT_QUANTITY(productId, quantity),
        undefined,
        noBodyConfig,
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async setProductQuantity(productId: number, quantity: number): Promise<CartDTO> {
    assertPositiveInteger(productId, 'Product ID');
    assertPositiveInteger(quantity, 'Quantity');

    try {
      const response = await apiAxios.put<CartDTO>(
        API_ENDPOINTS.CART.PRODUCT_QUANTITY(productId, quantity),
        undefined,
        noBodyConfig,
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async removeProduct(productId: number): Promise<void> {
    assertPositiveInteger(productId, 'Product ID');

    try {
      await apiAxios.delete(API_ENDPOINTS.CART.PRODUCT(productId), noBodyConfig);
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async clearCart(): Promise<void> {
    try {
      await apiAxios.delete(API_ENDPOINTS.CART.BASE, noBodyConfig);
    } catch (error) {
      throw extractApiError(error);
    }
  },
};
