'use client';

import { useState } from 'react';
import Image from 'next/image';

// Mock inventory data
const mockInventory = [
  { id: '1', sku: '09-017-00064', name: 'Smart Battery B13970S', category: 'Smart Battery', stock: 0, lowStockThreshold: 5, lastUpdated: '2024-01-20', image: '/images/products/smart-battery/09-017-00064-1.jpg' },
  { id: '2', sku: '09-017-00025', name: 'Smart Battery B13960S', category: 'Smart Battery', stock: 2, lowStockThreshold: 5, lastUpdated: '2024-01-21', image: '/images/products/smart-battery/09-017-00025-1.png' },
  { id: '3', sku: '09-017-00069', name: 'S-Charger CM13600S', category: 'Battery Chargers', stock: 4, lowStockThreshold: 5, lastUpdated: '2024-01-19', image: '/images/products/battery-chargers/09-017-00069-1.jpg' },
  { id: '4', sku: '09-023-00025', name: 'RevoSpray P3', category: 'Task System', stock: 0, lowStockThreshold: 2, lastUpdated: '2024-01-18', image: '/images/products/task-system/09-023-00025-1.jpg' },
  { id: '5', sku: '09-016-00085', name: 'Remote Controller SRC5', category: 'Remote Controller', stock: 1, lowStockThreshold: 3, lastUpdated: '2024-01-21', image: '/images/products/remote-controller/09-016-00085-2.png' },
  { id: '6', sku: '09-016-00083', name: 'GNSS XRTK7 Mobile Station', category: 'GNSS RTK', stock: 3, lowStockThreshold: 5, lastUpdated: '2024-01-20', image: '/images/products/gnss-rtk/09-016-00083-1.png' },
  { id: '7', sku: 'AU-XAG-PROP4', name: 'P100 Pro Basic Package', category: 'Airborne', stock: 0, lowStockThreshold: 1, lastUpdated: '2024-01-17', image: '/images/products/drones/au-xag-prop4-1.png' },
  { id: '8', sku: '09-007-00136', name: 'P100 Pro', category: 'Airborne', stock: 0, lowStockThreshold: 1, lastUpdated: '2024-01-16', image: '/images/products/drones/09-007-00136-1.png' },
  { id: '9', sku: 'AU-XAG-PROP5', name: 'P100 Pro Spreader Package', category: 'Airborne', stock: 0, lowStockThreshold: 1, lastUpdated: '2024-01-15', image: '/images/products/drones/au-xag-prop5-1.png' },
];

type AdjustmentModalData = {
  product: typeof mockInventory[0];
  type: 'add' | 'remove' | 'set';
} | null;

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [adjustmentModal, setAdjustmentModal] = useState<AdjustmentModalData>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const filteredInventory = mockInventory.filter(item => {
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
    total: mockInventory.length,
    outOfStock: mockInventory.filter(i => i.stock === 0).length,
    lowStock: mockInventory.filter(i => i.stock > 0 && i.stock <= i.lowStockThreshold).length,
    healthy: mockInventory.filter(i => i.stock > i.lowStockThreshold).length,
  };

  const getStockStatus = (stock: number, threshold: number) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (stock <= threshold) return { label: 'Low Stock', color: 'bg-orange-100 text-orange-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const handleAdjust = () => {
    // In real app, this would call API
    console.log('Adjusting:', adjustmentModal?.product.sku, adjustmentModal?.type, adjustmentValue, adjustmentReason);
    setAdjustmentModal(null);
    setAdjustmentValue('');
    setAdjustmentReason('');
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-500">Track and manage product stock levels</p>
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
          <p className="text-2xl font-bold text-green-600">{stats.healthy}</p>
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
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-xag-green/50"
            />
          </div>

          {/* Stock filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-xag-green/50"
          >
            <option value="all">All Products</option>
            <option value="out">Out of Stock</option>
            <option value="low">Low Stock</option>
            <option value="ok">Healthy Stock</option>
          </select>

          {/* Export */}
          <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInventory.map((item) => {
                const status = getStockStatus(item.stock, item.lowStockThreshold);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={40}
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
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${item.stock === 0 ? 'text-red-600' : item.stock <= item.lowStockThreshold ? 'text-orange-600' : 'text-green-600'}`}>
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
                    <td className="px-4 py-3 text-sm text-gray-500">{item.lastUpdated}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setAdjustmentModal({ product: item, type: 'add' })}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
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
              })}
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-xag-green/50"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-xag-green/50"
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
                className="px-4 py-2 bg-xag-green text-white rounded-lg hover:bg-xag-green/90 disabled:opacity-50"
              >
                {adjustmentModal.type === 'add' && 'Add Stock'}
                {adjustmentModal.type === 'remove' && 'Remove Stock'}
                {adjustmentModal.type === 'set' && 'Update Stock'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
