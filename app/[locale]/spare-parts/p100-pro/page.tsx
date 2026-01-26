'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { ProductImage } from '@/components/ui/ProductImage';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cart';

interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
  priceEUR: number;
  stock: number;
  mainImage: string | null;
  isActive: boolean;
}

export default function P100ProSparePartsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'sku' | 'price'>('sku');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?category=P100 Pro&limit=500');
      const data = await res.json();
      setProducts(data.products?.filter((p: Product) => p.isActive) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'sku') {
        comparison = a.sku.localeCompare(b.sku);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
    }).format(cents / 100);
  };

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      priceEUR: product.priceEUR,
      quantity: 1,
      image: product.mainImage || '',
      sku: product.sku,
    });
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
            <Link href="/spare-parts" className="hover:text-white">Spare Parts</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">P100 Pro</span>
          </nav>
          <div className="flex items-center gap-6">
            <div className="hidden md:block w-24 h-24 bg-white/10 rounded-xl p-2">
              <Image
                src="/images/products/drones/09-007-00136-1.png"
                alt="P100 Pro"
                width={80}
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">P100 Pro Spare Parts</h1>
              <p className="text-gray-300 mt-2">
                {loading ? 'Loading...' : `${products.length} spare parts available`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-white"
              >
                <option value="sku">Sort by SKU</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
          </div>
        )}

        {/* Products Grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                  <ProductImage
                    src={product.mainImage}
                    alt={product.name}
                    fill
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs font-mono text-gray-400 mb-1">{product.sku}</p>
                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[48px]">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-brand-red">
                      {formatPrice(product.price)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="w-full py-2 bg-brand-red text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {tc('addToCart')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No parts found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try a different search term.' : 'No spare parts available yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
