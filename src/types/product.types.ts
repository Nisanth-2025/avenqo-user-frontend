export interface ProductImageDTO {
  productImageId: number;
  imageUrl: string;
  altText?: string | null;
  sortOrder: number;
  primaryImage: boolean;
}

export interface ProductDTO {
  productId: number;
  productName: string;
  sku: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  discount: number;
  specialPrice: number;
  quantity: number;
  status: 'ACTIVE' | string;
  isReturnable: boolean;
  returnWindowDays?: number | null;
  categoryId: number;
  categoryName?: string;
  storeName?: string;
  images: ProductImageDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductPageResponseDTO {
  content: ProductDTO[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  lastPage: boolean;
}

export interface ProductQueryParams {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'productId' | 'productName' | 'price' | 'specialPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductKeywordSearchParams extends ProductQueryParams {
  productName: string;
}
