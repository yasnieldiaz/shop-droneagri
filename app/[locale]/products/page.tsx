'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ProductCard } from '@/components/shop/ProductCard';

// Product data - will be moved to database
// Prices in PLN (grosz) and EUR (cents) - EUR is approximately PLN/4.3
const mockProducts = [
  // ==================== AIRBORNE (DRONES) ====================
  {
    id: 'AU-XAG-PROP4',
    sku: 'AU-XAG-PROP4',
    slug: 'AU-XAG-PROP4',
    name: 'XAG P100 Pro Basic Package',
    tagline: 'Complete spray package with 50L tank, 4 batteries, 2 chargers',
    mainImage: '/images/products/drones/au-xag-prop4-1.png',
    price: 10920000,
    priceEUR: 2540000,
    compareAtPrice: 12896000,
    compareAtPriceEUR: 2999000,
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
  },
  {
    id: '09-007-00136',
    sku: '09-007-00136',
    slug: '09-007-00136',
    name: 'XAG P100 Pro',
    tagline: '50kg payload, 50L tank, SuperX 4 Pro flight control',
    mainImage: '/images/products/drones/09-007-00136-1.png',
    price: 6292000,
    priceEUR: 1463000,
    compareAtPrice: 7800000,
    compareAtPriceEUR: 1814000,
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
  },
  {
    id: 'AU-XAG-PROP5',
    sku: 'AU-XAG-PROP5',
    slug: 'AU-XAG-PROP5',
    name: 'XAG P100 Pro Spreader Package',
    tagline: 'Spray + Spread package with RevoSpray P3 & RevoCast P3',
    mainImage: '/images/products/drones/au-xag-prop5-1.png',
    price: 11700000,
    priceEUR: 2721000,
    compareAtPrice: 14081600,
    compareAtPriceEUR: 3275000,
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
  },
  {
    id: 'AU-XAG-PROP6',
    sku: 'AU-XAG-PROP6',
    slug: 'AU-XAG-PROP6',
    name: 'XAG P100 Pro Package + RTK',
    tagline: 'Full package with RTK for centimetre-level precision',
    mainImage: '/images/products/drones/au-xag-prop6-1.png',
    price: 12480000,
    priceEUR: 2902000,
    compareAtPrice: 15293200,
    compareAtPriceEUR: 3556000,
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
  },

  // ==================== SMART BATTERY ====================
  {
    id: '09-017-00064',
    sku: '09-017-00064',
    slug: '09-017-00064',
    name: 'XAG Smart Battery B13970S',
    tagline: 'High-capacity smart battery for P150 series',
    mainImage: '/images/products/smart-battery/09-017-00064-1.jpg',
    price: 743600,
    priceEUR: 172900,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
  },
  {
    id: '09-017-00025',
    sku: '09-017-00025',
    slug: '09-017-00025',
    name: 'XAG Smart Battery B13960S',
    tagline: '20,000 mAh / 962 Wh - IP65 rated lithium polymer',
    mainImage: '/images/products/smart-battery/09-017-00025-1.png',
    price: 494000,
    priceEUR: 114900,
    compareAtPrice: 743600,
    compareAtPriceEUR: 172900,
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
  },
  {
    id: '01-027-01895',
    sku: '01-027-01895',
    slug: '01-027-01895',
    name: 'B13960S Battery Outlet Socket',
    tagline: 'Battery outlet socket component',
    mainImage: '/images/products/smart-battery/01-027-01895-1.png',
    price: 57200,
    priceEUR: 13300,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
  },
  {
    id: '05-002-00759',
    sku: '05-002-00759',
    slug: '05-002-00759',
    name: 'B13860S V4 Smart Battery PCBA',
    tagline: 'Smart battery control board',
    mainImage: '/images/products/smart-battery/05-002-00759.jpg',
    price: 74100,
    priceEUR: 17200,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
  },

  // ==================== BATTERY CHARGERS ====================
  {
    id: 'PC-PCK-10000',
    sku: 'PC-PCK-10000',
    slug: 'PC-PCK-10000',
    name: 'XAG Parallel Charging Kit Combo',
    tagline: '6KW parallel charging kit with mounting bracket',
    mainImage: '/images/products/battery-chargers/pc-pck-10000-1.jpg',
    price: 88400,
    priceEUR: 20600,
    compareAtPrice: 96200,
    compareAtPriceEUR: 22400,
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
  },
  {
    id: '09-017-00069',
    sku: '09-017-00069',
    slug: '09-017-00069',
    name: 'XAG Battery S-Charger CM13600S',
    tagline: 'Forced air-cooling charger for B13960S/B13970S/B141050',
    mainImage: '/images/products/battery-chargers/09-017-00069-1.jpg',
    price: 494000,
    priceEUR: 114900,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
  },
  {
    id: '09-017-00059',
    sku: '09-017-00059',
    slug: '09-017-00059',
    name: 'XAG Battery E-Charger CM15300D',
    tagline: 'High-power battery charging solution',
    mainImage: '/images/products/battery-chargers/09-017-00059-1.jpg',
    price: 600600,
    priceEUR: 139700,
    compareAtPrice: 772200,
    compareAtPriceEUR: 179600,
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
  },
  {
    id: '09-017-00065',
    sku: '09-017-00065',
    slug: '09-017-00065',
    name: 'XAG Mist-Cooling Charging Station',
    tagline: 'Cooling and charging station for XAG batteries',
    mainImage: '/images/products/battery-chargers/09-017-00065-1.jpg',
    price: 92300,
    priceEUR: 21500,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
  },
  {
    id: '09-017-00028',
    sku: '09-017-00028',
    slug: '09-017-00028',
    name: 'XAG 2022 Mod Water-Cool Charging Tank',
    tagline: 'Water-cooling charging tank for efficient battery charging',
    mainImage: '/images/products/battery-chargers/09-017-00028-3.png',
    price: 85800,
    priceEUR: 19900,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
  },

  // ==================== TASK SYSTEM ====================
  {
    id: '09-023-00025',
    sku: '09-023-00025',
    slug: '09-023-00025',
    name: 'XAG P100 Pro RevoSpray P3',
    tagline: '50L spray system with centrifugal atomizing nozzles',
    mainImage: '/images/products/task-system/09-023-00025-1.jpg',
    price: 910000,
    priceEUR: 211600,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
  },
  {
    id: '09-023-00055',
    sku: '09-023-00055',
    slug: '09-023-00055',
    name: 'XAG P150 RevoSpray P4',
    tagline: 'Advanced spray system for P150 platform',
    mainImage: '/images/products/task-system/09-023-00055.jpg',
    price: 910000,
    priceEUR: 211600,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
  },
  {
    id: '09-023-00054',
    sku: '09-023-00054',
    slug: '09-023-00054',
    name: 'XAG P150 RevoCast P4',
    tagline: 'Spreading system for P150 platform',
    mainImage: '/images/products/task-system/09-023-00054.jpg',
    price: 1040000,
    priceEUR: 241900,
    compareAtPrice: 1170000,
    compareAtPriceEUR: 272100,
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
  },
  {
    id: '05-002-02262',
    sku: '05-002-02262',
    slug: '05-002-02262',
    name: 'XAG P100 Pro Upgrade Kit - 60L Container',
    tagline: '60L Smart Tank with Sub-Cover Refill Design',
    mainImage: '/images/products/task-system/05-002-02262.jpg',
    price: 743600,
    priceEUR: 172900,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
  },
  {
    id: '09-023-00023',
    sku: '09-023-00023',
    slug: '09-023-00023',
    name: 'XAG P100 Pro RevoCast P3',
    tagline: '80L spreader system for dry solids 1-6mm',
    mainImage: '/images/products/task-system/09-023-00023-1.png',
    price: 1170000,
    priceEUR: 272100,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
  },

  // ==================== REMOTE CONTROLLER ====================
  {
    id: '09-016-00085',
    sku: '09-016-00085',
    slug: '09-016-00085',
    name: 'XAG Remote Controller SRC5',
    tagline: '7.02" display, 20000mAh, 2km range',
    mainImage: '/images/products/remote-controller/09-016-00085-2.png',
    price: 598000,
    priceEUR: 139100,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Remote Controller',
    type: 'ACCESSORY',
  },
  {
    id: '09-016-00053',
    sku: '09-016-00053',
    slug: '09-016-00053',
    name: 'XAG RC ARC3 Pro',
    tagline: 'Compact controller with RTK positioning',
    mainImage: '/images/products/remote-controller/09-016-00053-2.png',
    price: 546000,
    priceEUR: 127000,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'Remote Controller',
    type: 'ACCESSORY',
  },

  // ==================== GNSS RTK ====================
  {
    id: '09-016-00083',
    sku: '09-016-00083',
    slug: '09-016-00083',
    name: 'XAG GNSS XRTK7 Mobile Station',
    tagline: 'Portable RTK with <5cm accuracy, 2km range',
    mainImage: '/images/products/gnss-rtk/09-016-00083-1.png',
    price: 475800,
    priceEUR: 110700,
    compareAtPrice: 603200,
    compareAtPriceEUR: 140300,
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
  },
  {
    id: '09-010-00019',
    sku: '09-010-00019',
    slug: '09-010-00019',
    name: 'XAG GNSS RTK Fix Station',
    tagline: 'High-precision RTK module ±10mm accuracy',
    mainImage: '/images/products/gnss-rtk/09-010-00019-1.png',
    price: 1154400,
    priceEUR: 268500,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
  },
  {
    id: '09-010-00036',
    sku: '09-010-00036',
    slug: '09-010-00036',
    name: 'XAG GNSS XRTK4 Rover',
    tagline: 'RTK positioning module for agricultural use',
    mainImage: '/images/products/gnss-rtk/09-010-00036-1.jpg',
    price: 1144000,
    priceEUR: 266000,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
  },
  {
    id: '13-001-00056',
    sku: '13-001-00056',
    slug: '13-001-00056',
    name: 'XAG Station Tripod',
    tagline: 'Tripod for GNSS RTK stations',
    mainImage: '/images/products/gnss-rtk/13-001-00056-1.png',
    price: 67600,
    priceEUR: 15700,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
  },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const t = useTranslations('products');

  const [category, setCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync category state with URL parameter changes
  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam]);

  const categories = [
    { value: '', label: t('allProducts') },
    { value: 'airborne', label: t('airborne') },
    { value: 'landborne', label: t('landborne') },
    { value: 'accessories', label: t('allAccessories') },
    { value: 'smart-battery', label: t('smartBattery') },
    { value: 'battery-chargers', label: t('batteryChargers') },
    { value: 'task-system', label: t('taskSystem') },
    { value: 'remote-controller', label: t('remoteController') },
    { value: 'gnss-rtk', label: t('gnssRtk') },
    { value: 'parts', label: t('spareParts') },
  ];

  const sortOptions = [
    { value: 'featured', label: t('featured') },
    { value: 'price-asc', label: t('priceLowHigh') },
    { value: 'price-desc', label: t('priceHighLow') },
    { value: 'name-asc', label: t('nameAZ') },
    { value: 'name-desc', label: t('nameZA') },
  ];

  const filteredProducts = useMemo(() => {
    let products = [...mockProducts];

    if (category) {
      if (category === 'accessories') {
        const accessoryCategories = ['smart battery', 'battery chargers', 'task system', 'remote controller', 'gnss rtk'];
        products = products.filter(
          (p) => accessoryCategories.includes(p.category.toLowerCase())
        );
      } else {
        // Convert URL parameter (smart-battery) to product category format (Smart Battery)
        const categoryNormalized = category.toLowerCase().replace(/-/g, ' ');
        products = products.filter(
          (p) => p.category.toLowerCase() === categoryNormalized
        );
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.tagline?.toLowerCase().includes(query)
      );
    }

    switch (sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        products.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return products;
  }, [category, sortBy, searchQuery]);

  const getCurrentCategoryLabel = () => {
    return categories.find((c) => c.value === category)?.label || t('allProducts');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white">{t('home')}</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">{t('breadcrumbProducts')}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold">
            {getCurrentCategoryLabel()}
          </h1>
          <p className="text-gray-300 mt-2">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-white min-w-[180px]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-white min-w-[180px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(category || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">{t('activeFilters')}</span>
              {category && (
                <button
                  onClick={() => setCategory('')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                >
                  {getCurrentCategoryLabel()}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                >
                  &quot;{searchQuery}&quot;
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => {
                  setCategory('');
                  setSearchQuery('');
                }}
                className="text-sm text-brand-red hover:underline ml-2"
              >
                {t('clearAll')}
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {t('showing')} <span className="font-semibold">{filteredProducts.length}</span> {t('productsCount')}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noProductsFound')}</h3>
            <p className="text-gray-500 mb-6">
              {t('noProductsMessage')}
            </p>
            <button
              onClick={() => {
                setCategory('');
                setSearchQuery('');
              }}
              className="btn-secondary"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
