'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useB2BStore } from '@/lib/store/b2b';

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
  const locale = useLocale();
  const { isLoggedIn, getB2BPrice, customer } = useB2BStore();

  // Check if B2B customer is from Poland (must pay VAT)
  const isB2BPoland = isLoggedIn && customer && customer.country === 'PL';

  // Use EUR for all languages except Polish
  const isPolish = locale === 'pl';

  // Check for B2B price
  const b2bPrice = isLoggedIn ? getB2BPrice(product.slug, product.price, product.priceEUR) : null;

  // Use B2B price if available, otherwise use regular price
  const currency = b2bPrice ? b2bPrice.currency : (isPolish ? 'PLN' : 'EUR');
  const price = b2bPrice ? b2bPrice.price : (isPolish ? product.price : product.priceEUR);
  const compareAtPrice = b2bPrice ? (isPolish ? product.price : product.priceEUR) : (isPolish ? product.compareAtPrice : product.compareAtPriceEUR);
  const isB2BPrice = b2bPrice?.isB2BPrice || false;

  const VAT_RATE = 0.23; // 23% VAT in Poland

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString(isPolish ? 'pl-PL' : 'de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Calculate Netto from Brutto (prices stored are Brutto with 23% VAT)
  const calculateNetto = (brutto: number) => {
    return Math.round(brutto / (1 + VAT_RATE));
  };

  const hasDiscount = compareAtPrice && compareAtPrice > price;

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
            unoptimized
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

        {isB2BPrice && (
          <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            B2B
          </span>
        )}
        {!isB2BPrice && hasDiscount && (
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

        <div className="mt-3">
          {isB2BPrice && (
            <span className="text-xs text-green-600 font-medium">B2B Price</span>
          )}

          {isB2BPrice ? (
            /* B2B Customer - Show only netto price (reverse charge) */
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-green-700">
                  {formatPrice(price)} {currency}
                </span>
                <span className="text-xs text-gray-500">netto</span>
                {hasDiscount && compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(compareAtPrice)} {currency}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {isB2BPoland ? formatPrice(Math.round(price * 1.23)) + " " + currency + " brutto (VAT 23%)" : "VAT 0% (reverse charge)"}
              </div>
            </>
          ) : (
            /* Regular Customer - Show netto & brutto on same line */
            <>
              <div className="flex items-baseline gap-1 flex-wrap">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(calculateNetto(price))} {currency}
                </span>
                <span className="text-xs text-gray-500">netto</span>
                {hasDiscount && compareAtPrice && (
                  <span className="text-sm text-gray-400 line-through ml-1">
                    {formatPrice(calculateNetto(compareAtPrice))} {currency}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatPrice(price)} {currency} {isPolish ? "brutto" : "incl. VAT"}
              </div>
            </>
          )}
        </div>

      </div>
    </Link>
  );
}
