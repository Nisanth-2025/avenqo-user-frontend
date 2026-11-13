import React from 'react';
import { BriefcaseBusiness, Check, Home, MapPin } from 'lucide-react';
import type { AddressResponseDTO } from '../../../types/address.types';

interface CheckoutAddressCardProps {
  address: AddressResponseDTO;
  selected: boolean;
  disabled?: boolean;
  onSelect: (addressId: number) => void;
}

export const CheckoutAddressCard: React.FC<CheckoutAddressCardProps> = ({
  address,
  selected,
  disabled = false,
  onSelect,
}) => {
  const AddressIcon = address.label === 'WORK' ? BriefcaseBusiness : address.label === 'HOME' ? Home : MapPin;
  const addressId = `checkout-address-${address.id}`;

  return (
    <label htmlFor={addressId} className={`block ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        id={addressId}
        type="radio"
        name="delivery-address"
        value={address.id}
        checked={selected}
        onChange={() => onSelect(address.id)}
        disabled={disabled}
        className="peer sr-only"
      />
      <div
        className={`rounded-2xl border p-4 transition duration-200 peer-focus-visible:ring-2 peer-focus-visible:ring-[#2563EB] peer-focus-visible:ring-offset-2 ${
          selected
            ? 'border-blue-500 bg-blue-50/50 shadow-[0_4px_18px_rgba(37,99,235,0.08)]'
            : 'border-neutral-200 bg-white hover:border-blue-200 hover:bg-blue-50/20'
        } ${disabled ? 'opacity-80' : ''}`}
      >
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-blue-100 text-[#2563EB]' : 'bg-neutral-100 text-neutral-500'}`}>
            <AddressIcon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-neutral-900">{address.label}</span>
              {address.defaultShipping && (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  Default
                </span>
              )}
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
          <span className={`mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-neutral-300 bg-white text-transparent'}`}>
            {selected && <Check className="size-3" aria-hidden="true" />}
          </span>
        </div>
      </div>
    </label>
  );
};
