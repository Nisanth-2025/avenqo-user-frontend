import React from 'react';
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
  const primaryImage =
    product.images?.find((img) => img.primaryImage) || product.images?.[0];

  const hasDiscount = product.discount > 0;
  const isOutOfStock = product.quantity === 0;

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="group flex w-full flex-col overflow-hidden rounded-[1.15rem] border border-neutral-200/70 bg-white text-left shadow-[0_5px_18px_rgba(31,29,25,0.045)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(31,29,25,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[0.94] w-full overflow-hidden bg-[#eceae6] sm:aspect-[4/5]">
        {primaryImage ? (
          <img
            src={primaryImage.imageUrl}
            alt={primaryImage.altText || product.productName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}
        {hasDiscount && !isOutOfStock && (
          <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-[#173b70] px-2.5 py-1 text-[9px] font-semibold tracking-wide text-white shadow-[0_3px_10px_rgba(0,0,0,0.18)] sm:text-[10px]">
            {Math.round(product.discount)}% OFF
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-white/90 px-3 py-2 text-xs font-medium text-neutral-700 backdrop-blur-sm">
            Sold out
          </div>
        )}
      </div>

      <div className="space-y-1 px-2.5 py-2.5 sm:px-3 sm:py-3">
        {product.categoryName && (
          <p className="truncate text-[9px] font-medium uppercase tracking-[0.12em] text-neutral-500 sm:text-[10px]">{product.categoryName}</p>
        )}
        <h3 className="line-clamp-2 min-h-[2.2em] text-[12px] font-medium leading-snug text-neutral-950 sm:text-sm">
          {product.productName}
        </h3>
        <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[13px] text-neutral-950 sm:gap-2 sm:text-sm">
          <span className="font-semibold">{formatPrice(Number(product.specialPrice))}</span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(Number(product.price))}
            </span>
          )}
        </p>
        {product.storeName && (
          <p className="truncate text-[10px] text-neutral-500 sm:text-xs">{product.storeName}</p>
        )}
      </div>
    </button>
  );
};
