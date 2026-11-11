import React from 'react';
import { Minus, PackageOpen, Plus, Trash2 } from 'lucide-react';
import type { CartItemDTO } from '../../../types/cart.types';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

interface CartItemRowProps {
  item: CartItemDTO;
  disabled: boolean;
  onQuantityChange: (item: CartItemDTO, quantity: number) => void;
  onRemove: (item: CartItemDTO) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  disabled,
  onQuantityChange,
  onRemove,
}) => (
  <article className="flex gap-3 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-[0_4px_16px_rgba(15,23,42,0.035)]">
    {item.image ? (
      <img
        src={item.image}
        alt={item.productName}
        className="size-16 shrink-0 rounded-xl bg-neutral-100 object-cover"
        loading="lazy"
      />
    ) : (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]" aria-hidden="true">
        <PackageOpen className="size-6" strokeWidth={1.6} />
      </div>
    )}

    <div className="flex min-w-0 flex-1 flex-col">
      <h2 className="line-clamp-2 text-[13px] font-semibold leading-snug text-neutral-900">{item.productName}</h2>
      <p className="mt-1 text-[11px] text-neutral-500">{formatPrice(item.unitPrice)} each</p>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-2 gap-y-1 pt-2">
        <div className="inline-flex shrink-0 items-center rounded-lg border border-neutral-200" role="group" aria-label={`Quantity for ${item.productName}`}>
          <button
            type="button"
            onClick={() => onQuantityChange(item, item.quantity - 1)}
            disabled={disabled || item.quantity <= 1}
            aria-label={`Decrease ${item.productName} quantity`}
            className="flex size-8 items-center justify-center rounded-l-lg text-neutral-600 transition hover:bg-blue-50 hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="min-w-8 px-1 text-center text-xs font-semibold tabular-nums" aria-live="polite">{item.quantity}</span>
          <button
            type="button"
            onClick={() => onQuantityChange(item, item.quantity + 1)}
            disabled={disabled}
            aria-label={`Increase ${item.productName} quantity`}
            className="flex size-8 items-center justify-center rounded-r-lg text-neutral-600 transition hover:bg-blue-50 hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
        <div className="min-w-0 text-right">
          <p className="text-[13px] font-semibold tabular-nums">{formatPrice(item.subtotal)}</p>
          <button
            type="button"
            onClick={() => onRemove(item)}
            disabled={disabled}
            aria-label={`Remove ${item.productName} from cart`}
            className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-neutral-500 transition hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:opacity-50"
          >
            <Trash2 className="size-3" /> Remove
          </button>
        </div>
      </div>
    </div>
  </article>
);
