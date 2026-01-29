'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  tagline: string | null;
  mainImage: string | null;
  price: number;
  priceEUR: number;
  stock: number;
  lowStockThreshold: number;
  category: string;
  type: string;
  isActive: boolean;
  updatedAt: string;
}

type AdjustmentModalData = {
  product: Product;
  type: 'add' | 'remove' | 'set';
} | null;

const CATEGORIES = [
  'Airborne',
  'Landborne',
  'Smart Battery',
  'Battery Chargers',
  'Task System',
  'Remote Controller',
  'GNSS RTK',
  'Spare Parts',
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [adjustmentModal, setAdjustmentModal] = useState<AdjustmentModalData>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productForm, setProductForm] = useState({
    sku: '',
    slug: '',
    name: '',
    tagline: '',
    mainImage: '',
    price: '',
    priceEUR: '',
    stock: '0',
    lowStockThreshold: '5',
    category: 'Spare Parts',
    type: 'PRODUCT',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                          item.sku.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'low') return matchesSearch && item.stock > 0 && item.stock <= item.lowStockThreshold;
    if (filter === 'out') return matchesSearch && item.stock === 0;
    if (filter === 'ok') return matchesSearch && item.stock > item.lowStockThreshold;
    return matchesSearch;
  });

  // Stats
  const stats = {
    total: products.length,
    outOfStock: products.filter(i => i.stock === 0).length,
    lowStock: products.filter(i => i.stock > 0 && i.stock <= i.lowStockThreshold).length,
    healthy: products.filter(i => i.stock > i.lowStockThreshold).length,
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= threshold) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const handleAdjust = async () => {
    if (!adjustmentModal || !adjustmentValue) return;

    try {
      const response = await fetch('/api/admin/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustmentModal.product.id,
          adjustment: parseInt(adjustmentValue),
          type: adjustmentModal.type,
          reason: adjustmentReason,
        }),
      });

      if (response.ok) {
        fetchProducts();
        setAdjustmentModal(null);
        setAdjustmentValue('');
        setAdjustmentReason('');
      }
    } catch (error) {
      console.error('Failed to adjust stock:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'products');

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        setProductForm({ ...productForm, mainImage: data.url });
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          price: parseInt(productForm.price) || 0,
          priceEUR: parseInt(productForm.priceEUR) || 0,
          stock: parseInt(productForm.stock) || 0,
          lowStockThreshold: parseInt(productForm.lowStockThreshold) || 5,
        }),
      });

      if (response.ok) {
        fetchProducts();
        setShowProductModal(false);
        setProductForm({
          sku: '',
          slug: '',
          name: '',
          tagline: '',
          mainImage: '',
          price: '',
          priceEUR: '',
          stock: '0',
          lowStockThreshold: '5',
          category: 'Spare Parts',
          type: 'PRODUCT',
        });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create product');
      }
    } catch (error) {
      console.error('Failed to create product:', error);
    }
  };

  const VAT_RATE = 0.23; // 23% VAT in Poland

  const formatPrice = (cents: number, currency: string) => {
    return (cents / 100).toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ' + currency;
  };

  // Calculate Netto from Brutto (prices stored are Brutto with 23% VAT)
  const calculateNetto = (brutto: number) => {
    return Math.round(brutto / (1 + VAT_RATE));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Track and manage product stock levels</p>
        </div>
        <button
          onClick={() => setShowProductModal(true)}
          className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-2xl font-bold text-orange-600">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-sm text-gray-500">Healthy Stock</p>
          <p className="text-2xl font-bold text-brand-red">{stats.healthy}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            />
          </div>

          {/* Stock filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
          >
            <option value="all">All Products</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="ok">Healthy Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (PLN)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                    {products.length === 0 ? 'No products yet. Click "Add Product" to create one.' : 'No products match your search.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => {
                  const status = getStockStatus(item.stock, item.lowStockThreshold);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {item.mainImage ? (
                              <Image
                                src={item.mainImage}
                                alt={item.name}
                                width={40}
                                height={40}
                                unoptimized
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-[200px]">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{item.sku}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatPrice(calculateNetto(item.price), 'PLN')} <span className="text-xs text-gray-500">netto</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatPrice(item.price, 'PLN')} brutto
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${item.stock === 0 ? 'text-red-600' : item.stock <= item.lowStockThreshold ? 'text-orange-600' : 'text-brand-red'}`}>
                            {item.stock}
                          </span>
                          <span className="text-xs text-gray-400">/ {item.lowStockThreshold} min</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setAdjustmentModal({ product: item, type: 'add' })}
                            className="p-2 text-brand-red hover:bg-red-50 rounded-lg"
                            title="Add Stock"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setAdjustmentModal({ product: item, type: 'remove' })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Remove Stock"
                            disabled={item.stock === 0}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setAdjustmentModal({ product: item, type: 'set' })}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Set Stock"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjustment Modal */}
      {adjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {adjustmentModal.type === 'add' && 'Add Stock'}
                {adjustmentModal.type === 'remove' && 'Remove Stock'}
                {adjustmentModal.type === 'set' && 'Set Stock Level'}
              </h3>
              <p className="text-sm text-gray-500">{adjustmentModal.product.name}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {adjustmentModal.type === 'set' ? 'New Stock Level' : 'Quantity'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="Enter quantity"
                />
                {adjustmentModal.type !== 'set' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current stock: {adjustmentModal.product.stock}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="e.g., Restock, Inventory count, Damaged"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setAdjustmentModal(null);
                  setAdjustmentValue('');
                  setAdjustmentReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjust}
                disabled={!adjustmentValue}
                className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover disabled:opacity-50"
              >
                {adjustmentModal.type === 'add' && 'Add Stock'}
                {adjustmentModal.type === 'remove' && 'Remove Stock'}
                {adjustmentModal.type === 'set' && 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
            </div>
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              {/* Row 1: SKU, Slug, Name */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    placeholder="09-017-00064"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    placeholder="smart-battery-b13970s"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    required
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="XAG Smart Battery B13970S"
                  required
                />
              </div>

              {/* Row 3: Tagline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={productForm.tagline}
                  onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="High-capacity smart battery for P150 series"
                />
              </div>

              {/* Row 4: Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Image</label>
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={productForm.mainImage}
                      onChange={(e) => setProductForm({ ...productForm, mainImage: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                      placeholder="URL or upload an image"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {isUploading ? (
                          <>
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-600">Upload Image</span>
                          </>
                        )}
                      </label>
                      <span className="text-xs text-gray-400">JPG, PNG, WebP (max 5MB)</span>
                    </div>
                  </div>
                  {productForm.mainImage && (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                      <Image
                        src={productForm.mainImage}
                        alt="Preview"
                        width={96}
                        height={96}
                        unoptimized
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Row 5: Prices */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price PLN Brutto (brutto)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    placeholder="743600"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">{productForm.price ? formatPrice(calculateNetto(parseInt(productForm.price)), 'PLN') : '0,00 PLN'}</span> netto
                  </p>
                  <p className="text-xs text-gray-500">
                    {productForm.price ? formatPrice(parseInt(productForm.price), 'PLN') : '0,00 PLN'} brutto
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price EUR Brutto (cents)</label>
                  <input
                    type="number"
                    value={productForm.priceEUR}
                    onChange={(e) => setProductForm({ ...productForm, priceEUR: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    placeholder="172900"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-medium">{productForm.priceEUR ? formatPrice(calculateNetto(parseInt(productForm.priceEUR)), 'EUR') : '0,00 EUR'}</span> netto
                  </p>
                  <p className="text-xs text-gray-500">
                    {productForm.priceEUR ? formatPrice(parseInt(productForm.priceEUR), 'EUR') : '0,00 EUR'} brutto
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    value={productForm.lowStockThreshold}
                    onChange={(e) => setProductForm({ ...productForm, lowStockThreshold: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red-hover"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
