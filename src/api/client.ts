import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import { API_ENDPOINTS } from './endpoints';
import type { AuthenticationResponseDTO } from '../types/auth.types';

export interface ApiErrorBody {
  message?: string;
  status?: boolean;
  [key: string]: string | boolean | undefined;
}

export class ApiClientError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// When VITE_API_BASE_URL is not set, default to empty string ('') so all API calls
// use same-origin relative paths (/api/...).
// - In local development: Vite dev server proxy routes /api -> Railway backend.
// - In production (Vercel): vercel.json rewrite routes /api/:path* -> Railway backend.
// This prevents browser CORS errors (403 Forbidden) and connection failures.
export const API_BASE_URL = (
  configuredApiBaseUrl
    ? configuredApiBaseUrl.replace('avenquo-ecommerce-backend-production.up.railway.app', 'avenqo-ecommerce-backend-production.up.railway.app')
    : ''
).replace(/\/+$/, '');

const apiClientConfig = {
  baseURL: API_BASE_URL || undefined,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,
};

export const apiAxios = axios.create(apiClientConfig);

// Storefront product and category reads are public and should not depend on user sessions.
export const publicApiAxios = axios.create(apiClientConfig);

let activeRefreshPromise: Promise<string | null> | null = null;

export async function getOrRefreshToken(): Promise<string | null> {
  const currentAccess = tokenStorage.getAccessToken();
  const currentRefresh = tokenStorage.getRefreshToken();

  if (!currentAccess && !currentRefresh) return null;

  if (currentAccess && !tokenStorage.isTokenExpired(currentAccess, 30)) {
    return currentAccess;
  }

  if (!currentRefresh) {
    tokenStorage.clearTokens();
    tokenStorage.emitSessionExpired();
    return null;
  }

  if (activeRefreshPromise) return activeRefreshPromise;

  activeRefreshPromise = (async () => {
    try {
      const response = await axios.post<AuthenticationResponseDTO>(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken: currentRefresh.trim() },
        { headers: { 'Content-Type': 'application/json' } },
      );
      const newTokens = response.data;
      if (newTokens && newTokens.accessToken) {
        tokenStorage.setTokens(newTokens);
        tokenStorage.emitTokensUpdated(newTokens);
        return newTokens.accessToken;
      }
      throw new Error('Invalid token response from refresh endpoint');
    } catch (err) {
      tokenStorage.clearTokens();
      tokenStorage.emitSessionExpired();
      throw err;
    } finally {
      activeRefreshPromise = null;
    }
  })();

  return activeRefreshPromise;
}

apiAxios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const isAuthEndpoint =
    config.url?.includes('/api/v1/auth/users/signin') ||
    config.url?.includes('/api/v1/auth/users/signup') ||
    config.url?.includes('/api/v1/auth/users/password-login') ||
    config.url?.includes('/api/v1/auth/users/verify') ||
    config.url?.includes('/api/v1/auth/sessions/refresh');

  if (isAuthEndpoint) {
    // Public authentication endpoints MUST NOT send an Authorization header.
    // If an existing/expired Bearer token is attached, the backend's security filter
    // attempts to authenticate it first and fails with "User not found".
    config.headers.delete('Authorization');
  } else {
    try {
      const validToken = await getOrRefreshToken();
      if (validToken) {
        config.headers.set('Authorization', `Bearer ${validToken}`);
      }
    } catch {
      /* let backend 401 handle redirection */
    }
  }

  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }

  return config;
});

apiAxios.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (error instanceof AxiosError && error.response?.status === 401) {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;
      const isRefreshRequest = originalRequest?.url?.includes('/api/v1/auth/sessions/refresh');

      if (originalRequest && !originalRequest._retry && !isRefreshRequest) {
        originalRequest._retry = true;
        try {
          const freshAccessToken = await getOrRefreshToken();
          if (freshAccessToken) {
            originalRequest.headers.set('Authorization', `Bearer ${freshAccessToken}`);
            return apiAxios(originalRequest);
          }
        } catch (refreshErr) {
          return Promise.reject(refreshErr);
        }
      }
    }
    return Promise.reject(error);
  },
);

export function extractApiError(err: unknown): ApiClientError {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorBody | undefined;
    const status = err.response?.status ?? 0;

    if (typeof data?.message === 'string' && data.message.trim()) {
      return new ApiClientError(data.message, status);
    }

    if (data) {
      const metadataFields = new Set(['timestamp', 'status', 'error', 'path', 'trace', 'exception']);
      const fieldErrors = Object.fromEntries(
        Object.entries(data).filter(
          ([key, value]) => typeof value === 'string' && !metadataFields.has(key),
        ),
      ) as Record<string, string>;
      const firstFieldError = Object.values(fieldErrors)[0];
      if (firstFieldError) return new ApiClientError(firstFieldError, status, fieldErrors);
    }

    if (err.code === 'ECONNABORTED')
      return new ApiClientError('Request timed out. Please try again.', 0);

    if (status >= 500) {
      return new ApiClientError('The server could not complete the request. Please try again.', status);
    }

    if (!err.response) {
      return new ApiClientError('Unable to reach the server. Check your connection and try again.', 0);
    }

    return new ApiClientError(err.message || 'Request failed. Please try again.', status);
  }
  if (err instanceof Error) return new ApiClientError(err.message, 0);
  return new ApiClientError('An unexpected error occurred', 0);
}
