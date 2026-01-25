'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';
import { useB2BStore } from '@/lib/store/b2b';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface OrderResult {
  orderNumber: string;
  id: string;
}

interface BankSettings {
  bank_name: string;
  bank_recipient: string;
  bank_account_pln: string;
  bank_account_eur: string;
  bank_swift: string;
}

export default function CheckoutPage() {
  const t = useTranslations('checkout');
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const itemCount = useCartStore((state) => state.itemCount);
  const clearCart = useCartStore((state) => state.clearCart);

  const b2bCustomer = useB2BStore((state) => state.customer);
  const isB2BLoggedIn = useB2BStore((state) => state.isLoggedIn);

  const locale = useLocale();
  const isPolish = locale === 'pl';

  const currency = isB2BLoggedIn && b2bCustomer
    ? (b2bCustomer.region === 'POLAND' ? 'PLN' : 'EUR')
    : (isPolish ? 'PLN' : 'EUR');

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bankSettings, setBankSettings] = useState<BankSettings | null>(null);

  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    nip: '',
    address: '',
    city: '',
    postalCode: '',
    country: isPolish ? 'Poland' : 'Spain',
  });

  useEffect(() => {
    const fetchBankSettings = async () => {
      try {
        const response = await fetch('/api/settings/bank');
        if (response.ok) {
          const data = await response.json();
          setBankSettings(data);
        }
      } catch (error) {
        console.error('Failed to fetch bank settings:', error);
      }
    };
    fetchBankSettings();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(currency === 'PLN' ? 'pl-PL' : 'de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const freeShippingThreshold = currency === 'PLN' ? 1000000 : 230000;
  const shippingCostAmount = currency === 'PLN' ? 5000 : 1200;
  const shippingCost = subtotal >= freeShippingThreshold ? 0 : shippingCostAmount;
  const total = subtotal + shippingCost;

  const VAT_RATE = 0.23;
  const subtotalNetto = Math.round(subtotal / (1 + VAT_RATE));
  const vatAmount = subtotal - subtotalNetto;

  const bankAccount = currency === 'PLN'
    ? bankSettings?.bank_account_pln
    : bankSettings?.bank_account_eur;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: shippingInfo.email,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          phone: shippingInfo.phone,
          company: shippingInfo.company,
          nip: shippingInfo.nip,
          shippingStreet: shippingInfo.address,
          shippingCity: shippingInfo.city,
          shippingPostalCode: shippingInfo.postalCode,
          shippingCountry: shippingInfo.country,
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.productId,
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal,
          shippingCost,
          tax: 0,
          total,
          currency,
          paymentMethod: 'bank_transfer',
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to place order');

      setOrderResult(data.order);
      clearCart();
      setStep('confirmation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <svg className="w-20 h-20 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-navy mb-2">{t('emptyCart')}</h2>
        <p className="text-gray-500 mb-6">{t('emptyCartDesc')}</p>
        <Link href="/products" className="btn-primary">{t('browseProducts')}</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-navy text-white py-8">
        <div className="container">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-gray-300 mt-1">{itemCount} {itemCount === 1 ? t('itemInCart') : t('itemsInCart')}</p>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { key: 'cart', label: t('steps.cart') },
              { key: 'shipping', label: t('steps.shipping') },
              { key: 'payment', label: t('steps.payment') },
              { key: 'confirmation', label: t('steps.confirmation') },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 md:gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s.key ? 'bg-brand-red text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className={`hidden md:block ${step === s.key ? 'text-navy font-medium' : 'text-gray-500'}`}>{s.label}</span>
                {i < 3 && (
                  <svg className="w-4 h-4 text-gray-300 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 'cart' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-navy mb-6">{t('reviewCart')}</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={80} height={80} className="object-contain" />
                        ) : (
                          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.slug}`} className="font-medium text-navy hover:text-brand-red">{item.name}</Link>
                        <p className="text-sm text-gray-500">{t('qty')}: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-navy">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <Link href="/products" className="btn-secondary">{t('continueShopping')}</Link>
                  <button onClick={() => setStep('shipping')} className="btn-primary">{t('continueToShipping')}</button>
                </div>
              </div>
            )}

            {step === 'shipping' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-navy mb-6">{t('shippingInfo')}</h2>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('firstName')} *</label>
                      <input type="text" value={shippingInfo.firstName} onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('lastName')} *</label>
                      <input type="text" value={shippingInfo.lastName} onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')} *</label>
                      <input type="email" value={shippingInfo.email} onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')} *</label>
                      <input type="tel" value={shippingInfo.phone} onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" required />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('company')}</label>
                      <input type="text" value={shippingInfo.company} onChange={(e) => setShippingInfo({ ...shippingInfo, company: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('nip')}</label>
                      <input type="text" value={shippingInfo.nip} onChange={(e) => setShippingInfo({ ...shippingInfo, nip: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')} *</label>
                    <input type="text" value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" required />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('city')} *</label>
                      <input type="text" value={shippingInfo.city} onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('postalCode')} *</label>
                      <input type="text" value={shippingInfo.postalCode} onChange={(e) => setShippingInfo({ ...shippingInfo, postalCode: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" required />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('country')} *</label>
                    <select value={shippingInfo.country} onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })} className="w-full px-4 py-2 h-[42px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-white">
                      <option value="Poland">Poland</option>
                      <option value="Spain">Spain</option>
                      <option value="Germany">Germany</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="Italy">Italy</option>
                      <option value="France">France</option>
                      <option value="Austria">Austria</option>
                      <option value="Belgium">Belgium</option>
                    </select>
                  </div>
                </form>
                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep('cart')} className="btn-secondary">{t('backToCart')}</button>
                  <button onClick={() => setStep('payment')} className="btn-primary">{t('continueToPayment')}</button>
                </div>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-navy mb-6">{t('paymentMethod')}</h2>

                <div className="p-4 border-2 border-brand-red bg-red-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-brand-red/10 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-navy">{t('bankTransfer')}</p>
                      <p className="text-sm text-gray-500">{t('bankTransferDesc')}</p>
                    </div>
                    <svg className="w-6 h-6 text-brand-red" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('bankDetails')}
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('bankName')}:</span>
                      <span className="font-medium text-blue-900">{bankSettings?.bank_name || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('recipient')}:</span>
                      <span className="font-medium text-blue-900">{bankSettings?.bank_recipient || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('companyAddress')}:</span>
                      <span className="font-medium text-blue-900">Smolna 14, 44-200 Rybnik</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('companyNip')}:</span>
                      <span className="font-medium text-blue-900">PL6423233602</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-blue-700">{t('accountNumber')} ({currency}):</span>
                      <span className="font-mono font-medium text-blue-900 text-right">{bankAccount || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{t('swift')}:</span>
                      <span className="font-mono font-medium text-blue-900">{bankSettings?.bank_swift || 'Loading...'}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <p className="text-blue-700 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {t('includeOrderNumber')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('paymentInfo')}
                  </p>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button onClick={() => setStep('shipping')} className="btn-secondary">{t('backToShipping')}</button>
                  <button onClick={handlePlaceOrder} disabled={isSubmitting} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? t('processing') : t('placeOrder')}
                  </button>
                </div>
              </div>
            )}

            {step === 'confirmation' && orderResult && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-navy mb-2">{t('orderConfirmed')}</h2>
                <p className="text-gray-600 mb-6">{t('thankYou')}</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-500">{t('orderNumber')}</p>
                  <p className="text-xl font-bold text-navy">{orderResult.orderNumber}</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-8 text-left">
                  <p className="text-blue-800 font-semibold mb-3">{t('bankDetails')}</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-blue-700">{t('bankName')}: <span className="font-medium text-blue-900">{bankSettings?.bank_name}</span></p>
                    <p className="text-blue-700">{t('recipient')}: <span className="font-medium text-blue-900">{bankSettings?.bank_recipient}</span></p>
                    <p className="text-blue-700">{t('companyAddress')}: <span className="font-medium text-blue-900">Smolna 14, 44-200 Rybnik</span></p>
                    <p className="text-blue-700">{t('companyNip')}: <span className="font-medium text-blue-900">PL6423233602</span></p>
                    <p className="text-blue-700">{t('accountNumber')} ({currency}): <span className="font-mono font-medium text-blue-900">{bankAccount}</span></p>
                    <p className="text-blue-700">{t('swift')}: <span className="font-mono font-medium text-blue-900">{bankSettings?.bank_swift}</span></p>
                  </div>
                  <p className="mt-3 text-blue-600 text-sm font-medium">{t('includeOrderNumber')}</p>
                </div>

                <Link href="/products" className="btn-primary">{t('continueShopping')}</Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-navy mb-4">{t('orderSummary')}</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('subtotalNetto')} ({itemCount} {t('items')})</span>
                  <span className="font-medium">{formatPrice(subtotalNetto)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('vat')} (23%)</span>
                  <span className="font-medium">{formatPrice(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">{isPolish ? t('subtotalBrutto') : t('totalInclVat')}</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('shipping')}</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">{t('free')}</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-gray-500">{t('freeShippingOver')} {formatPrice(freeShippingThreshold)}</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-bold text-navy">{isPolish ? t('totalBrutto') : t('totalInclVat')}</span>
                  <span className="font-bold text-xl text-navy">{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('vatIncluded')} ({formatPrice(vatAmount)})</p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('promoCode')}</label>
                <div className="flex gap-2">
                  <input type="text" placeholder={t('enterCode')} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" />
                  <button className="btn-secondary text-sm py-2">{t('apply')}</button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {t('secureCheckout')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
