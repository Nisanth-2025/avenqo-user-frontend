import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type { CountryDTO, DistrictDTO, StateDTO } from '../../../types/location.types';

export const locationQueryKeys = {
  countries: ['locations', 'countries'] as const,
  states: (countryId: number) => ['locations', 'states', countryId] as const,
  districts: (stateId: number) => ['locations', 'districts', stateId] as const,
};

export const locationService = {
  async listCountries(): Promise<CountryDTO[]> {
    try {
      const response = await apiAxios.get<CountryDTO[]>(API_ENDPOINTS.LOCATIONS.COUNTRIES);
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async listStates(countryId: number): Promise<StateDTO[]> {
    try {
      const response = await apiAxios.get<StateDTO[]>(API_ENDPOINTS.LOCATIONS.STATES(countryId));
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async listDistricts(stateId: number): Promise<DistrictDTO[]> {
    try {
      const response = await apiAxios.get<DistrictDTO[]>(API_ENDPOINTS.LOCATIONS.DISTRICTS(stateId));
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};
