'use client';

import { useState, useEffect, useCallback } from 'react';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  specifications: string | null;
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
  preorderEnabled: boolean;
  preorderLeadTime: string | null;
  translations?: Record<string, { name: string; tagline: string; description: string }>;
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

  // Locale selector for translations
  const [selectedLocale, setSelectedLocale] = useState<'en' | 'es' | 'pl'>('en');
  const [translations, setTranslations] = useState<Record<string, { name: string; tagline: string; description: string }>>({
    en: { name: '', tagline: '', description: '' },
    es: { name: '', tagline: '', description: '' },
    pl: { name: '', tagline: '', description: '' },
  });

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    slug: '',
    tagline: '',
    description: '',
    specifications: '',
    mainImage: '',
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
    preorderEnabled: false,
    preorderLeadTime: '',
  });
  
  // Image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Calculate EUR from PLN
  const calculateEUR = useCallback((plnCents: number): number => {
    if (!exchangeRate || plnCents === 0) return 0;
    return Math.round(plnCents / exchangeRate);
  }, [exchangeRate]);

  // Fetch exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=PLN');
        const data = await response.json();
        if (data.rates?.PLN) {
          setExchangeRate(data.rates.PLN);
          setRateDate(data.date);
        }
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
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

  // Update formData when locale changes
  useEffect(() => {
    const currentTranslation = translations[selectedLocale];
    if (currentTranslation) {
      setFormData(prev => ({
        ...prev,
        description: currentTranslation.description || '',
      }));
    }
  }, [selectedLocale, translations]);

  const fetchProduct = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      const found = data.products?.find((p: Product) => p.id === productId);

      if (found) {
        setProduct(found);
        
        // Load translations from API
        if (found.translations) {
          setTranslations({
            en: found.translations.en || { name: '', tagline: '', description: '' },
            es: found.translations.es || { name: '', tagline: '', description: '' },
            pl: found.translations.pl || { name: '', tagline: '', description: '' },
          });
        }
        
        // Use the current locale's description
        const currentDesc = found.translations?.[selectedLocale]?.description || found.description || '';
        
        setFormData({
          name: found.name || '',
          sku: found.sku || '',
          slug: found.slug || '',
          tagline: found.tagline || '',
          description: currentDesc,
          specifications: found.specifications || '',
          mainImage: found.mainImage || '',
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
          preorderEnabled: found.preorderEnabled ?? false,
          preorderLeadTime: found.preorderLeadTime || '',
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

  // Handle description change - update the current locale's translation
  const handleDescriptionChange = (html: string) => {
    setFormData(prev => ({ ...prev, description: html }));
    setTranslations(prev => ({
      ...prev,
      [selectedLocale]: {
        ...prev[selectedLocale],
        description: html,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Save only the current locale's description
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

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', 'products');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setFormData(prev => ({ ...prev, mainImage: data.url }));
      } else {
        setUploadError(data.error || 'Error al subir imagen');
      }
    } catch (err) {
      setUploadError('Error al subir imagen');
    } finally {
      setIsUploading(false);
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 bg-white"
              >
                <option value="">Seleccionar categoria...</option>
                <option value="Airborne">Airborne (Drones)</option>
                <option value="Landborne">Landborne (Robots)</option>
                <option value="Smart Battery">Smart Battery</option>
                <option value="Battery Chargers">Battery Chargers</option>
                <option value="Task System">Task System</option>
                <option value="Remote Controller">Remote Controller</option>
                <option value="GNSS RTK">GNSS RTK</option>
                <option value="Accessories">Accessories</option>
                <option value="Spare Parts">Spare Parts</option>
              </select>
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


        {/* Image */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Imagen del Producto</h2>
          <div className="space-y-4">
            {/* Current image preview */}
            {formData.mainImage && (
              <div className="relative w-48 h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={formData.mainImage}
                  alt="Producto"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mainImage: '' }))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {/* Upload input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.mainImage ? 'Cambiar imagen' : 'Subir imagen'}
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-dashed border-gray-300 transition-colors">
                  <span className="text-sm text-gray-600">
                    {isUploading ? 'Subiendo...' : 'Seleccionar archivo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
                {isUploading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-red"></div>
                )}
              </div>
              {uploadError && (
                <p className="text-sm text-red-600 mt-2">{uploadError}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Formatos: JPG, PNG, WebP, GIF, AVIF. Maximo 5MB
              </p>
            </div>

            {/* Manual URL input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                O ingresar URL de imagen manualmente
              </label>
              <input
                type="text"
                name="mainImage"
                value={formData.mainImage}
                onChange={handleChange}
                placeholder="/images/products/mi-imagen.jpg"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
          </div>
        </div>

        {/* Content - Description & Specifications */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Contenido</h2>
            <div className="flex gap-1">
              {(['en', 'es', 'pl'] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setSelectedLocale(loc)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedLocale === loc
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {loc.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripcion ({selectedLocale.toUpperCase()})
              </label>
              <RichTextEditor
                key={selectedLocale}
                content={formData.description}
                onChange={handleDescriptionChange}
                placeholder="Descripcion detallada del producto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especificaciones
              </label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleChange}
                rows={6}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 resize-y"
                placeholder="Especificaciones tecnicas del producto (formato libre o JSON)..."
              />
              <p className="text-xs text-gray-400 mt-1">
                Puedes usar formato de lista o JSON para las especificaciones
              </p>
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
                Precio PLN (brutto)
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
              />
              <p className="text-xs text-green-600 mt-1">
                = {formatPrice(formData.priceEUR)} EUR (calculado automaticamente)
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio anterior PLN (brutto)
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
          <div className="flex flex-wrap gap-6 mb-4">
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="preorderEnabled"
                checked={formData.preorderEnabled}
                onChange={handleChange}
                className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Preorder habilitado</span>
              <span className="text-xs text-orange-500">(cuando stock = 0)</span>
            </label>
          </div>

          {/* Preorder Lead Time - only show when preorder is enabled */}
          {formData.preorderEnabled && (
            <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <label className="block text-sm font-medium text-orange-700 mb-2">
                Tiempo de espera estimado
              </label>
              <input
                type="text"
                name="preorderLeadTime"
                value={formData.preorderLeadTime}
                onChange={handleChange}
                placeholder="Ej: 2-3 semanas, 4-6 semanas, 1 mes"
                className="w-full md:w-1/2 px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <p className="text-xs text-orange-600 mt-1">
                Este tiempo se mostrara a los clientes en la pagina del producto
              </p>
            </div>
          )}
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
