import { useQuery } from '@tanstack/react-query';
import { locationQueryKeys, locationService } from '../services/locationService';

export function useCountries() {
  return useQuery({
    queryKey: locationQueryKeys.countries,
    queryFn: locationService.listCountries,
    staleTime: 30 * 60 * 1000,
  });
}

export function useStates(countryId: string | number | undefined) {
  const parsedId = Number(countryId);
  return useQuery({
    queryKey: locationQueryKeys.states(parsedId),
    queryFn: () => locationService.listStates(parsedId),
    enabled: Number.isSafeInteger(parsedId) && parsedId > 0,
    staleTime: 30 * 60 * 1000,
  });
}

export function useDistricts(stateId: string | number | undefined) {
  const parsedId = Number(stateId);
  return useQuery({
    queryKey: locationQueryKeys.districts(parsedId),
    queryFn: () => locationService.listDistricts(parsedId),
    enabled: Number.isSafeInteger(parsedId) && parsedId > 0,
    staleTime: 30 * 60 * 1000,
  });
}
