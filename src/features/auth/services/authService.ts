import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  SignUpRequestDTO,
  SignInRequestDTO,
  VerifyOtpRequestDTO,
  RefreshTokenRequestDTO,
  AuthenticationResponseDTO,
} from '../../../types/auth.types';

export const authService = {
  async signUp(dto: SignUpRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SIGN_UP, dto);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async verifySignUpOtp(dto: VerifyOtpRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.post<string>(API_ENDPOINTS.AUTH.VERIFY_SIGNUP_OTP, dto);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async signIn(dto: SignInRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SIGN_IN, dto);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async verifySignInOtp(dto: VerifyOtpRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const response = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.VERIFY_SIGNIN_OTP,
        dto,
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async refreshToken(dto: RefreshTokenRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const response = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.REFRESH,
        dto,
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },
};
