import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserNavbar } from '../components/navigation/UserNavbar';
import { useUserAddresses } from '../features/addresses/hooks/useUserAddresses';
import {
  AddressResponseDTO,
  CreateAddressRequestDTO,
  UpdateAddressRequestDTO,
  AddressLabel,
} from '../types/address.types';
import { ApiClientError } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Alert } from '../components/ui/Alert';
import {
  ArrowLeft,
  MapPin,
  PlusCircle,
  Edit2,
  Trash2,
  Home,
  Briefcase,
  Building,
  Phone,
  User,
  X,
  Truck,
  CreditCard,
  AlertCircle,
} from 'lucide-react';

// Form Validation Schema
const addressSchema = z.object({
  label: z.enum(['HOME', 'WORK', 'OTHER'], {
    required_error: 'Please select an address label',
  }),
  recipientName: z
    .string()
    .min(1, 'Recipient name is required')
    .max(30, 'Name cannot exceed 30 characters'),
  phone10: z
    .string()
    .regex(/^[1-9]\d{9}$/, 'Must be a 10-digit Indian phone number starting with 1-9'),
  line1: z
    .string()
    .min(1, 'Flat, house no., or building is required')
    .max(255, 'Line 1 cannot exceed 255 characters'),
  line2: z
    .string()
    .max(255, 'Line 2 cannot exceed 255 characters')
    .optional()
    .or(z.literal('')),
  landmark: z
    .string()
    .max(30, 'Landmark cannot exceed 30 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(1, 'City is required')
    .max(25, 'City cannot exceed 25 characters'),
  state: z
    .string()
    .min(1, 'State is required')
    .max(25, 'State cannot exceed 25 characters'),
  country: z.literal('INDIA'),
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .max(6, 'Pincode cannot exceed 6 characters'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export const UserAddressesPage: React.FC = () => {
  const {
    addresses,
    count,
    isLimitReached,
    isLoading,
    isError,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
    setDefaultShippingMutation,
    setDefaultBillingMutation,
  } = useUserAddresses();

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<AddressResponseDTO | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<AddressResponseDTO | null>(null);

  // Notice alert
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'HOME',
      recipientName: '',
      phone10: '',
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      country: 'INDIA',
      pincode: '',
    },
  });

  const openCreateModal = () => {
    setAddressToEdit(null);
    setFormError(null);
    reset({
      label: 'HOME',
      recipientName: '',
      phone10: '',
      line1: '',
      line2: '',
      landmark: '',
      city: '',
      state: '',
      country: 'INDIA',
      pincode: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr: AddressResponseDTO) => {
    setAddressToEdit(addr);
    setFormError(null);
    const raw = addr.recipientPhone || '';
    const digits = raw.startsWith('+91') ? raw.slice(3) : raw;
    reset({
      label: addr.label,
      recipientName: addr.recipientName,
      phone10: digits,
      line1: addr.line1,
      line2: addr.line2 || '',
      landmark: addr.landmark || '',
      city: addr.city,
      state: addr.state,
      country: 'INDIA',
      pincode: addr.pincode,
    });
    setIsModalOpen(true);
  };

  const onSubmitForm = async (values: AddressFormValues) => {
    setFormError(null);
    const formattedPhone = `+91${values.phone10.trim()}`;

    try {
      if (addressToEdit) {
        // Update
        const payload: UpdateAddressRequestDTO = {
          label: values.label,
          recipientName: values.recipientName.trim(),
          recipientPhone: formattedPhone,
          line1: values.line1.trim(),
          line2: values.line2?.trim() || undefined,
          landmark: values.landmark?.trim() || undefined,
          city: values.city.trim(),
          state: values.state.trim(),
          country: 'INDIA',
          pincode: values.pincode.trim(),
        };

        await updateMutation.mutateAsync({
          addressId: addressToEdit.id,
          data: payload,
        });

        setNotice({ type: 'success', message: 'Address updated successfully.' });
      } else {
        // Create
        const payload: CreateAddressRequestDTO = {
          label: values.label,
          recipientName: values.recipientName.trim(),
          recipientPhone: formattedPhone,
          line1: values.line1.trim(),
          line2: values.line2?.trim() || undefined,
          landmark: values.landmark?.trim() || undefined,
          city: values.city.trim(),
          state: values.state.trim(),
          country: 'INDIA',
          pincode: values.pincode.trim(),
        };

        await createMutation.mutateAsync(payload);
        setNotice({ type: 'success', message: 'New address added successfully.' });
      }

      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof ApiClientError) {
        if (err.fieldErrors) {
          Object.entries(err.fieldErrors).forEach(([field, msg]) => {
            setError(field as keyof AddressFormValues, { message: msg });
          });
        }
        setFormError(err.message);
      } else if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Failed to save address. Please check your inputs.');
      }
    }
  };

  const handleDelete = async () => {
    if (!addressToDelete) return;
    try {
      await deleteMutation.mutateAsync(addressToDelete.id);
      setNotice({ type: 'success', message: 'Address deleted successfully.' });
      setAddressToDelete(null);
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to delete address.',
      });
    }
  };

  const handleSetDefaultShipping = async (id: number) => {
    try {
      await setDefaultShippingMutation.mutateAsync(id);
      setNotice({ type: 'success', message: 'Default shipping address updated.' });
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to set default shipping address.',
      });
    }
  };

  const handleSetDefaultBilling = async (id: number) => {
    try {
      await setDefaultBillingMutation.mutateAsync(id);
      setNotice({ type: 'success', message: 'Default billing address updated.' });
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to set default billing address.',
      });
    }
  };

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending;

  const labelOptions = [
    { value: 'HOME', label: 'Home (Personal)' },
    { value: 'WORK', label: 'Work (Office / Business)' },
    { value: 'OTHER', label: 'Other (Friends, Family, Secondary)' },
  ];

  const getLabelIcon = (label: AddressLabel) => {
    switch (label) {
      case 'HOME':
        return <Home className="h-3.5 w-3.5 text-brand-600" />;
      case 'WORK':
        return <Briefcase className="h-3.5 w-3.5 text-blue-600" />;
      default:
        return <Building className="h-3.5 w-3.5 text-brand-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 pt-8 pb-28 sm:pb-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/home" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">My Addresses</span>
        </div>

        {/* Global Notice Alert */}
        {notice && (
          <Alert variant={notice.type} message={notice.message} onClose={() => setNotice(null)} />
        )}

        {/* Title Header with Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Delivery & Billing Addresses
              </h1>
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                {count} / 5 Saved
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Manage your delivery locations. Each customer can save up to 5 verified addresses.
            </p>
          </div>

          <div>
            <Button
              size="sm"
              disabled={isLimitReached}
              onClick={openCreateModal}
              title={
                isLimitReached
                  ? 'Maximum address limit reached (5/5). Delete an address to add a new one.'
                  : 'Add new address'
              }
            >
              <PlusCircle className="h-4 w-4" /> Add New Address
            </Button>
          </div>
        </div>

        {/* Limit Warning Banner if 5 reached */}
        {isLimitReached && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span>
              You have reached the maximum allowed limit of <strong>5 saved addresses</strong>.
              To add a new address, please remove an unused address.
            </span>
          </div>
        )}

        {/* Address Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse space-y-3"
              >
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-5 w-44 rounded bg-gray-200" />
                <div className="h-14 rounded-xl bg-gray-100" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-900">Failed to load saved addresses</p>
            <p className="text-xs text-red-600">{error?.message || 'Server error occurred.'}</p>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center space-y-4 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mx-auto">
              <MapPin className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No saved addresses yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Add your home or office address for fast, one-click checkout and delivery.
              </p>
            </div>
            <Button size="sm" onClick={openCreateModal}>
              <PlusCircle className="h-4 w-4" /> Add Delivery Address
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`flex flex-col justify-between rounded-3xl border bg-white p-6 shadow-sm transition-all duration-200 ${
                  addr.defaultShipping || addr.defaultBilling
                    ? 'border-brand-300 ring-2 ring-brand-100 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Label & Default Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-700">
                      {getLabelIcon(addr.label)}
                      {addr.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {addr.defaultShipping && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#2563EB] bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold text-white shadow-[0_3px_10px_rgba(37,99,235,0.18)]">
                          <Truck className="h-3 w-3" /> Default Shipping
                        </span>
                      )}
                      {addr.defaultBilling && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                          <CreditCard className="h-3 w-3" /> Default Billing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recipient Info */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      {addr.recipientName}
                    </h3>
                    <p className="text-xs text-gray-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {addr.recipientPhone}
                    </p>
                  </div>

                  {/* Address Lines */}
                  <div className="text-xs text-gray-700 leading-relaxed bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 space-y-0.5">
                    <p className="font-medium text-gray-900">{addr.line1}</p>
                    {addr.line2 && <p className="text-gray-600">{addr.line2}</p>}
                    {addr.landmark && (
                      <p className="text-gray-500 text-[11px]">Landmark: {addr.landmark}</p>
                    )}
                    <p className="font-semibold text-gray-800 pt-1">
                      {addr.city}, {addr.state} – <span className="font-mono">{addr.pincode}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 uppercase tracking-wider">
                      {addr.country}
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
                  {/* Default setting actions */}
                  <div className="flex items-center gap-2 text-[11px]">
                    {!addr.defaultShipping && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultShipping(addr.id)}
                        className="text-brand-600 hover:text-brand-700 font-medium hover:underline"
                      >
                        Make Default Shipping
                      </button>
                    )}
                    {!addr.defaultShipping && !addr.defaultBilling && <span>•</span>}
                    {!addr.defaultBilling && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultBilling(addr.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        Make Default Billing
                      </button>
                    )}
                  </div>

                  {/* Edit & Delete buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openEditModal(addr)}
                      className="text-xs"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setAddressToDelete(addr)}
                      className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Create / Edit Address Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-slide-up flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {addressToEdit ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {addressToEdit
                      ? 'Update recipient and delivery details'
                      : 'Save a new delivery address for fast checkout'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              id="address-form"
              onSubmit={handleSubmit(onSubmitForm)}
              className="p-6 overflow-y-auto space-y-4 flex-1 text-xs"
            >
              {formError && (
                <Alert variant="error" message={formError} onClose={() => setFormError(null)} />
              )}

              {/* Label */}
              <div>
                <Select
                  label="Address Type / Label *"
                  options={labelOptions}
                  error={errors.label?.message}
                  {...register('label')}
                />
              </div>

              {/* Recipient Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Recipient Full Name *"
                    placeholder="e.g. Asha Kumar"
                    error={errors.recipientName?.message}
                    hint="Max 30 characters"
                    {...register('recipientName')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number (+91) *
                  </label>
                  <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-input focus-within:ring-2 focus-within:ring-brand-500">
                    <span className="text-gray-500 font-mono mr-1.5 text-xs">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full bg-transparent text-gray-900 font-mono text-sm focus:outline-none"
                      {...register('phone10')}
                    />
                  </div>
                  {errors.phone10 && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone10.message}</p>
                  )}
                  {!errors.phone10 && (
                    <p className="text-xs text-gray-400 mt-1">10 digits starting with 1-9</p>
                  )}
                </div>
              </div>

              {/* Line 1 */}
              <div>
                <Input
                  label="Flat, House no., Building, Company, Apartment *"
                  placeholder="e.g. 12 Market Road, Apartment 4B"
                  error={errors.line1?.message}
                  hint="Max 255 characters"
                  {...register('line1')}
                />
              </div>

              {/* Line 2 */}
              <div>
                <Input
                  label="Area, Street, Sector, Village (Optional)"
                  placeholder="e.g. Central Market Area"
                  error={errors.line2?.message}
                  hint="Max 255 characters"
                  {...register('line2')}
                />
              </div>

              {/* Landmark */}
              <div>
                <Input
                  label="Landmark (Optional)"
                  placeholder="e.g. Near Metro Station"
                  error={errors.landmark?.message}
                  hint="Max 30 characters"
                  {...register('landmark')}
                />
              </div>

              {/* City, State, Pincode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Input
                    label="City *"
                    placeholder="e.g. Mumbai"
                    error={errors.city?.message}
                    hint="Max 25 characters"
                    {...register('city')}
                  />
                </div>

                <div>
                  <Input
                    label="State *"
                    placeholder="e.g. Maharashtra"
                    error={errors.state?.message}
                    hint="Max 25 characters"
                    {...register('state')}
                  />
                </div>

                <div>
                  <Input
                    label="PIN Code *"
                    placeholder="e.g. 400001"
                    maxLength={6}
                    error={errors.pincode?.message}
                    hint="Max 6 characters"
                    {...register('pincode')}
                  />
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4 bg-gray-50/60">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isFormSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="address-form"
                size="sm"
                loading={isFormSubmitting}
              >
                {addressToEdit ? 'Update Address' : 'Save Address'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 p-6 space-y-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-600">
              <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Address?</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove the address for{' '}
              <strong>{addressToDelete.recipientName}</strong> ({addressToDelete.city})? If this is
              your default shipping/billing address, another saved address will automatically be promoted.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAddressToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete Address
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAddressesPage;
