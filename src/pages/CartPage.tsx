import React, { useState } from 'react';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { UserNavbar } from '../components/navigation/UserNavbar';
import { CartEmptyState } from '../features/cart/components/CartEmptyState';
import { CartItemRow } from '../features/cart/components/CartItemRow';
import { CartOrderSummary } from '../features/cart/components/CartOrderSummary';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useSetCartItemQuantity,
} from '../features/cart/hooks/useCart';
import type { CartItemDTO } from '../types/cart.types';

export const CartPage: React.FC = () => {
  const cartQuery = useCart();
  const updateQuantity = useSetCartItemQuantity();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const cart = cartQuery.data;
  const items = cart?.cartItems ?? [];
  const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);
  const isMutating = updateQuantity.isPending || removeItem.isPending || clearCart.isPending;

  const handleQuantityChange = (item: CartItemDTO, quantity: number) => {
    setActionError(null);
    updateQuantity.mutate(
      { productId: item.productId, quantity },
      { onError: (error) => setActionError(error.message) },
    );
  };

  const handleRemove = (item: CartItemDTO) => {
    setActionError(null);
    removeItem.mutate(item.productId, {
      onError: (error) => setActionError(error.message),
    });
  };

  const handleClearCart = () => {
    setActionError(null);
    clearCart.mutate(undefined, {
      onSuccess: () => setConfirmClear(false),
      onError: (error) => setActionError(error.message),
    });
  };

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-neutral-950">
      <UserNavbar showSearch={false} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 sm:px-8 sm:pb-12 sm:pt-10">
        <div className="mb-6 flex items-end justify-between gap-3 sm:mb-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">Your selection</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Your cart</h1>
            {!cartQuery.isPending && !cartQuery.isError && (
              <p className="mt-1 text-xs text-neutral-500">
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}
              </p>
            )}
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              disabled={isMutating}
              className="mb-0.5 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-500 transition hover:bg-blue-50 hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:opacity-50"
            >
              Clear cart
            </button>
          )}
        </div>

        {actionError && (
          <div className="mb-4" role="alert">
            <Alert type="error" message={actionError} onDismiss={() => setActionError(null)} />
          </div>
        )}
        {cartQuery.isError && cart && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2" role="alert">
            <Alert type="error" message={`Could not refresh your cart: ${cartQuery.error.message}`} />
            <Button variant="secondary" size="sm" onClick={() => void cartQuery.refetch()}>Retry</Button>
          </div>
        )}

        {confirmClear && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3" role="group" aria-label="Confirm clearing cart">
            <p className="text-sm text-blue-900">Remove every item from your cart?</p>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" disabled={clearCart.isPending} onClick={() => setConfirmClear(false)}>
                Keep items
              </Button>
              <Button size="sm" isLoading={clearCart.isPending} onClick={handleClearCart}>
                Clear cart
              </Button>
            </div>
          </div>
        )}

        {cartQuery.isPending ? (
          <div className="grid gap-3" aria-label="Loading cart" aria-busy="true">
            {[0, 1].map((index) => (
              <div key={index} className="flex animate-pulse gap-3 rounded-2xl border border-neutral-200 bg-white p-3">
                <div className="size-[76px] shrink-0 rounded-xl bg-neutral-100" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <div className="h-3 w-3/4 rounded bg-neutral-100" />
                  <div className="h-3 w-1/3 rounded bg-neutral-100" />
                  <div className="mt-auto h-7 w-24 rounded-lg bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : cartQuery.isError && !cart ? (
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-center">
            <Alert type="error" message={cartQuery.error.message || 'Your cart could not be loaded.'} />
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => void cartQuery.refetch()}>
              Try again
            </Button>
          </section>
        ) : items.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
            <section className="flex flex-col gap-3" aria-label="Cart items">
              {items.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  disabled={isMutating}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </section>

            <CartOrderSummary total={cart?.totalCartPrice ?? 0} />
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
