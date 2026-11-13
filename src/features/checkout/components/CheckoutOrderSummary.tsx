import React from 'react';
import { ArrowLeft, LockKeyhole, PackageCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import type { CheckoutOrder, CheckoutSummaryItem } from '../../../types/checkout.types';

interface SecondaryAction {
  label: string;
  isLoading?: boolean;
  onClick: () => void;
}

interface CheckoutOrderSummaryProps {
  items: CheckoutSummaryItem[];
  order: CheckoutOrder | null;
  estimatedTotal: number;
  isLoading: boolean;
  disabled: boolean;
  actionLabel: string;
  onAction: () => void;
  secondaryAction?: SecondaryAction;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  items,
  order,
  estimatedTotal,
  isLoading,
  disabled,
  actionLabel,
  onAction,
  secondaryAction,
}) => {
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = order?.subtotal ?? estimatedTotal;
  const total = order?.totalAmount ?? estimatedTotal;

  return (
    <aside className="rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] sm:p-5 lg:sticky lg:top-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2563EB]">Your order</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-neutral-950">Order summary</h2>
        </div>
        <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
          <PackageCheck className="size-5" aria-hidden="true" />
        </span>
      </div>

      {order?.orderNumber && (
        <p className="mt-3 rounded-xl bg-blue-50/70 px-3 py-2 text-xs text-blue-800">
          Order <span className="font-semibold">{order.orderNumber}</span>
        </p>
      )}

      <div className="mt-4 max-h-64 overflow-y-auto border-y border-neutral-100 py-3">
        {items.length === 0 ? (
          <p className="py-4 text-center text-xs text-neutral-500" role="status">Loading your cart details…</p>
        ) : items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 py-2">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="size-12 shrink-0 rounded-xl bg-neutral-100 object-cover" />
            ) : (
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-[10px] text-neutral-400" aria-hidden="true">
                No image
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-neutral-800">{item.name}</p>
              <p className="mt-0.5 text-[11px] text-neutral-500">Qty {item.quantity}</p>
            </div>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-neutral-900">{formatPrice(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between py-3 text-xs text-neutral-600">
        <span>Items ({itemCount})</span>
        <span className="font-medium tabular-nums text-neutral-900">{formatPrice(subtotal)}</span>
      </div>
      {order ? (
        <>
          <div className="flex items-center justify-between border-t border-neutral-100 py-3 text-xs text-neutral-600">
            <span>Shipping</span>
            <span className="font-medium tabular-nums text-neutral-900">{formatPrice(order.shippingFee)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex items-center justify-between border-t border-neutral-100 py-3 text-xs text-neutral-600">
              <span>Discount</span>
              <span className="font-medium tabular-nums text-emerald-700">−{formatPrice(order.discountAmount)}</span>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between border-t border-neutral-100 py-3 text-xs text-neutral-600">
          <span>Shipping</span>
          <span className="text-[11px] text-neutral-500">Confirmed at checkout</span>
        </div>
      )}
      <div className="flex items-end justify-between border-t border-neutral-200 pt-3">
        <div>
          <p className="text-sm font-semibold text-neutral-950">{order ? 'Order total' : 'Estimated total'}</p>
          <p className="mt-0.5 text-[10px] text-neutral-500">{order ? 'Set by Avenquo' : 'Finalized by Avenquo'}</p>
        </div>
        <span className="text-xl font-bold tracking-tight tabular-nums text-neutral-950">{formatPrice(total)}</span>
      </div>

      <Button
        type="button"
        size="md"
        fullWidth
        disabled={disabled}
        isLoading={isLoading}
        onClick={onAction}
        className="mt-5 min-h-12 rounded-2xl text-sm font-semibold"
      >
        {!isLoading && <LockKeyhole className="size-4" aria-hidden="true" />}
        {actionLabel}
      </Button>

      {secondaryAction && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          fullWidth
          isLoading={secondaryAction.isLoading}
          onClick={secondaryAction.onClick}
          className="mt-2 min-h-10 rounded-xl"
        >
          {secondaryAction.label}
        </Button>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] leading-relaxed text-neutral-500">
        <LockKeyhole className="size-3 shrink-0" aria-hidden="true" />
        Payment is confirmed securely by Avenquo before your order is marked complete.
      </p>
      <Link to="/cart" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-neutral-500 transition hover:text-[#2563EB] focus-visible:outline-none focus-visible:underline">
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to cart
      </Link>
    </aside>
  );
};
