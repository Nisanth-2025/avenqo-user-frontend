import type { PaymentInitiation } from '../../../types/checkout.types';

export interface RazorpayPaymentResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailureResult {
  error?: {
    description?: string;
  };
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    contact: string;
  };
  theme: { color: string };
  handler: (result: RazorpayPaymentResult) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', handler: (result: RazorpayFailureResult) => void) => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Secure payment checkout is only available in a browser.'));
  }

  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => {
      if (window.Razorpay) resolve();
      else reject(new Error('The secure payment window could not be initialized.'));
    };
    script.onerror = () => {
      script.remove();
      reject(new Error('Could not load secure payment checkout. Please try again.'));
    };
    document.body.appendChild(script);
  }).catch((error: unknown) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

export interface OpenRazorpayCheckoutOptions {
  payment: PaymentInitiation;
  orderNumber: string;
  recipientName: string;
  recipientPhone: string;
  onOpen: () => void;
  onSuccess: (result: RazorpayPaymentResult) => void;
  onDismiss: () => void;
  onFailure: () => void;
}

export async function openRazorpayCheckout(options: OpenRazorpayCheckoutOptions): Promise<void> {
  await loadRazorpayScript();
  const Razorpay = window.Razorpay;
  if (!Razorpay) throw new Error('The secure payment window could not be initialized.');

  let completed = false;
  const checkout = new Razorpay({
    key: options.payment.keyId,
    amount: options.payment.amount,
    currency: options.payment.currency,
    name: 'Avenquo',
    description: `Order ${options.orderNumber}`,
    order_id: options.payment.razorpayOrderId,
    prefill: {
      name: options.recipientName,
      contact: options.recipientPhone,
    },
    theme: { color: '#2563EB' },
    handler: (result) => {
      completed = true;
      options.onSuccess(result);
    },
    modal: {
      ondismiss: () => {
        if (!completed) options.onDismiss();
      },
    },
  });

  checkout.on('payment.failed', () => {
    completed = true;
    options.onFailure();
  });

  options.onOpen();
  checkout.open();
}
