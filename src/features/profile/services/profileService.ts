import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import {
  UserProfileDTO,
  UserAccountDTO,
  GenderType,
} from '../../../types/profile.types';

export const profileService = {
  /**
   * Read signed-in user's profile.
   * GET /api/v1/user/profile
   */
  async getProfile(): Promise<UserProfileDTO> {
    try {
      const response = await apiAxios.get<UserProfileDTO>(API_ENDPOINTS.USER_PROFILE.BASE);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Read signed-in user's account details.
   * GET /api/v1/user/profile/account
   */
  async getAccount(): Promise<UserAccountDTO> {
    try {
      const response = await apiAxios.get<UserAccountDTO>(API_ENDPOINTS.USER_PROFILE.ACCOUNT);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update first name.
   * PATCH /api/v1/user/profile/first-name
   */
  async updateFirstName(name: string): Promise<{ firstName: string }> {
    try {
      const response = await apiAxios.patch<{ firstName: string }>(
        API_ENDPOINTS.USER_PROFILE.FIRST_NAME,
        { name }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update last name.
   * PATCH /api/v1/user/profile/last-name
   */
  async updateLastName(name: string): Promise<{ lastName: string }> {
    try {
      const response = await apiAxios.patch<{ lastName: string }>(
        API_ENDPOINTS.USER_PROFILE.LAST_NAME,
        { name }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update username.
   * PATCH /api/v1/user/profile/username
   */
  async updateUsername(username: string): Promise<{ username: string }> {
    try {
      const response = await apiAxios.patch<{ username: string }>(
        API_ENDPOINTS.USER_PROFILE.USERNAME,
        { username }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update date of birth.
   * PATCH /api/v1/user/profile/date-of-birth
   */
  async updateDateOfBirth(dateOfBirth: string): Promise<{ dateOfBirth: string }> {
    try {
      const response = await apiAxios.patch<{ dateOfBirth: string }>(
        API_ENDPOINTS.USER_PROFILE.DATE_OF_BIRTH,
        { dateOfBirth }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update gender.
   * PATCH /api/v1/user/profile/gender
   */
  async updateGender(gender: GenderType): Promise<{ gender: string }> {
    try {
      const response = await apiAxios.patch<{ gender: string }>(
        API_ENDPOINTS.USER_PROFILE.GENDER,
        { gender }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Update phone number (+91XXXXXXXXXX).
   * PATCH /api/v1/user/profile/phone
   */
  async updatePhone(phone: string): Promise<{ phone: string }> {
    try {
      const response = await apiAxios.patch<{ phone: string }>(
        API_ENDPOINTS.USER_PROFILE.PHONE,
        { phone }
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Upload / replace profile photo.
   * PATCH /api/v1/user/profile/image
   */
  async uploadProfileImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiAxios.patch<string>(
        API_ENDPOINTS.USER_PROFILE.IMAGE,
        formData
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  /**
   * Delete profile photo.
   * DELETE /api/v1/user/profile/image
   */
  async deleteProfileImage(): Promise<string> {
    try {
      const response = await apiAxios.delete<string>(
        API_ENDPOINTS.USER_PROFILE.IMAGE
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
