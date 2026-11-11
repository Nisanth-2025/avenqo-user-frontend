export type AddressLabel = 'HOME' | 'WORK' | 'OTHER';

export interface AddressResponseDTO {
  id: number;
  label: AddressLabel;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
  defaultShipping: boolean;
  defaultBilling: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressRequestDTO {
  label: AddressLabel;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  country: 'INDIA';
  pincode: string;
}

export interface UpdateAddressRequestDTO {
  label?: AddressLabel;
  recipientName?: string;
  recipientPhone?: string;
  line1?: string;
  line2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}
