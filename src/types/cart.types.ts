export interface CartItemDTO {
  cartItemId: number;
  productId: number;
  productName: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartDTO {
  cartId: number | null;
  cartItems: CartItemDTO[];
  totalCartPrice: number;
}

export interface CartProductQuantityInput {
  productId: number;
  quantity: number;
}
