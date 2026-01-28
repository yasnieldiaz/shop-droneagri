'use client';

import { useEffect, useState } from 'react';

interface B2BCustomer {
  id: string;
  email: string;
  companyName: string;
  vatNumber: string;
  country: string;
  region: string;
  contactName: string;
  contactPhone: string | null;
  street: string;
  city: string;
  postalCode: string;
  viesValidated: boolean;
  viesValidatedAt: string | null;
  status: string;
  approvedAt: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

interface B2BPrice {
  id: string;
  productId: string;
  productSku: string;
  pricePL: number;
  priceEU: number;
  discountPL: number | null;
  discountEU: number | null;
  b2bCustomerId: string | null;
  b2bCustomer: {
    id: string;
    companyName: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  price: number;
}

export default function B2BAdminPage() {
  const [activeTab, setActiveTab] = useState<'customers' | 'prices'>('customers');
  const [customers, setCustomers] = useState<B2BCustomer[]>([]);
  const [prices, setPrices] = useState<B2BPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<B2BPrice | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<B2BCustomer | null>(null);
  const [isValidatingVies, setIsValidatingVies] = useState(false);
  const [viesResult, setViesResult] = useState<{
    valid: boolean;
    companyName?: string;
    companyAddress?: string;
    error?: string;
  } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    email: '',
    password: '',
    companyName: '',
    vatNumber: '',
    country: 'PL',
    region: 'POLAND',
    contactName: '',
    contactPhone: '',
    street: '',
    city: '',
    postalCode: '',
    status: 'approved',
  });

  // Price form state
  const [priceForm, setPriceForm] = useState({
    productId: '',
    productSku: '',
    pricePL: '',
    priceEU: '',
    discountPL: '',
    discountEU: '',
    b2bCustomerId: '',
  });


  // Apply to all products state
  const [applyToAll, setApplyToAll] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [customersRes, pricesRes, productsRes] = await Promise.all([
        fetch('/api/admin/b2b/customers'),
        fetch('/api/admin/b2b/prices'),
        fetch('/api/admin/products'),
      ]);

      const customersData = await customersRes.json();
      const pricesData = await pricesRes.json();
      const productsData = await productsRes.json();

