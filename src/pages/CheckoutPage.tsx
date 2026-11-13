import React, { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, CircleAlert, CreditCard, MapPin, ShieldCheck } from 'lucide-react';
import { ApiClientError } from '../api/client';
import { UserNavbar } from '../components/navigation/UserNavbar';
import { Button } from '../components/ui/Button';
import { CartEmptyState } from '../features/cart/components/CartEmptyState';
import { CART_QUERY_KEY, useCart } from '../features/cart/hooks/useCart';
import { useUserAddresses } from '../features/addresses/hooks/useUserAddresses';
import { CheckoutAddressCard } from '../features/checkout/components/CheckoutAddressCard';
import { CheckoutAddressSnapshot } from '../features/checkout/components/CheckoutAddressSnapshot';
import { CheckoutOrderSummary } from '../features/checkout/components/CheckoutOrderSummary';
import { CheckoutSuccess } from '../features/checkout/components/CheckoutSuccess';
import { checkoutService } from '../features/checkout/services/checkoutService';
import {
  openRazorpayCheckout,
  type RazorpayPaymentResult,
} from '../features/checkout/services/razorpayCheckout';
import type {
  CheckoutOrder,
  CheckoutSummaryItem,
} from '../types/checkout.types';

interface FlowMessage {
  tone: 'error' | 'info';
  message: string;
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

export const CheckoutPage: React.FC = () => {
  const queryClient = useQueryClient();
  const cartQuery = useCart();
  const {
    addresses,
    isLoading: addressesLoading,
    isError: addressesError,
    error: addressError,
    refetch: refetchAddresses,
  } = useUserAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const orderRef = useRef<CheckoutOrder | null>(null);
  const paymentBusyRef = useRef(false);
  const verificationBusyRef = useRef(false);
  const [pendingVerification, setPendingVerification] = useState<RazorpayPaymentResult | null>(null);
  const [flowMessage, setFlowMessage] = useState<FlowMessage | null>(null);
  const [isGatewayOpening, setIsGatewayOpening] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNumber: string; totalAmount: number } | null>(null);

  const createOrderMutation = useMutation({
    mutationFn: checkoutService.createOrder,
    onError: (error) => {
      if (error instanceof ApiClientError && error.status === 400) {
        void cartQuery.refetch();
      }
    },
  });
  const initiatePaymentMutation = useMutation({ mutationFn: checkoutService.initiatePayment });
  const verifyPaymentMutation = useMutation({ mutationFn: checkoutService.verifyPayment });

  const cart = cartQuery.data;
  const cartItems = cart?.cartItems ?? [];
  const defaultAddress = addresses.find((address) => address.defaultShipping) ?? addresses[0];
  const activeAddressId = selectedAddressId ?? defaultAddress?.id ?? null;
  const selectedAddress = addresses.find((address) => address.id === activeAddressId) ?? null;
  const isStartingPayment = createOrderMutation.isPending || initiatePaymentMutation.isPending || isGatewayOpening;

