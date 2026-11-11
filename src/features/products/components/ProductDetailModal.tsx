import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductDTO } from '../../../types/product.types';
import { Minus, Plus, ShoppingCart, X } from 'lucide-react';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/ui/Button';
import { useAddToCart } from '../../cart/hooks/useCart';

interface ProductDetailModalProps {
  product: ProductDTO | null;
  onClose: () => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [addQuantity, setAddQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const addToCart = useAddToCart();

  useEffect(() => {
    setActiveImgIndex(0);
    setAddQuantity(1);
    setCartFeedback(null);
    addToCart.reset();
  }, [product?.productId]);

  if (!product) return null;

  const images = product.images || [];
  const activeImg = images[activeImgIndex] || images[0];
  const hasDiscount = product.discount > 0;
  const isOutOfStock = product.quantity <= 0;

  const handleAddToCart = () => {
    setCartFeedback(null);
    addToCart.mutate(
      { productId: product.productId, quantity: addQuantity },
      {
        onSuccess: () => {
          setCartFeedback({
            type: 'success',
            message: `${addQuantity} ${addQuantity === 1 ? 'item' : 'items'} added to your cart.`,
          });
        },
        onError: (error) => setCartFeedback({ type: 'error', message: error.message }),
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden bg-[#f7f5f2] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <p className="text-xs text-neutral-500">
            {product.categoryName || 'Product'}
            {product.storeName ? ` · ${product.storeName}` : ''}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-500 hover:bg-black/[0.04] hover:text-neutral-900"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-8 sm:px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-[#eceae6]">
                {activeImg ? (
                  <img
                    src={activeImg.imageUrl}
                    alt={activeImg.altText || product.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-neutral-400">No image</span>
                )}
              </div>

              {images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                  {images.map((img, idx) => (
                    <button
                      key={img.productImageId || idx}
                      type="button"
                      onClick={() => setActiveImgIndex(idx)}
                      className={`h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg ${
                        activeImgIndex === idx ? 'ring-2 ring-neutral-900 ring-offset-2' : ''
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="md:pt-2">
              <h2 id="product-detail-title" className="text-2xl font-medium leading-snug tracking-tight">
                {product.productName}
              </h2>
              <p className="mt-1 text-xs text-neutral-400">SKU {product.sku}</p>

              <p className="mt-5 flex items-baseline gap-3 text-lg">
                <span>{formatPrice(Number(product.specialPrice))}</span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(Number(product.price))}
                  </span>
                )}
              </p>

              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between gap-6 border-t border-neutral-200/80 pt-3">
                  <dt className="text-neutral-500">Availability</dt>
                  <dd className="text-right text-neutral-900">
                    {isOutOfStock ? 'Sold out' : `${product.quantity} in stock`}
                  </dd>
                </div>
                <div className="flex justify-between gap-6 border-t border-neutral-200/80 pt-3">
                  <dt className="text-neutral-500">Returns</dt>
                  <dd className="text-right text-neutral-900">
                    {product.isReturnable
                      ? `${product.returnWindowDays || 7} days`
                      : 'Not returnable'}
                  </dd>
                </div>
                {product.storeName && (
                  <div className="flex justify-between gap-6 border-t border-neutral-200/80 pt-3">
                    <dt className="text-neutral-500">Sold by</dt>
                    <dd className="text-right text-neutral-900">{product.storeName}</dd>
                  </div>
                )}
              </dl>

              {product.shortDescription && (
                <p className="mt-6 text-sm leading-relaxed text-neutral-700">
                  {product.shortDescription}
                </p>
              )}

              {product.description && (
                <div className="mt-6 border-t border-neutral-200/80 pt-5">
                  <h3 className="text-sm text-neutral-900">Details</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="mt-7 border-t border-neutral-200/80 pt-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Quantity</p>
                    <p className="mt-0.5 text-xs text-neutral-500">
                      {isOutOfStock ? 'Currently unavailable' : `${product.quantity} available`}
                    </p>
                  </div>
                  <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-white">
                    <button
                      type="button"
                      onClick={() => setAddQuantity((current) => Math.max(1, current - 1))}
                      disabled={isOutOfStock || addQuantity <= 1 || addToCart.isPending}
                      aria-label="Decrease quantity"
                      className="flex size-10 items-center justify-center rounded-l-xl text-neutral-600 transition hover:bg-blue-50 hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-9 text-center text-sm font-semibold tabular-nums" aria-live="polite">{addQuantity}</span>
                    <button
                      type="button"
                      onClick={() => setAddQuantity((current) => Math.min(product.quantity, current + 1))}
                      disabled={isOutOfStock || addQuantity >= product.quantity || addToCart.isPending}
                      aria-label="Increase quantity"
                      className="flex size-10 items-center justify-center rounded-r-xl text-neutral-600 transition hover:bg-blue-50 hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
                <Button
                  fullWidth
                  className="mt-4"
                  disabled={isOutOfStock}
                  isLoading={addToCart.isPending}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="size-4" />
                  {isOutOfStock ? 'Out of stock' : 'Add to cart'}
                </Button>
                {cartFeedback?.type === 'error' && (
                  <div className="mt-3" role="alert">
                    <Alert type="error" message={cartFeedback.message} />
                  </div>
                )}
                {cartFeedback?.type === 'success' && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2" role="status">
                    <span className="text-xs font-medium text-blue-800">{cartFeedback.message}</span>
                    <Link to="/cart" className="text-xs font-semibold text-[#2563EB] underline underline-offset-2">View cart</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