      setCustomers(customersData.customers || []);
      setPrices(pricesData.prices || []);
      setProducts(productsData.products || []);
    } catch (error) {
      console.error('Failed to fetch B2B data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomerStatus = async (customerId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/b2b/customers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status }),
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update customer status:', error);
    }
  };

  const deleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`/api/admin/b2b/customers?id=${customerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingCustomer ? 'PUT' : 'POST';
      const body = editingCustomer
        ? { customerId: editingCustomer.id, ...customerForm }
        : customerForm;

      const response = await fetch('/api/admin/b2b/customers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowCustomerModal(false);
        setEditingCustomer(null);
        setCustomerForm({
          email: '',
          password: '',
          companyName: '',
          vatNumber: '',
          country: 'PL',
          region: 'POLAND',
          contactName: '',
          contactPhone: '',
          street: '',
          city: '',
          postalCode: '',
          status: 'approved',
        });
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save customer');
      }
    } catch (error) {
      console.error('Failed to save customer:', error);
    }
  };

  const openEditCustomerModal = (customer: B2BCustomer) => {
    setEditingCustomer(customer);
    setViesResult(null);
    setCustomerForm({
      email: customer.email,
      password: '',
      companyName: customer.companyName,
      vatNumber: customer.vatNumber || '',
      country: customer.country,
      region: customer.region,
      contactName: customer.contactName,
      contactPhone: customer.contactPhone || '',
      street: customer.street,
      city: customer.city,
      postalCode: customer.postalCode,
      status: customer.status,
    });
    setShowCustomerModal(true);
  };

  const openNewCustomerModal = () => {
    setEditingCustomer(null);
    setViesResult(null);
    setCustomerForm({
      email: '',
      password: '',
      companyName: '',
      vatNumber: '',
      country: 'PL',
      region: 'POLAND',
      contactName: '',
      contactPhone: '',
      street: '',
      city: '',
      postalCode: '',
      status: 'approved',
    });
    setShowCustomerModal(true);
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // If applying to all products
      if (applyToAll) {
        setIsBulkSaving(true);
        let successCount = 0;
        let errorCount = 0;

        for (const product of products) {
          try {
            const response = await fetch('/api/admin/b2b/prices', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: product.slug,
                productSku: product.sku,
                pricePL: priceForm.pricePL ? parseInt(priceForm.pricePL) : 0,
                priceEU: priceForm.priceEU ? parseInt(priceForm.priceEU) : 0,
                discountPL: priceForm.discountPL ? parseFloat(priceForm.discountPL) : null,
                discountEU: priceForm.discountEU ? parseFloat(priceForm.discountEU) : null,
                b2bCustomerId: priceForm.b2bCustomerId || null,
              }),
            });

            if (response.ok) {
              successCount++;
            } else {
              errorCount++;
            }
          } catch {
            errorCount++;
          }
        }

        setIsBulkSaving(false);
        alert(`Precios creados: ${successCount} exitosos, ${errorCount} errores`);
        
        setShowPriceModal(false);
        setApplyToAll(false);
        setPriceForm({
          productId: '',
          productSku: '',
          pricePL: '',
          priceEU: '',
          discountPL: '',
          discountEU: '',
          b2bCustomerId: '',
        });
        fetchData();
        return;
      }

      // Single product
      const response = await fetch('/api/admin/b2b/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: priceForm.productId,
          productSku: priceForm.productSku,
          pricePL: priceForm.pricePL ? parseInt(priceForm.pricePL) : 0,
          priceEU: priceForm.priceEU ? parseInt(priceForm.priceEU) : 0,
          discountPL: priceForm.discountPL ? parseFloat(priceForm.discountPL) : null,
          discountEU: priceForm.discountEU ? parseFloat(priceForm.discountEU) : null,
          b2bCustomerId: priceForm.b2bCustomerId || null,
        }),
      });

      if (response.ok) {
        setShowPriceModal(false);
        setEditingPrice(null);
        setPriceForm({
          productId: '',
          productSku: '',
          pricePL: '',
          priceEU: '',
          discountPL: '',
          discountEU: '',
          b2bCustomerId: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save price:', error);
    }
  };

  const editPrice = (price: B2BPrice) => {
    setEditingPrice(price);
    const product = products.find(p => p.slug === price.productId);
    setProductSearch(product?.name || price.productId);
    setPriceForm({
      productId: price.productId,
      productSku: price.productSku,
      pricePL: price.pricePL.toString(),
      priceEU: price.priceEU.toString(),
      discountPL: price.discountPL?.toString() || '',
      discountEU: price.discountEU?.toString() || '',
      b2bCustomerId: price.b2bCustomerId || '',
    });
    setShowPriceModal(true);
  };

  const deletePrice = async (priceId: string) => {
    if (!confirm('Are you sure you want to delete this price?')) return;

    try {
      const response = await fetch(`/api/admin/b2b/prices?id=${priceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete price:', error);
    }
  };

  const validateVies = async () => {
    if (!customerForm.vatNumber || !customerForm.country) {
      alert('Please enter a VAT number and select a country first');
      return;
    }

    setIsValidatingVies(true);
    setViesResult(null);

    try {
      const response = await fetch('/api/b2b/validate-vat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: customerForm.country,
          vatNumber: customerForm.vatNumber,
        }),
      });

      const data = await response.json();
      setViesResult({
        valid: data.valid,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        error: data.error,
      });

      // If valid and we have an editing customer, update the viesValidated status
      if (data.valid && editingCustomer) {
        await fetch('/api/admin/b2b/customers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: editingCustomer.id,
            viesValidated: true,
          }),
        });
        fetchData();
      }
    } catch (error) {
      console.error('VIES validation error:', error);
      setViesResult({
        valid: false,
        error: 'Error connecting to VIES service',
      });
    } finally {
      setIsValidatingVies(false);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    return (cents / 100).toLocaleString('pl-PL', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ' + currency;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter approved customers for the selector
  const approvedCustomers = customers.filter(c => c.status === 'approved');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">B2B Management</h1>
        <p className="text-gray-500">Manage B2B customers and special pricing</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('customers')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'customers'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'prices'
                ? 'border-brand-red text-brand-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            B2B Prices ({prices.length})
          </button>
        </nav>
      </div>

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <div>
          <div className="mb-4">
            <button
              onClick={openNewCustomerModal}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-red hover:bg-brand-red-hover"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add B2B Customer
            </button>
          </div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VAT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIES</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No B2B customers yet
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{customer.companyName}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {customer.country}{customer.vatNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.region === 'POLAND'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {customer.region}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {customer.viesValidated ? (
                        <span className="text-brand-red">✓ Validated</span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : customer.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {customer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateCustomerStatus(customer.id, 'approved')}
                              className="text-brand-red hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateCustomerStatus(customer.id, 'rejected')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {customer.status === 'rejected' && (
                          <button
                            onClick={() => updateCustomerStatus(customer.id, 'approved')}
                            className="text-brand-red hover:text-green-900"
                          >
                            Approve
                          </button>
                        )}
                        {customer.status === 'approved' && (
                          <button
                            onClick={() => updateCustomerStatus(customer.id, 'rejected')}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => openEditCustomerModal(customer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Prices Tab */}
      {activeTab === 'prices' && (
        <div>
          <div className="mb-4">
            <button
              onClick={() => {
                setEditingPrice(null);
                setProductSearch('');
                setPriceForm({
                  productId: '',
                  productSku: '',
                  pricePL: '',
                  priceEU: '',
                  discountPL: '',
                  discountEU: '',
                  b2bCustomerId: '',
                });
                setShowPriceModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-red hover:bg-brand-red-hover"
            >
              Add B2B Price
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price PL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price EU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No B2B prices configured
                    </td>
                  </tr>
                ) : (
                  prices.map((price) => (
                    <tr key={price.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {price.productId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {price.productSku}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {price.b2bCustomer ? (
                          <div>
                            <div className="font-medium text-purple-700">{price.b2bCustomer.companyName}</div>
                            <div className="text-xs text-gray-500">{price.b2bCustomer.email}</div>
                          </div>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            All Customers
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {price.pricePL > 0 ? formatPrice(price.pricePL, 'PLN') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {price.priceEU > 0 ? formatPrice(price.priceEU, 'EUR') : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {price.discountPL || price.discountEU ? (
                          <div>
                            {price.discountPL && <div>PL: {price.discountPL}%</div>}
                            {price.discountEU && <div>EU: {price.discountEU}%</div>}
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editPrice(price)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePrice(price.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Price Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowPriceModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPrice ? 'Edit B2B Price' : 'Add B2B Price'}
              </h3>

              <form onSubmit={handlePriceSubmit} className="space-y-4">
                {/* Row 1: Product Search & Customer */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">
                      Search Product
                    </label>
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="Search by name or SKU..."
                      disabled={!!editingPrice}
                    />
                    {showProductDropdown && productSearch && !editingPrice && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {products
                          .filter(p =>
                            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.slug.toLowerCase().includes(productSearch.toLowerCase())
                          )
                          .slice(0, 10)
                          .map(product => (
                            <button
                              key={product.id}
                              type="button"
                              onClick={() => {
                                setPriceForm({
                                  ...priceForm,
                                  productId: product.slug,
                                  productSku: product.sku,
                                });
                                setProductSearch(product.name);
                                setShowProductDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-100 border-b border-gray-100 last:border-0"
                            >
                              <div className="font-medium text-sm">{product.name}</div>
                              <div className="text-xs text-gray-500">SKU: {product.sku} | Slug: {product.slug}</div>
                            </button>
                          ))}
                        {products.filter(p =>
                          p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.slug.toLowerCase().includes(productSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-3 py-2 text-sm text-gray-500">No products found</div>
                        )}
                      </div>
                    )}
                    {priceForm.productId && (
                      <div className="mt-1 text-xs text-green-600">
                        Selected: {priceForm.productSku} ({priceForm.productId})
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Customer (optional)
                    </label>
                    <select
                      value={priceForm.b2bCustomerId}
                      onChange={(e) => setPriceForm({ ...priceForm, b2bCustomerId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      disabled={!!editingPrice}
                    >
                      <option value="">All Customers</option>
                      {approvedCustomers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.companyName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2: Prices */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Precio PL (en grosze)
                    </label>
                    <input
                      type="number"
                      value={priceForm.pricePL}
                      onChange={(e) => setPriceForm({ ...priceForm, pricePL: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="15000000"
                    />
                    <p className="text-xs text-brand-red mt-1 font-medium">
                      = {priceForm.pricePL && parseInt(priceForm.pricePL) > 0
                          ? formatPrice(parseInt(priceForm.pricePL), 'PLN')
                          : '0,00 PLN'}
                    </p>
                    <p className="text-xs text-gray-400">100 groszy = 1 PLN</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Precio EU (en cents)
                    </label>
                    <input
                      type="number"
                      value={priceForm.priceEU}
                      onChange={(e) => setPriceForm({ ...priceForm, priceEU: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="3500000"
                    />
                    <p className="text-xs text-blue-600 mt-1 font-medium">
                      = {priceForm.priceEU && parseInt(priceForm.priceEU) > 0
                          ? formatPrice(parseInt(priceForm.priceEU), 'EUR')
                          : '0,00 EUR'}
                    </p>
                    <p className="text-xs text-gray-400">100 cents = 1 EUR</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discount PL (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={priceForm.discountPL}
                      onChange={(e) => setPriceForm({ ...priceForm, discountPL: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Discount EU (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={priceForm.discountEU}
                      onChange={(e) => setPriceForm({ ...priceForm, discountEU: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="10"
                    />
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Priority:</strong> Customer-specific price → Regional price → Regular price.
                    Fixed prices take precedence over discounts.
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPriceModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-brand-red text-white rounded-md hover:bg-brand-red-hover"
                  >
                    {editingPrice ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowCustomerModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCustomer ? 'Edit B2B Customer' : 'Add B2B Customer'}
              </h3>

              <form onSubmit={handleCustomerSubmit} className="space-y-4">
                {/* Row 1: Email & Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="empresa@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password {editingCustomer ? '(leave empty to keep current)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={customerForm.password}
                      onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="••••••••"
                      required={!editingCustomer}
                    />
                  </div>
                </div>

                {/* Row 2: Company & Contact Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={customerForm.companyName}
                      onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="Company S.A."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={customerForm.contactName}
                      onChange={(e) => setCustomerForm({ ...customerForm, contactName: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="Jan Kowalski"
                      required
                    />
                  </div>
                </div>

                {/* Row 3: Country & VAT */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <div className="mt-1">
                      <select
                        value={customerForm.country}
                        onChange={(e) => {
                          const country = e.target.value;
                          const region = country === 'PL' ? 'POLAND' : 'EU';
                          setCustomerForm({ ...customerForm, country, region });
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                        required
                      >
                        <option value="PL">PL - Poland</option>
                        <option value="DE">DE - Germany</option>
                        <option value="FR">FR - France</option>
                        <option value="ES">ES - Spain</option>
                        <option value="IT">IT - Italy</option>
                        <option value="NL">NL - Netherlands</option>
                        <option value="BE">BE - Belgium</option>
                        <option value="AT">AT - Austria</option>
                        <option value="CZ">CZ - Czech Republic</option>
                        <option value="SK">SK - Slovakia</option>
                        <option value="HU">HU - Hungary</option>
                        <option value="RO">RO - Romania</option>
                        <option value="BG">BG - Bulgaria</option>
                        <option value="PT">PT - Portugal</option>
                        <option value="GR">GR - Greece</option>
                        <option value="SE">SE - Sweden</option>
                        <option value="DK">DK - Denmark</option>
                        <option value="FI">FI - Finland</option>
                        <option value="IE">IE - Ireland</option>
                        <option value="LT">LT - Lithuania</option>
                        <option value="LV">LV - Latvia</option>
                        <option value="EE">EE - Estonia</option>
                        <option value="SI">SI - Slovenia</option>
                        <option value="HR">HR - Croatia</option>
                        <option value="LU">LU - Luxembourg</option>
                        <option value="MT">MT - Malta</option>
                        <option value="CY">CY - Cyprus</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      VAT Number (NIP)
                    </label>
                    <div className="mt-1 flex gap-2">
                      <input
                        type="text"
                        value={customerForm.vatNumber}
                        onChange={(e) => {
                          setCustomerForm({ ...customerForm, vatNumber: e.target.value });
                          setViesResult(null);
                        }}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                        placeholder="1234567890"
                      />
                      <button
                        type="button"
                        onClick={validateVies}
                        disabled={isValidatingVies || !customerForm.vatNumber}
                        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isValidatingVies ? 'Validando...' : 'Validar VIES'}
                      </button>
                    </div>
                    {viesResult && (
                      <div className={`mt-2 p-2 rounded text-sm ${viesResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {viesResult.valid ? (
                          <div>
                            <span className="font-medium">VIES Válido</span>
                            {viesResult.companyName && <div>Empresa: {viesResult.companyName}</div>}
                            {viesResult.companyAddress && <div>Dirección: {viesResult.companyAddress}</div>}
                          </div>
                        ) : (
                          <div>
                            <span className="font-medium">VIES Inválido</span>
                            {viesResult.error && <div>{viesResult.error}</div>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Region & Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Region
                    </label>
                    <input
                      type="text"
                      value={customerForm.region}
                      readOnly
                      className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={customerForm.contactPhone}
                      onChange={(e) => setCustomerForm({ ...customerForm, contactPhone: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="+48 500 100 200"
                    />
                  </div>
                </div>

                {/* Row 5: Street & Postal Code */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Street *
                    </label>
                    <input
                      type="text"
                      value={customerForm.street}
                      onChange={(e) => setCustomerForm({ ...customerForm, street: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="ul. Główna 123"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={customerForm.postalCode}
                      onChange={(e) => setCustomerForm({ ...customerForm, postalCode: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="00-001"
                      required
                    />
                  </div>
                </div>

                {/* Row 6: City & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                      placeholder="Warsaw"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={customerForm.status}
                      onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-brand-red text-white rounded-md hover:bg-brand-red-hover"
                  >
                    {editingCustomer ? 'Update Customer' : 'Create Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
