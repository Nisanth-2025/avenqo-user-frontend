import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';

export const CartEmptyState: React.FC = () => (
  <section className="flex flex-col items-center rounded-3xl border border-neutral-200/80 bg-white px-5 py-12 text-center shadow-[0_6px_22px_rgba(15,23,42,0.035)]">
    <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
      <ShoppingCart className="size-6" strokeWidth={1.7} />
    </span>
    <h2 className="mt-4 text-base font-semibold">Your cart is empty</h2>
    <p className="mt-1 max-w-xs text-xs leading-relaxed text-neutral-500">
      Find something you love and add it here. Your cart stays synced to your account.
    </p>
    <Link
      to="/home"
      className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <ArrowLeft className="size-4" /> Continue shopping
    </Link>
  </section>
);
