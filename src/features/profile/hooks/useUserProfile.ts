import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { GenderType } from '../../../types/profile.types';

export const USER_PROFILE_QUERY_KEY = ['user', 'profile'];
export const USER_ACCOUNT_QUERY_KEY = ['user', 'account'];

export function useUserProfile() {
  const queryClient = useQueryClient();

  // Profile data
  const profileQuery = useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => profileService.getProfile(),
    staleTime: 60_000,
  });

  // Account data
  const accountQuery = useQuery({
    queryKey: USER_ACCOUNT_QUERY_KEY,
    queryFn: () => profileService.getAccount(),
    staleTime: 60_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: USER_ACCOUNT_QUERY_KEY });
  };

  const updateFirstNameMutation = useMutation({
    mutationFn: (name: string) => profileService.updateFirstName(name),
    onSuccess: invalidate,
  });

  const updateLastNameMutation = useMutation({
    mutationFn: (name: string) => profileService.updateLastName(name),
    onSuccess: invalidate,
  });

  const updateUsernameMutation = useMutation({
    mutationFn: (username: string) => profileService.updateUsername(username),
    onSuccess: invalidate,
  });

  const updateDateOfBirthMutation = useMutation({
    mutationFn: (dob: string) => profileService.updateDateOfBirth(dob),
    onSuccess: invalidate,
  });

  const updateGenderMutation = useMutation({
    mutationFn: (gender: GenderType) => profileService.updateGender(gender),
    onSuccess: invalidate,
  });

  const updatePhoneMutation = useMutation({
    mutationFn: (phone: string) => profileService.updatePhone(phone),
    onSuccess: invalidate,
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => profileService.uploadProfileImage(file),
    onSuccess: invalidate,
  });

  const deleteImageMutation = useMutation({
    mutationFn: () => profileService.deleteProfileImage(),
    onSuccess: invalidate,
  });

  return {
    profile: profileQuery.data,
    account: accountQuery.data,
    isLoading: profileQuery.isLoading || accountQuery.isLoading,
    isError: profileQuery.isError || accountQuery.isError,
    error: profileQuery.error || accountQuery.error,
    refetch: () => {
      profileQuery.refetch();
      accountQuery.refetch();
    },
    updateFirstNameMutation,
    updateLastNameMutation,
    updateUsernameMutation,
    updateDateOfBirthMutation,
    updateGenderMutation,
    updatePhoneMutation,
    uploadImageMutation,
    deleteImageMutation,
  };
}
