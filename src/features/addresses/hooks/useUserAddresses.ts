import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '../services/addressService';
import {
  CreateAddressRequestDTO,
  UpdateAddressRequestDTO,
} from '../../../types/address.types';

export const USER_ADDRESSES_QUERY_KEY = ['user', 'addresses'];

export function useUserAddresses() {
  const queryClient = useQueryClient();

  const addressesQuery = useQuery({
    queryKey: USER_ADDRESSES_QUERY_KEY,
    queryFn: () => addressService.listAddresses(),
    staleTime: 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: USER_ADDRESSES_QUERY_KEY });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateAddressRequestDTO) => addressService.createAddress(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      addressId,
      data,
    }: {
      addressId: number | string;
      data: UpdateAddressRequestDTO;
    }) => addressService.updateAddress(addressId, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (addressId: number | string) => addressService.deleteAddress(addressId),
    onSuccess: invalidate,
  });

  const setDefaultShippingMutation = useMutation({
    mutationFn: (addressId: number | string) => addressService.setDefaultShipping(addressId),
    onSuccess: invalidate,
  });

  const setDefaultBillingMutation = useMutation({
    mutationFn: (addressId: number | string) => addressService.setDefaultBilling(addressId),
    onSuccess: invalidate,
  });

  const addresses = addressesQuery.data || [];
  const count = addresses.length;
  const isLimitReached = count >= 5;

  return {
    addresses,
    count,
    isLimitReached,
    isLoading: addressesQuery.isLoading,
    isError: addressesQuery.isError,
    error: addressesQuery.error,
    refetch: addressesQuery.refetch,
    createMutation,
    updateMutation,
    deleteMutation,
    setDefaultShippingMutation,
    setDefaultBillingMutation,
  };
}
