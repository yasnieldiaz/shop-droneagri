'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  tagline?: string;
  mainImage: string;
  price: number;
  priceEUR: number;
  compareAtPrice: number | null;
  compareAtPriceEUR: number | null;
  stock: number;
  category: string;
  type: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');

  const formatPrice = (priceInGroszy: number) => {
    return (priceInGroszy / 100).toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="relative aspect-square bg-white">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            SALE
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-brand-red transition-colors line-clamp-2">
          {product.name}
        </h3>

        {product.tagline && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {product.tagline}
          </p>
        )}

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)} PLN
          </span>

          {hasDiscount && product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)} PLN
            </span>
          )}
        </div>

      </div>
    </Link>
  );
}