  const orderItems: CheckoutSummaryItem[] = order
    ? order.sellerOrders.flatMap((sellerOrder) =>
        sellerOrder.items.map((item) => ({
          id: item.orderItemId,
          name: item.productName,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          subtotal: item.subtotal,
        })),
      )
    : cartItems.map((item) => ({
        id: item.cartItemId,
        name: item.productName,
        imageUrl: item.image,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

  const verifyGatewayPayment = async (
    result: RazorpayPaymentResult,
    activeOrder: CheckoutOrder,
  ) => {
    if (verificationBusyRef.current) return;
    if (!result.razorpay_order_id || !result.razorpay_payment_id || !result.razorpay_signature) {
      setFlowMessage({
        tone: 'error',
        message: 'The payment provider returned incomplete details. Your order has not been marked paid.',
      });
      return;
    }

    verificationBusyRef.current = true;
    setPendingVerification(result);
    setFlowMessage(null);

    try {
      const verification = await verifyPaymentMutation.mutateAsync({
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      });
      if (verification.paymentStatus === 'CAPTURED' && verification.orderStatus === 'CONFIRMED') {
        setPendingVerification(null);
        setConfirmedOrder({
          orderNumber: verification.orderNumber || activeOrder.orderNumber,
          totalAmount: activeOrder.totalAmount,
        });
        setFlowMessage(null);
        await queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      } else if (verification.paymentStatus === 'CAPTURED' || verification.orderStatus === 'CONFIRMED') {
        setPendingVerification(result);
        setFlowMessage({
          tone: 'info',
          message: 'Avenquo has received the payment response but has not fully confirmed the order. Do not pay again; retry verification below.',
        });
      } else {
        setPendingVerification(null);
        setFlowMessage({
          tone: 'info',
          message: `Payment is ${verification.paymentStatus.toLowerCase()} and the order is not confirmed yet. You can retry payment for this order.`,
        });
      }
    } catch {
      setPendingVerification(result);
      setFlowMessage({
        tone: 'error',
        message: 'We could not verify the payment yet. Your order is not marked paid. Retry verification before starting another payment.',
      });
    } finally {
      verificationBusyRef.current = false;
    }
  };

  const handleStartPayment = async () => {
    if (paymentBusyRef.current || pendingVerification || isGatewayOpen) return;
    if (!orderRef.current && !activeAddressId) {
      setFlowMessage({ tone: 'error', message: 'Choose a saved delivery address to continue.' });
      return;
    }

    paymentBusyRef.current = true;
    setFlowMessage(null);
    try {
      let activeOrder = orderRef.current;
      if (!activeOrder) {
        activeOrder = await createOrderMutation.mutateAsync(activeAddressId as number);
        orderRef.current = activeOrder;
        setOrder(activeOrder);
      }

      if (activeOrder.orderStatus !== 'PENDING_PAYMENT') {
        throw new Error('This order is no longer awaiting payment. Please return to your cart and start a new checkout.');
      }

      const payment = await initiatePaymentMutation.mutateAsync(activeOrder.orderId);
      if (
        payment.orderId !== activeOrder.orderId ||
        !payment.keyId ||
        !payment.razorpayOrderId ||
        !Number.isSafeInteger(payment.amount) ||
        payment.amount <= 0 ||
        payment.currency !== 'INR'
      ) {
        throw new Error('Avenquo returned invalid payment details. Please try again.');
      }

      setIsGatewayOpening(true);
      await openRazorpayCheckout({
        payment,
        orderNumber: activeOrder.orderNumber,
        recipientName: activeOrder.shippingAddress.recipientName,
        recipientPhone: activeOrder.shippingAddress.recipientPhone,
        onOpen: () => setIsGatewayOpen(true),
        onSuccess: (result) => {
          setIsGatewayOpen(false);
          void verifyGatewayPayment(result, activeOrder);
        },
        onDismiss: () => {
          setIsGatewayOpen(false);
          setFlowMessage({
            tone: 'info',
            message: 'Payment checkout was closed. Your order is still pending, and you can safely try again.',
          });
        },
        onFailure: () => {
          setIsGatewayOpen(false);
          setFlowMessage({
            tone: 'error',
            message: 'The payment was not completed. Your order is still pending; you can retry securely.',
          });
        },
      });
    } catch (error) {
      setIsGatewayOpen(false);
      setFlowMessage({
        tone: 'error',
        message: errorMessage(error, 'Checkout could not be started. Please try again.'),
      });
    } finally {
      setIsGatewayOpening(false);
      paymentBusyRef.current = false;
    }
  };

  const handleRetryVerification = () => {
    if (pendingVerification && order) {
      void verifyGatewayPayment(pendingVerification, order);
    }
  };

  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] text-neutral-950">
        <UserNavbar showSearch={false} />
        <CheckoutSuccess orderNumber={confirmedOrder.orderNumber} totalAmount={confirmedOrder.totalAmount} />
      </div>
    );
  }

