export interface SignUpRequestDTO {
  email: string;
}

export interface SignInRequestDTO {
  email: string;
}

export interface PasswordLoginRequestDTO {
  email: string;
  password: string;
}

export interface PasswordRequestDTO {
  newPassword: string;
  confirmPassword: string;
}

export interface SessionDTO {
  sessionId: number;
  createdAt: string;
  expiresAt: string;
  deviceInfo: string | null;
  revokedAt: string | null;
}

export interface SessionPageResponseDTO {
  content: SessionDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface AuthenticationResponseDTO {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface DecodedTokenPayload {
  sub: string;
  userId?: string | number;
  roles?: string[] | string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  email: string;
  userId?: string | number;
  roles: string[];
}

export type AuthMode = 'signin' | 'signup';
export type AuthStep = 'email' | 'otp';
