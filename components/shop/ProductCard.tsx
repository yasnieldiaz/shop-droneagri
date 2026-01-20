'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useCurrencyStore, formatPrice } from '@/lib/store/currency';

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    tagline?: string | null;
    mainImage: string | null;
    price: number;
    priceEUR?: number | null;
    compareAtPrice?: number | null;
    compareAtPriceEUR?: number | null;
    stock: number;
    category?: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations('products');
  const { currency } = useCurrencyStore();

  const currentPrice = currency === 'PLN' ? product.price : (product.priceEUR ?? Math.round(product.price / 4.3));
  const currentComparePrice = currency === 'PLN'
    ? product.compareAtPrice
    : (product.compareAtPriceEUR ?? (product.compareAtPrice ? Math.round(product.compareAtPrice / 4.3) : null));

  const hasDiscount = currentComparePrice && currentComparePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - currentPrice / currentComparePrice!) * 100)
    : 0;

  return (
    <Link href={`/products/${product.slug}`} className="product-card block group">
      {/* Image */}
      <div className="product-card-image">
        {product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="badge badge-sale">-{discountPercent}%</span>
          )}
          {product.stock === 0 && (
            <span className="badge badge-out-of-stock">{t('outOfStock')}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="product-card-content">
        {product.category && (
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </span>
        )}
        <h3 className="font-semibold text-navy mt-1 group-hover:text-brand-red transition-colors line-clamp-2">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.tagline}</p>
        )}
        <div className="mt-3 flex items-center gap-2">
          <span className={`price ${hasDiscount ? 'price-sale' : ''}`}>
            {formatPrice(product.price, product.priceEUR ?? null, currency)}
          </span>
          {hasDiscount && (
            <span className="price-original">
              {formatPrice(product.compareAtPrice!, product.compareAtPriceEUR ?? null, currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
