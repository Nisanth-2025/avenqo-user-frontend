import React, { useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { useAddToCart } from '../../cart/hooks/useCart';
import { ProductDTO } from '../../../types/product.types';

interface ProductCardProps {
  product: ProductDTO;
  onClick: (product: ProductDTO) => void;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value);
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const addToCart = useAddToCart();
  const primaryImage = product.images?.find((img) => img.primaryImage) || product.images?.[0];
  const hasDiscount = product.discount > 0;
  const isOutOfStock = product.quantity <= 0;

  const handleAddToCart = () => {
    setFeedback(null);
    addToCart.mutate(
      { productId: product.productId, quantity: 1 },
      {
        onSuccess: () => setFeedback({ type: 'success', message: 'Added to your cart.' }),
        onError: (error) => setFeedback({ type: 'error', message: error.message }),
      },
    );
  };

  return (
    <article className="group/card flex h-full flex-col overflow-hidden rounded-[1.15rem] border border-neutral-200/70 bg-white shadow-[0_5px_18px_rgba(31,29,25,0.045)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_14px_30px_rgba(31,29,25,0.11)] motion-reduce:transition-none motion-reduce:hover:transform-none">
      <div className="relative aspect-[0.98] w-full overflow-hidden bg-[#f0efed]">
        <button
          type="button"
          onClick={() => onClick(product)}
          aria-label={`View ${product.productName}`}
          className="absolute inset-0 z-0 flex h-full w-full items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#2563EB]"
        >
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={primaryImage.altText || product.productName}
              className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-[1.045] motion-reduce:transition-none"
              loading="lazy"
            />
          ) : (
            <span className="text-xs text-neutral-400">No image</span>
          )}
        </button>
        {hasDiscount && !isOutOfStock && (
          <span className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-[#2563EB] px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white shadow-[0_3px_10px_rgba(0,0,0,0.18)] sm:text-[10px]">
            {Math.round(product.discount)}% OFF
          </span>
        )}
        <button
          type="button"
          disabled
          aria-label={`Add ${product.productName} to wishlist — coming soon`}
          title="Wishlist coming soon"
          className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full border border-white/80 bg-white/95 text-neutral-600 shadow-sm backdrop-blur transition hover:text-[#2563EB] disabled:cursor-not-allowed"
        >
          <Heart className="size-4" aria-hidden="true" />
        </button>
        {isOutOfStock && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-white/90 px-3 py-2 text-xs font-medium text-neutral-700 backdrop-blur-sm">
            Sold out
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2.5 pb-3 pt-2.5 sm:px-3 sm:pb-3.5 sm:pt-3">
        {product.categoryName && (
          <p className="truncate text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-500 sm:text-[10px]">
            {product.categoryName}
          </p>
        )}
        <button
          type="button"
          onClick={() => onClick(product)}
          className="line-clamp-2 min-h-[2.3em] text-left text-[12px] font-semibold leading-snug text-neutral-950 transition-colors hover:text-[#2563EB] focus-visible:outline-none focus-visible:underline focus-visible:decoration-[#2563EB] focus-visible:underline-offset-2 sm:text-sm"
        >
          {product.productName}
        </button>
        <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-neutral-500 sm:text-[11px]" aria-label="Ratings and reviews coming soon">
          <Star className="size-3 shrink-0 text-amber-500" aria-hidden="true" />
          <span className="font-medium text-neutral-700">—</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">Reviews soon</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[13px] text-neutral-950 sm:gap-2 sm:text-sm">
          <span className="font-bold">{formatPrice(Number(product.specialPrice))}</span>
          {hasDiscount && (
            <span className="text-[10px] text-neutral-400 line-through sm:text-xs">
              {formatPrice(Number(product.price))}
            </span>
          )}
        </div>
        <div className="flex min-h-3 items-center gap-1.5" aria-label="Product options placeholder">
          <span className="inline-block size-3 shrink-0 rounded-full bg-neutral-900 ring-1 ring-neutral-900/10" aria-hidden="true" />
          <span className="inline-block size-3 shrink-0 rounded-full bg-neutral-400 ring-1 ring-neutral-900/10" aria-hidden="true" />
          <span className="inline-block size-3 shrink-0 rounded-full bg-neutral-200 ring-1 ring-neutral-900/10" aria-hidden="true" />
          <span className="ml-0.5 truncate text-[9px] text-neutral-400">Options soon</span>
          <span className="sr-only">Color options coming soon</span>
        </div>
        {product.storeName && (
          <p className="truncate text-[10px] text-neutral-500 sm:text-xs">{product.storeName}</p>
        )}
        <Button
          type="button"
          size="sm"
          fullWidth
          disabled={isOutOfStock}
          isLoading={addToCart.isPending}
          onClick={handleAddToCart}
          className="mt-auto h-9 rounded-xl px-2 py-2 text-[10px] shadow-[0_4px_12px_rgba(37,99,235,0.18)] sm:h-10 sm:text-xs"
        >
          <ShoppingCart className="size-3.5" aria-hidden="true" />
          {isOutOfStock ? 'Out of stock' : 'Add to cart'}
        </Button>
        {feedback?.type === 'error' && (
          <p className="text-[10px] leading-snug text-red-600" role="alert">{feedback.message}</p>
        )}
        {feedback?.type === 'success' && (
          <p className="flex flex-wrap items-center gap-x-1 text-[10px] leading-snug text-blue-700" role="status">
            <span>{feedback.message}</span>
            <Link to="/cart" className="font-semibold underline underline-offset-2">View cart</Link>
          </p>
        )}
      </div>
    </article>
  );
};
