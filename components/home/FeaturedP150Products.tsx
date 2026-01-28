'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';

interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  mainImage: string | null;
  price: number;
  priceEUR: number | null;
  compareAtPrice: number | null;
  compareAtPriceEUR: number | null;
}

export function FeaturedP150Products() {
  const t = useTranslations();
  const locale = useLocale();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const currency = locale === 'pl' ? 'PLN' : 'EUR';

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch products from Airborne and Task System categories
        const [airborneRes, taskRes] = await Promise.all([
          fetch('/api/products?category=Airborne&limit=20'),
          fetch('/api/products?category=Task%20System&limit=20')
        ]);

        let allProducts: Product[] = [];

        if (airborneRes.ok) {
          const data = await airborneRes.json();
          allProducts = [...allProducts, ...(data.products || [])];
        }

        if (taskRes.ok) {
          const data = await taskRes.json();
          allProducts = [...allProducts, ...(data.products || [])];
        }

        // Filter to only P150 products (exclude LED and P100)
        const p150Products = allProducts.filter((p) => {
          const name = p.name.toLowerCase();
          const isP150 = name.includes('p150');
          const isRevoCast = name.includes('revocast') && !name.includes('p100');
          const isRevoSpray = name.includes('revospray') && name.includes('p4');
          const isLED = name.includes('led');
          return (isP150 || isRevoCast || isRevoSpray) && !isLED;
        }).slice(0, 6);

        setProducts(p150Products);
      } catch (error) {
        console.error('Error fetching P150 products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const formatPrice = (price: number) => {
    // Prices are stored in grosz/cents, divide by 100 for display
    return new Intl.NumberFormat(locale === 'pl' ? 'pl-PL' : 'de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price / 100);
  };

  const getPrice = (product: Product) => {
    if (currency === 'EUR' && product.priceEUR) {
      return product.priceEUR;
    }
    return product.price;
  };

  const getComparePrice = (product: Product) => {
    if (currency === 'EUR' && product.compareAtPriceEUR) {
      return product.compareAtPriceEUR;
    }
    return product.compareAtPrice;
  };

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              XAG P150 Max
            </h2>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <span className="inline-block bg-brand-red text-white px-4 py-1 rounded-full text-sm font-medium mb-4">
            {t('p150Max.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
            XAG P150 Max
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {t('p150Max.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const price = getPrice(product);
            const comparePrice = getComparePrice(product);
            const hasDiscount = comparePrice && comparePrice > price;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Image */}
                <div className="relative h-48 bg-gray-50">
                  {product.mainImage ? (
                    <Image
                      src={product.mainImage}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 bg-brand-red text-white text-xs font-bold px-2 py-1 rounded">
                      -{Math.round((1 - price / comparePrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-navy group-hover:text-brand-red transition-colors line-clamp-2 min-h-[48px]">
                    {product.name}
                  </h3>
                  {product.tagline && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {product.tagline}
                    </p>
                  )}
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-brand-red">
                      {formatPrice(price)} {currency}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(comparePrice)} {currency}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">netto</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/products?search=P150"
            className="inline-flex items-center gap-2 btn-primary"
          >
            {t('common.viewAllProducts')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
