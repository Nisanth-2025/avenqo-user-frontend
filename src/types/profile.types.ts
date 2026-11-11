export type GenderType = 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';

export interface UserProfileDTO {
  id?: number;
  userId: number;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  gender?: GenderType | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAccountDTO {
  userId: number;
  email: string;
  accountStatus: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string | null;
}

export interface UpdateNameRequestDTO {
  name: string;
}

export interface UpdateUsernameRequestDTO {
  username: string;
}

export interface UpdateDateOfBirthRequestDTO {
  dateOfBirth: string;
}

export interface UpdateGenderRequestDTO {
  gender: GenderType;
}

export interface UpdatePhoneRequestDTO {
  phone: string;
}
