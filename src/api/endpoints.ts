export const API_ENDPOINTS = {
  AUTH: {
    SIGN_UP:            '/api/v1/auth/user/signup',
    VERIFY_SIGNUP_OTP:  '/api/v1/auth/user/verify/signup-otp',
    SIGN_IN:            '/api/v1/auth/user/signin',
    VERIFY_SIGNIN_OTP:  '/api/v1/auth/user/verify/signin-otp',
    REFRESH:            '/api/v1/auth/user/refresh',
  },
  CATEGORIES: {
    LIST:               '/api/v1/categories',
    BY_ID:              (categoryId: number | string) => `/api/v1/categories/${categoryId}`,
    PRODUCTS:           (categoryId: number | string) => `/api/v1/categories/${categoryId}/products`,
  },
  PRODUCTS: {
    LIST:               '/api/v1/products',
    BY_ID:              (productId: number | string) => `/api/v1/products/${productId}`,
    KEYWORD:            '/api/v1/products/keyword',
  },
  USER_PROFILE: {
    BASE:               '/api/v1/user/profile',
    ACCOUNT:            '/api/v1/user/profile/account',
    FIRST_NAME:         '/api/v1/user/profile/first-name',
    LAST_NAME:          '/api/v1/user/profile/last-name',
    USERNAME:           '/api/v1/user/profile/username',
    DATE_OF_BIRTH:      '/api/v1/user/profile/date-of-birth',
    GENDER:             '/api/v1/user/profile/gender',
    PHONE:              '/api/v1/user/profile/phone',
    IMAGE:              '/api/v1/user/profile/image',
  },
  ADDRESSES: {
    BASE:               '/api/v1/addresses',
    BY_ID:              (addressId: number | string) => `/api/v1/addresses/${addressId}`,
    DEFAULT_SHIPPING:   (addressId: number | string) => `/api/v1/addresses/${addressId}/default-shipping`,
    DEFAULT_BILLING:    (addressId: number | string) => `/api/v1/addresses/${addressId}/default-billing`,
  },
} as const;
