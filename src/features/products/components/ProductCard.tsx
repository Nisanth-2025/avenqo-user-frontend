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
      className="group flex w-full flex-col text-left"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#eceae6]">
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
        {isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 bg-white/80 px-3 py-2 text-xs text-neutral-700">
            Sold out
          </div>
        )}
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        {product.categoryName && (
          <p className="text-[11px] tracking-wide text-neutral-400">{product.categoryName}</p>
        )}
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-neutral-900">
          {product.productName}
        </h3>
        <p className="flex items-baseline gap-2 text-sm text-neutral-800">
          <span>{formatPrice(Number(product.specialPrice))}</span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {formatPrice(Number(product.price))}
            </span>
          )}
        </p>
        {product.storeName && (
          <p className="truncate text-xs text-neutral-400">{product.storeName}</p>
        )}
      </div>
    </button>
  );
};
