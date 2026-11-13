import React from 'react';
import { ArrowRight, CircleCheck, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

interface CheckoutSuccessProps {
  orderNumber: string;
  totalAmount: number;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({ orderNumber, totalAmount }) => (
  <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-4 py-12 sm:px-8">
    <section className="w-full rounded-[2rem] border border-blue-100 bg-white p-6 text-center shadow-[0_18px_55px_rgba(37,99,235,0.1)] sm:p-10">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
        <CircleCheck className="size-9" aria-hidden="true" />
      </span>
      <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">Payment verified</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">Your order is confirmed</h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
        Avenquo confirmed your payment and order. Keep this reference for your records.
      </p>
      <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-neutral-200 bg-[#fbfaf8] p-4 text-left">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="text-neutral-500">Order reference</span>
          <span className="font-semibold text-neutral-900">{orderNumber}</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-neutral-200 pt-3 text-xs">
          <span className="text-neutral-500">Paid</span>
          <span className="font-bold tabular-nums text-neutral-950">{formatPrice(totalAmount)}</span>
        </div>
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-neutral-500">
        <ShieldCheck className="size-3.5 text-[#2563EB]" aria-hidden="true" />
        Payment status verified with Avenquo
      </p>
      <Link
        to="/home"
        className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(37,99,235,0.2)] transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
      >
        Continue shopping
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  </main>
);
