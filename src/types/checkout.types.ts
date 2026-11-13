export interface CheckoutShippingAddress {
  label: string;
  recipientName: string;
  recipientPhone: string;
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface CheckoutOrderItem {
  orderItemId: number;
  productId: number | null;
  productName: string;
  sku: string | null;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CheckoutSellerOrder {
  sellerOrderId: number;
  sellerOrderNumber: string;
  sellerProfileId: number;
  storeName: string;
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  status: string;
  items: CheckoutOrderItem[];
}

export interface CheckoutOrder {
  orderId: number;
  orderNumber: string;
  orderStatus: string;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddress: CheckoutShippingAddress;
  sellerOrders: CheckoutSellerOrder[];
}

export interface PaymentInitiation {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderId: number;
  orderNumber: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerification {
  orderId: number;
  orderNumber: string;
  paymentStatus: string;
  orderStatus: string;
}

export interface CheckoutSummaryItem {
  id: string | number;
  name: string;
  imageUrl: string | null;
  quantity: number;
  subtotal: number;
}