  if (cartQuery.isError && !cart) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] text-neutral-950">
        <UserNavbar showSearch={false} />
        <main className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
          <div className="rounded-3xl border border-red-100 bg-white p-6 text-center shadow-sm" role="alert">
            <CircleAlert className="mx-auto size-8 text-red-500" aria-hidden="true" />
            <h1 className="mt-3 text-lg font-semibold">Your cart could not be loaded</h1>
            <p className="mt-2 text-sm text-neutral-600">{cartQuery.error.message || 'Please try again.'}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => void cartQuery.refetch()}>
              Retry
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (!cartQuery.isPending && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#fbfaf8] text-neutral-950">
        <UserNavbar showSearch={false} />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
          <CartEmptyState />
        </main>
      </div>
    );
  }

  const hasSavedAddresses = addresses.length > 0;
  const canSubmit = Boolean(
    order || (cart && !cartQuery.isError && !addressesError && selectedAddress && cartItems.length > 0),
  );
  const actionDisabled = !canSubmit || isStartingPayment || isGatewayOpen || Boolean(pendingVerification);
  const actionLabel = isGatewayOpen
    ? 'Complete payment in the secure window'
    : order
      ? 'Retry secure payment'
      : 'Place order & pay securely';

  return (
    <div className="min-h-screen bg-[#fbfaf8] text-neutral-950">
      <UserNavbar showSearch={false} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-36 pt-6 sm:px-8 sm:pb-14 sm:pt-9">
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-[#2563EB] focus-visible:outline-none focus-visible:underline">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to cart
        </Link>

        <header className="mt-5 flex flex-col gap-5 border-b border-neutral-200 pb-6 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">Avenquo secure checkout</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">Delivery & payment</h1>
            <p className="mt-2 max-w-lg text-sm leading-relaxed text-neutral-600">
              Confirm your delivery address. Your order total is calculated by Avenquo from current prices and stock.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start rounded-full border border-blue-100 bg-white px-3 py-2 text-[11px] font-medium text-blue-800 sm:self-auto">
            <ShieldCheck className="size-4 text-[#2563EB]" aria-hidden="true" />
            Secure payment verification
          </div>
        </header>

        <div className="mt-5 flex items-center gap-2 text-xs sm:mt-6">
          <span className={`flex size-7 items-center justify-center rounded-full text-[11px] font-semibold ${order ? 'bg-blue-100 text-blue-700' : 'bg-[#2563EB] text-white'}`}>
            {order ? <Check className="size-3.5" aria-hidden="true" /> : '1'}
          </span>
          <span className={order ? 'text-neutral-500' : 'font-semibold text-neutral-900'}>Delivery</span>
          <span className="h-px w-8 bg-neutral-300 sm:w-12" />
          <span className={`flex size-7 items-center justify-center rounded-full text-[11px] font-semibold ${order ? 'bg-[#2563EB] text-white' : 'bg-neutral-200 text-neutral-500'}`}>2</span>
          <span className={order ? 'font-semibold text-neutral-900' : 'text-neutral-500'}>Payment</span>
        </div>

        {flowMessage && (
          <div
            className={`mt-5 flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
              flowMessage.tone === 'error'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-blue-200 bg-blue-50 text-blue-900'
            }`}
            role={flowMessage.tone === 'error' ? 'alert' : 'status'}
            aria-live="polite"
          >
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">{flowMessage.message}</p>
          </div>
        )}

        {cartQuery.isError && cart && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900" role="status">
            <span>Showing your last loaded cart. Refresh it before continuing.</span>
            <Button variant="secondary" size="sm" onClick={() => void cartQuery.refetch()}>Refresh cart</Button>
          </div>
        )}

        <div className="mt-5 grid items-start gap-5 lg:mt-7 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <section className="rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-[0_8px_28px_rgba(15,23,42,0.035)] sm:p-6" aria-labelledby="delivery-address-heading">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <h2 id="delivery-address-heading" className="mt-3 text-lg font-semibold tracking-tight">Delivery address</h2>
                <p className="mt-1 text-xs text-neutral-500">Choose a saved address for this order.</p>
              </div>
              {!order && (
                <Link to="/addresses" className="shrink-0 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2563EB] transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]">
                  Manage addresses
                </Link>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {order ? (
                <CheckoutAddressSnapshot address={order.shippingAddress} />
              ) : addressesLoading ? (
                <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading saved addresses">
                  {[0, 1].map((item) => (
                    <div key={item} className="flex animate-pulse gap-3 rounded-2xl border border-neutral-200 p-4">
                      <span className="size-10 rounded-xl bg-neutral-100" />
                      <span className="flex-1">
                        <span className="block h-3 w-24 rounded bg-neutral-100" />
                        <span className="mt-3 block h-3 w-3/4 rounded bg-neutral-100" />
                        <span className="mt-2 block h-3 w-1/2 rounded bg-neutral-100" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : addressesError ? (
                <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800" role="alert">
                  <p>{errorMessage(addressError, 'Saved addresses could not be loaded.')}</p>
                  <Button variant="secondary" size="sm" className="mt-3" onClick={() => void refetchAddresses()}>
                    Retry
                  </Button>
                </div>
              ) : hasSavedAddresses ? (
                addresses.map((address) => (
                  <CheckoutAddressCard
                    key={address.id}
                    address={address}
                    selected={address.id === activeAddressId}
                    disabled={createOrderMutation.isPending}
                    onSelect={setSelectedAddressId}
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-[#fbfaf8] px-4 py-6 text-center">
                  <MapPin className="mx-auto size-6 text-neutral-400" aria-hidden="true" />
                  <p className="mt-2 text-sm font-semibold text-neutral-800">Add a delivery address</p>
                  <p className="mt-1 text-xs text-neutral-500">Checkout uses one of your saved addresses.</p>
                  <Link to="/addresses" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-[#2563EB] px-4 text-xs font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2">
                    Add an address
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-start gap-2 rounded-2xl bg-[#fbfaf8] p-3 text-[11px] leading-relaxed text-neutral-500">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-[#2563EB]" aria-hidden="true" />
              The selected address is verified by Avenquo and saved as an order snapshot.
            </div>
          </section>

          <CheckoutOrderSummary
            items={orderItems}
            order={order}
            estimatedTotal={cart?.totalCartPrice ?? 0}
            isLoading={isStartingPayment}
            disabled={actionDisabled}
            actionLabel={actionLabel}
            onAction={() => void handleStartPayment()}
            secondaryAction={pendingVerification ? {
              label: 'Retry payment verification',
              isLoading: verifyPaymentMutation.isPending,
              onClick: handleRetryVerification,
            } : undefined}
          />
        </div>

        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-neutral-500">
          <CreditCard className="size-3.5" aria-hidden="true" />
          Card, UPI, net banking and other methods are presented by Razorpay Checkout.
        </div>
      </main>
    </div>
  );
};

export default CheckoutPage;
