import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import {
  AddressResponseDTO,
  CreateAddressRequestDTO,
  UpdateAddressRequestDTO,
} from '../../../types/address.types';

export const addressService = {
  /**
   * List all saved addresses for signed-in user.
   * GET /api/v1/addresses
   */
  async listAddresses(): Promise<AddressResponseDTO[]> {
    try {
      const response = await apiAxios.get<AddressResponseDTO[]>(API_ENDPOINTS.ADDRESSES.BASE);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Get single address by ID.
   * GET /api/v1/addresses/{addressId}
   */
  async getAddressById(addressId: number | string): Promise<AddressResponseDTO> {
    try {
      const response = await apiAxios.get<AddressResponseDTO>(
        API_ENDPOINTS.ADDRESSES.BY_ID(addressId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Create a new address (up to 5 per user).
   * POST /api/v1/addresses
   */
  async createAddress(data: CreateAddressRequestDTO): Promise<AddressResponseDTO> {
    try {
      const response = await apiAxios.post<AddressResponseDTO>(
        API_ENDPOINTS.ADDRESSES.BASE,
        data
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Partial update an existing address.
   * PUT /api/v1/addresses/{addressId}
   */
  async updateAddress(
    addressId: number | string,
    data: UpdateAddressRequestDTO
  ): Promise<AddressResponseDTO> {
    try {
      const response = await apiAxios.put<AddressResponseDTO>(
        API_ENDPOINTS.ADDRESSES.BY_ID(addressId),
        data
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Delete an address.
   * DELETE /api/v1/addresses/{addressId}
   */
  async deleteAddress(addressId: number | string): Promise<void> {
    try {
      await apiAxios.delete(API_ENDPOINTS.ADDRESSES.BY_ID(addressId));
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Set address as default shipping address.
   * PATCH /api/v1/addresses/{addressId}/default-shipping
   */
  async setDefaultShipping(addressId: number | string): Promise<AddressResponseDTO> {
    try {
      const response = await apiAxios.patch<AddressResponseDTO>(
        API_ENDPOINTS.ADDRESSES.DEFAULT_SHIPPING(addressId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Set address as default billing address.
   * PATCH /api/v1/addresses/{addressId}/default-billing
   */
  async setDefaultBilling(addressId: number | string): Promise<AddressResponseDTO> {
    try {
      const response = await apiAxios.patch<AddressResponseDTO>(
        API_ENDPOINTS.ADDRESSES.DEFAULT_BILLING(addressId)
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
