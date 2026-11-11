import React from 'react';
import { Link } from 'react-router-dom';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export const CartOrderSummary: React.FC<{ total: number }> = ({ total }) => (
  <aside className="rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.04)] md:sticky md:top-24">
    <h2 className="text-sm font-semibold">Order summary</h2>
    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-4 text-sm">
      <span className="text-neutral-600">Estimated total</span>
      <span className="font-semibold tabular-nums">{formatPrice(total)}</span>
    </div>
    <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
      Prices and stock are current estimates. They will be checked again at checkout.
    </p>
    <Link
      to="/home"
      className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      Continue shopping
    </Link>
  </aside>
);
