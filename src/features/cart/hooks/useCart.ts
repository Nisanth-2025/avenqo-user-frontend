import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/hooks/useAuth';
import type { CartDTO, CartProductQuantityInput } from '../../../types/cart.types';
import { cartService } from '../services/cartService';

export const CART_QUERY_KEY = ['cart'] as const;

function getCartQueryKey(userId?: string | number, email?: string) {
  return [...CART_QUERY_KEY, userId ?? email ?? 'current-user'] as const;
}

export function useCart() {
  const { user, isAuthenticated } = useAuth();
  const queryKey = getCartQueryKey(user?.userId, user?.email);

  return useQuery({
    queryKey,
    queryFn: cartService.getCart,
    enabled: isAuthenticated,
    staleTime: 15_000,
    refetchOnMount: true,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = getCartQueryKey(user?.userId, user?.email);

  return useMutation<CartDTO, Error, CartProductQuantityInput>({
    mutationFn: ({ productId, quantity }) => cartService.addProduct(productId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKey, cart);
    },
  });
}

export function useSetCartItemQuantity() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = getCartQueryKey(user?.userId, user?.email);

  return useMutation<CartDTO, Error, CartProductQuantityInput>({
    mutationFn: ({ productId, quantity }) =>
      cartService.setProductQuantity(productId, quantity),
    onSuccess: (cart) => {
      queryClient.setQueryData(queryKey, cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = getCartQueryKey(user?.userId, user?.email);

  return useMutation<void, Error, number>({
    mutationFn: cartService.removeProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const queryKey = getCartQueryKey(user?.userId, user?.email);

  return useMutation<void, Error, void>({
    mutationFn: cartService.clearCart,
    onSuccess: async () => {
      queryClient.setQueryData<CartDTO>(queryKey, {
        cartId: null,
        cartItems: [],
        totalCartPrice: 0,
      });
      await queryClient.invalidateQueries({ queryKey });
    },
  });
}
