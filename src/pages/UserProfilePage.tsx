import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { UserNavbar } from '../components/navigation/UserNavbar';
import { useUserProfile } from '../features/profile/hooks/useUserProfile';
import { GenderType } from '../types/profile.types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import {
  ArrowLeft,
  Camera,
  Trash2,
  User,
  ShieldCheck,
  Mail,
  Check,
  Edit2,
} from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const {
    profile,
    account,
    isLoading,
    isError,
    error,
    refetch,
    updateFirstNameMutation,
    updateLastNameMutation,
    updateUsernameMutation,
    updateDateOfBirthMutation,
    updateGenderMutation,
    updatePhoneMutation,
    uploadImageMutation,
    deleteImageMutation,
  } = useUserProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notice alert
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  // Edit states for fields
  const [editingField, setEditingField] = useState<string | null>(null);

  // Field values
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderType>('PREFER_NOT_TO_SAY');
  const [phoneDigits, setPhoneDigits] = useState('');

  // Start editing a field
  const startEdit = (field: string) => {
    setEditingField(field);
    setNotice(null);
    if (field === 'name') {
      setFirstName(profile?.firstName || '');
      setLastName(profile?.lastName || '');
    } else if (field === 'username') {
      setUsername(profile?.username || '');
    } else if (field === 'dob') {
      setDob(profile?.dateOfBirth || '');
    } else if (field === 'gender') {
      setGender(profile?.gender || 'PREFER_NOT_TO_SAY');
    } else if (field === 'phone') {
      const raw = profile?.phone || '';
      const digits = raw.startsWith('+91') ? raw.slice(3) : raw;
      setPhoneDigits(digits);
    }
  };

  // Save First & Last Name
  const handleSaveName = async () => {
    if (!firstName.trim()) {
      setNotice({ type: 'error', message: 'First name is required (max 30 characters).' });
      return;
    }
    try {
      await updateFirstNameMutation.mutateAsync(firstName.trim());
      if (lastName.trim()) {
        await updateLastNameMutation.mutateAsync(lastName.trim());
      }
      setNotice({ type: 'success', message: 'Name updated successfully.' });
      setEditingField(null);
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update name.',
      });
    }
  };

  // Save Username
  const handleSaveUsername = async () => {
    const val = username.trim();
    if (val.length < 3 || val.length > 20) {
      setNotice({ type: 'error', message: 'Username must be between 3 and 20 characters.' });
      return;
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(val)) {
      setNotice({
        type: 'error',
        message: 'Username can only contain letters, numbers, dot, underscore, and hyphen.',
      });
      return;
    }
    try {
      await updateUsernameMutation.mutateAsync(val);
      setNotice({ type: 'success', message: 'Username updated successfully.' });
      setEditingField(null);
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Username already taken or invalid.',
      });
    }
  };

  // Save Date of Birth
  const handleSaveDob = async () => {
    if (!dob) {
      setNotice({ type: 'error', message: 'Please select a valid date of birth in the past.' });
      return;
    }
    const selectedDate = new Date(dob);
    if (isNaN(selectedDate.getTime()) || selectedDate >= new Date()) {
      setNotice({ type: 'error', message: 'Date of birth must be a past date.' });
      return;
    }
    try {
      await updateDateOfBirthMutation.mutateAsync(dob);
      setNotice({ type: 'success', message: 'Date of birth updated successfully.' });
      setEditingField(null);
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update date of birth.',
      });
    }
  };

  // Save Gender
  const handleSaveGender = async () => {
    try {
      await updateGenderMutation.mutateAsync(gender);
      setNotice({ type: 'success', message: 'Gender updated successfully.' });
      setEditingField(null);
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update gender.',
      });
    }
  };

  // Save Phone
  const handleSavePhone = async () => {
    const digits = phoneDigits.replace(/\D/g, '');
    if (!/^[1-9]\d{9}$/.test(digits)) {
      setNotice({
        type: 'error',
        message: 'Please enter a valid 10-digit Indian phone number (starting with 1-9).',
      });
      return;
    }
    const fullPhone = `+91${digits}`;
    try {
      await updatePhoneMutation.mutateAsync(fullPhone);
      setNotice({ type: 'success', message: 'Phone number updated successfully.' });
      setEditingField(null);
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to update phone number.',
      });
    }
  };

  // Upload Profile Image
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadImageMutation.mutateAsync(file);
      setNotice({ type: 'success', message: 'Profile photo updated successfully.' });
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to upload profile photo.',
      });
    }
  };

  // Delete Profile Image
  const handleDeleteImage = async () => {
    try {
      await deleteImageMutation.mutateAsync();
      setNotice({ type: 'success', message: 'Profile photo removed.' });
    } catch (err: unknown) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to remove photo.',
      });
    }
  };

  const isSaving =
    updateFirstNameMutation.isPending ||
    updateLastNameMutation.isPending ||
    updateUsernameMutation.isPending ||
    updateDateOfBirthMutation.isPending ||
    updateGenderMutation.isPending ||
    updatePhoneMutation.isPending ||
    uploadImageMutation.isPending ||
    deleteImageMutation.isPending;

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName || profile?.username || account?.email?.split('@')[0] || 'User Profile';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UserNavbar />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/home" className="flex items-center gap-1 hover:text-brand-600 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
          </Link>
          <span>/</span>
          <span className="font-semibold text-gray-900">User Profile</span>
        </div>

        {/* Global Notice Alert */}
        {notice && (
          <Alert variant={notice.type} message={notice.message} onClose={() => setNotice(null)} />
        )}

        {isLoading ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-8 animate-pulse space-y-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-gray-200" />
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-gray-200" />
                <div className="h-4 w-28 rounded bg-gray-100" />
              </div>
            </div>
            <div className="h-32 rounded-2xl bg-gray-100" />
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-900">Unable to load profile</p>
            <p className="text-xs text-red-600">{error?.message || 'Server error occurred.'}</p>
            <Button size="sm" variant="secondary" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Avatar & Header Card */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-gradient-to-br from-neutral-500 via-neutral-800 to-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.24),0_8px_20px_rgba(0,0,0,0.2)] font-extrabold text-2xl flex items-center justify-center shadow-md">
                      {profile?.imageUrl ? (
                        <img
                          src={profile.imageUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Camera upload overlay button */}
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 rounded-full bg-brand-600 hover:bg-brand-700 text-white p-2 shadow-md transition-colors"
                      title="Upload photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Name and Basic Data */}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                      {displayName}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      {profile?.username ? (
                        <span className="text-xs font-mono font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                          @{profile.username}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No username set</span>
                      )}
                      <Badge variant="green" size="sm" dot>
                        {account?.accountStatus || 'ACTIVE'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Member since{' '}
                      {account?.createdAt
                        ? new Date(account.createdAt).toLocaleDateString(undefined, {
                            dateStyle: 'medium',
                          })
                        : '—'}
                    </p>
                  </div>
                </div>

                {/* Remove Photo Action if present */}
                {profile?.imageUrl && (
                  <div>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isSaving}
                      onClick={handleDeleteImage}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove Photo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Account Credentials Card (Read-Only) */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs text-gray-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Account Credentials
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Registered Email
                  </span>
                  <p className="font-semibold text-gray-900 text-sm font-mono">
                    {account?.email || '—'}
                  </p>
                  <span className="text-[10px] text-gray-400 block pt-1">
                    Managed by Avenquo Single Sign-On
                  </span>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-1">
                  <span className="text-gray-400 font-medium">User System ID</span>
                  <p className="font-mono font-semibold text-brand-700 text-sm">
                    #{account?.userId || profile?.userId}
                  </p>
                  {account?.lastLoginAt && (
                    <span className="text-[10px] text-gray-400 block pt-1">
                      Last sign-in: {new Date(account.lastLoginAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Information & Profile Fields */}
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs text-gray-400 flex items-center gap-1.5">
                  <User className="h-4 w-4" /> Personal Details
                </h2>
                <span className="text-[11px] text-gray-400">Click any field to update</span>
              </div>

              <div className="divide-y divide-gray-100">
                {/* 1. Full Name */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="sm:w-1/3">
                    <span className="text-xs font-semibold text-gray-700 block">Full Name</span>
                    <span className="text-[11px] text-gray-400">Your first and last name</span>
                  </div>

                  {editingField === 'name' ? (
                    <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
                      <Input
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="py-1.5 text-xs"
                      />
                      <Input
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="py-1.5 text-xs"
                      />
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button size="sm" onClick={handleSaveName} loading={isSaving}>
                          <Check className="h-3.5 w-3.5" /> Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingField(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {profile?.firstName
                          ? `${profile.firstName} ${profile.lastName || ''}`
                          : 'Not provided'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit('name')}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Username */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="sm:w-1/3">
                    <span className="text-xs font-semibold text-gray-700 block">Username</span>
                    <span className="text-[11px] text-gray-400">Unique public handle (3-20 chars)</span>
                  </div>

                  {editingField === 'username' ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        placeholder="e.g. asha.k"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="py-1.5 text-xs"
                      />
                      <Button size="sm" onClick={handleSaveUsername} loading={isSaving}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingField(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-mono font-medium text-gray-900">
                        {profile?.username ? `@${profile.username}` : 'Not provided'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit('username')}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Phone Number */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="sm:w-1/3">
                    <span className="text-xs font-semibold text-gray-700 block">Phone Number</span>
                    <span className="text-[11px] text-gray-400">Indian mobile number (+91)</span>
                  </div>

                  {editingField === 'phone' ? (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs w-full max-w-xs shadow-input focus-within:ring-2 focus-within:ring-brand-500">
                        <span className="text-gray-500 font-mono mr-1.5">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="9876543210"
                          value={phoneDigits}
                          onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-transparent text-gray-900 font-mono focus:outline-none"
                        />
                      </div>
                      <Button size="sm" onClick={handleSavePhone} loading={isSaving}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingField(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-sm font-mono text-gray-900">
                        {profile?.phone || 'Not provided'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit('phone')}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. Date of Birth */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="sm:w-1/3">
                    <span className="text-xs font-semibold text-gray-700 block">Date of Birth</span>
                    <span className="text-[11px] text-gray-400">YYYY-MM-DD</span>
                  </div>

                  {editingField === 'dob' ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="date"
                        value={dob}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setDob(e.target.value)}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      />
                      <Button size="sm" onClick={handleSaveDob} loading={isSaving}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingField(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-900">
                        {profile?.dateOfBirth || 'Not provided'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit('dob')}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Gender */}
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="sm:w-1/3">
                    <span className="text-xs font-semibold text-gray-700 block">Gender</span>
                    <span className="text-[11px] text-gray-400">Identity preference</span>
                  </div>

                  {editingField === 'gender' ? (
                    <div className="flex-1 flex items-center gap-2">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as GenderType)}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="NON_BINARY">Non-Binary</option>
                      </select>
                      <Button size="sm" onClick={handleSaveGender} loading={isSaving}>
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingField(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-between gap-2">
                      <span className="text-sm text-gray-900">
                        {profile?.gender
                          ? profile.gender.replace(/_/g, ' ')
                          : 'Prefer not to say'}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit('gender')}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 p-1"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Link to My Addresses */}
            <div className="rounded-3xl border border-brand-100 bg-brand-50/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Manage Delivery Addresses</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Save up to 5 shipping and billing addresses for fast one-click checkout.
                </p>
              </div>
              <Link to="/addresses">
                <Button size="sm">Go to My Addresses</Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;
