'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  mainImage: string | null;
  images: string | null;
  price: number;
  priceEUR: number;
  compareAtPrice: number | null;
  compareAtPriceEUR: number | null;
  stock: number;
  lowStockThreshold: number;
  category: string;
  type: string;
  isActive: boolean;
  isFeatured: boolean;
}

const formatPrice = (cents: number) => {
  return (cents / 100).toFixed(2);
};

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState<string>('');
  const [rateLoading, setRateLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    tagline: '',
    description: '',
    price: 0,
    priceEUR: 0,
    compareAtPrice: 0,
    compareAtPriceEUR: 0,
    stock: 0,
    lowStockThreshold: 5,
    category: '',
    type: 'PRODUCT',
    isActive: true,
    isFeatured: false,
  });

  // Calculate EUR from PLN
  const calculateEUR = useCallback((plnCents: number): number => {
    if (!exchangeRate || plnCents === 0) return 0;
    // PLN to EUR: divide by rate
    // plnCents / rate = eurCents
    return Math.round(plnCents / exchangeRate);
  }, [exchangeRate]);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Using frankfurter.app - free API for ECB rates
        const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=PLN');
        const data = await response.json();
        if (data.rates?.PLN) {
          setExchangeRate(data.rates.PLN);
          setRateDate(data.date);
        }
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
        // Fallback rate if API fails
        setExchangeRate(4.30);
        setRateDate('fallback');
      } finally {
        setRateLoading(false);
      }
    };
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Update EUR prices when PLN changes or rate loads
  useEffect(() => {
    if (exchangeRate && formData.price > 0) {
      setFormData(prev => ({
        ...prev,
        priceEUR: calculateEUR(prev.price),
        compareAtPriceEUR: prev.compareAtPrice > 0 ? calculateEUR(prev.compareAtPrice) : 0,
      }));
    }
  }, [exchangeRate, calculateEUR]);

  const fetchProduct = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      const found = data.products?.find((p: Product) => p.id === productId);

      if (found) {
        setProduct(found);
        setFormData({
          name: found.name || '',
          sku: found.sku || '',
          slug: found.slug || '',
          tagline: found.tagline || '',
          description: found.description || '',
          price: found.price || 0,
          priceEUR: found.priceEUR || 0,
          compareAtPrice: found.compareAtPrice || 0,
          compareAtPriceEUR: found.compareAtPriceEUR || 0,
          stock: found.stock || 0,
          lowStockThreshold: found.lowStockThreshold || 5,
          category: found.category || '',
          type: found.type || 'PRODUCT',
          isActive: found.isActive ?? true,
          isFeatured: found.isFeatured ?? false,
        });
      } else {
        setError('Producto no encontrado');
      }
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('Error al cargar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: productId,
          ...formData,
          compareAtPrice: formData.compareAtPrice || null,
          compareAtPriceEUR: formData.compareAtPriceEUR || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'Error al guardar');
      }
    } catch (err) {
      console.error('Failed to save product:', err);
      setError('Error al guardar el producto');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value) || 0;

    if (name === 'price') {
      setFormData(prev => ({
        ...prev,
        price: numValue,
        priceEUR: calculateEUR(numValue),
      }));
    } else if (name === 'compareAtPrice') {
      setFormData(prev => ({
        ...prev,
        compareAtPrice: numValue,
        compareAtPriceEUR: numValue > 0 ? calculateEUR(numValue) : 0,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/admin/products" className="text-brand-red hover:underline">
          Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Editar Producto</h1>
            <p className="text-gray-500">{product?.name}</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Producto guardado correctamente
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Informacion Basica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug (URL)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tagline
              </label>
              <input
                type="text"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Precios</h2>
            {!rateLoading && exchangeRate && (
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                1 EUR = {exchangeRate.toFixed(2)} PLN
                {rateDate !== 'fallback' && <span className="text-xs ml-1">({rateDate})</span>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio PLN (grosze)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                = {formatPrice(formData.price)} PLN
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio EUR (auto)
              </label>
              <input
                type="number"
                name="priceEUR"
                value={formData.priceEUR}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                readOnly
              />
              <p className="text-xs text-green-600 mt-1">
                = {formatPrice(formData.priceEUR)} EUR (calculado automaticamente)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio anterior PLN (grosze)
              </label>
              <input
                type="number"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
              <p className="text-xs text-gray-400 mt-1">
                {formData.compareAtPrice > 0 ? `= ${formatPrice(formData.compareAtPrice)} PLN (precio tachado)` : 'Dejar en 0 si no hay descuento'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio anterior EUR (auto)
              </label>
              <input
                type="number"
                name="compareAtPriceEUR"
                value={formData.compareAtPriceEUR}
                className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-600"
                readOnly
              />
              <p className="text-xs text-green-600 mt-1">
                {formData.compareAtPriceEUR > 0 ? `= ${formatPrice(formData.compareAtPriceEUR)} EUR (calculado)` : 'Se calcula automaticamente'}
              </p>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Inventario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Umbral stock bajo
              </label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Estado</h2>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
              />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="rounded border-gray-300 text-brand-red focus:ring-brand-red"
              />
              <span className="text-sm text-gray-700">Destacado</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href="/admin/products"
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
