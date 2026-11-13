import { apiAxios, extractApiError } from '../../../api/client';
import { API_ENDPOINTS } from '../../../api/endpoints';
import type {
  CheckoutOrder,
  PaymentInitiation,
  PaymentVerification,
  PaymentVerificationRequest,
} from '../../../types/checkout.types';

function assertPositiveInteger(value: number, field: string) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive whole number.`);
  }
}

export const checkoutService = {
  async createOrder(addressId: number): Promise<CheckoutOrder> {
    assertPositiveInteger(addressId, 'Address ID');

    try {
      const response = await apiAxios.post<CheckoutOrder>(API_ENDPOINTS.ORDERS.CHECKOUT, {
        addressId,
      });
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async initiatePayment(orderId: number): Promise<PaymentInitiation> {
    assertPositiveInteger(orderId, 'Order ID');

    try {
      const response = await apiAxios.post<PaymentInitiation>(
        API_ENDPOINTS.PAYMENTS.INITIATE_ORDER(orderId),
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },

  async verifyPayment(payload: PaymentVerificationRequest): Promise<PaymentVerification> {
    const fields: Array<[keyof PaymentVerificationRequest, number]> = [
      ['razorpayOrderId', 100],
      ['razorpayPaymentId', 100],
      ['razorpaySignature', 256],
    ];

    for (const [field, maxLength] of fields) {
      const value = payload[field];
      if (!value.trim() || value.length > maxLength) {
        throw new Error(`Invalid ${field} returned by the payment provider.`);
      }
    }

    try {
      const response = await apiAxios.post<PaymentVerification>(
        API_ENDPOINTS.PAYMENTS.VERIFY,
        payload,
      );
      return response.data;
    } catch (error) {
      throw extractApiError(error);
    }
  },
};
