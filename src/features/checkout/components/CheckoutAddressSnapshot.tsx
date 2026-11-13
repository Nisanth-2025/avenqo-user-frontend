import React from 'react';
import { BriefcaseBusiness, Home, MapPin, ShieldCheck } from 'lucide-react';
import type { CheckoutShippingAddress } from '../../../types/checkout.types';

export const CheckoutAddressSnapshot: React.FC<{ address: CheckoutShippingAddress }> = ({ address }) => {
  const AddressIcon = address.label === 'WORK' ? BriefcaseBusiness : address.label === 'HOME' ? Home : MapPin;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#2563EB]">
          <AddressIcon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900">{address.label} address</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              <ShieldCheck className="size-3" aria-hidden="true" />
              Saved to order
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-neutral-800">{address.recipientName}</p>
          <p className="mt-1 text-xs leading-relaxed text-neutral-600">
            {address.line1}{address.line2 ? `, ${address.line2}` : ''}
            {address.landmark ? `, ${address.landmark}` : ''}
            <br />
            {address.city}, {address.state} {address.pincode}
            <br />
            {address.country}
          </p>
          <p className="mt-2 text-xs text-neutral-500">{address.recipientPhone}</p>
        </div>
      </div>
    </div>
  );
};
