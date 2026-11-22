import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  SignUpRequestDTO,
  SignInRequestDTO,
  VerifyOtpRequestDTO,
  RefreshTokenRequestDTO,
  AuthenticationResponseDTO,
  PasswordLoginRequestDTO,
  PasswordRequestDTO,
  SessionPageResponseDTO,
} from '../../../types/auth.types';

export const authService = {
  async signUp(dto: SignUpRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SIGN_UP, {
        email: dto.email.trim().toLowerCase(),
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async verifySignUpOtp(dto: VerifyOtpRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.post<string>(API_ENDPOINTS.AUTH.VERIFY_SIGNUP_OTP, {
        email: dto.email.trim().toLowerCase(),
        otp: dto.otp.trim(),
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async signIn(dto: SignInRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SIGN_IN, {
        email: dto.email.trim().toLowerCase(),
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async verifySignInOtp(dto: VerifyOtpRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const response = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.VERIFY_SIGNIN_OTP,
        {
          email: dto.email.trim().toLowerCase(),
          otp: dto.otp.trim(),
        },
        { headers: { 'User-Agent': 'Avenquo Web/1.0' } },
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async passwordLogin(dto: PasswordLoginRequestDTO): Promise<AuthenticationResponseDTO> {
    try {
      const response = await apiAxios.post<AuthenticationResponseDTO>(
        API_ENDPOINTS.AUTH.PASSWORD_LOGIN,
        {
          email: dto.email.trim().toLowerCase(),
          password: dto.password,
        },
        { headers: { 'User-Agent': 'Avenquo Web/1.0' } },
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async setPassword(dto: PasswordRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.post<string>(API_ENDPOINTS.AUTH.SET_PASSWORD, dto);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async changePassword(dto: PasswordRequestDTO): Promise<string> {
    try {
      const response = await apiAxios.put<string>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, dto);
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async logout(tokenHash: string, accessToken: string): Promise<string> {
    try {
      const response = await apiAxios.post<string>(
        API_ENDPOINTS.AUTH.LOGOUT,
        { tokenHash },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async listSessions(page = 0, size = 10): Promise<SessionPageResponseDTO> {
    try {
      const response = await apiAxios.get<SessionPageResponseDTO>(API_ENDPOINTS.AUTH.SESSIONS, {
        params: { page, size },
      });
      return response.data;
    } catch (err) {
      throw extractApiError(err);
    }
  },

  async revokeSession(sessionId: number): Promise<string> {
    try {
      const response = await apiAxios.delete<string>(API_ENDPOINTS.AUTH.SESSION_BY_ID(sessionId));
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
