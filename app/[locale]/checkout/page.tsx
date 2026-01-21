'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cart';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface OrderResult {
  orderNumber: string;
  id: string;
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const currency = useCartStore((state) => state.currency);
  const itemCount = useCartStore((state) => state.itemCount);
  const clearCart = useCartStore((state) => state.clearCart);

  const [step, setStep] = useState<CheckoutStep>('cart');
  const [paymentMethod, setPaymentMethod] = useState<string>('stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    country: 'Poland',
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(currency === 'PLN' ? 'pl-PL' : 'de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  // Shipping cost (free over 10,000 PLN)
  const shippingCost = subtotal >= 1000000 ? 0 : 5000; // 50 PLN
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Customer info
          email: shippingInfo.email,
          firstName: shippingInfo.firstName,
          lastName: shippingInfo.lastName,
          phone: shippingInfo.phone,
          company: shippingInfo.company,
          nip: shippingInfo.nip,
          // Shipping address
          shippingStreet: shippingInfo.address,
          shippingCity: shippingInfo.city,
          shippingPostalCode: shippingInfo.postalCode,
          shippingCountry: shippingInfo.country,
          // Cart items
          items: items.map((item) => ({
            productId: item.productId,
            sku: item.productId, // Using productId as sku
            name: item.name,
            image: item.image,
            quantity: item.quantity,
            price: item.price,
          })),
          // Totals
          subtotal,
          shippingCost,
          tax: 0,
          total,
          currency,
          // Payment method
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Success!
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
        <svg
          className="w-20 h-20 text-gray-200 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-navy mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to start checkout</p>
        <Link href="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-navy text-white py-8">
        <div className="container">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-gray-300 mt-1">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center justify-center gap-4 md:gap-8">
            {[
              { key: 'cart', label: 'Cart' },
              { key: 'shipping', label: 'Shipping' },
              { key: 'payment', label: 'Payment' },
              { key: 'confirmation', label: 'Confirmation' },
            ].map((s, i) => (
              <div key={s.key} className="flex items-center gap-2 md:gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s.key
                      ? 'bg-brand-red text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`hidden md:block ${
                    step === s.key ? 'text-navy font-medium' : 'text-gray-500'
                  }`}
                >
                  {s.label}
                </span>
                {i < 3 && (
                  <svg
                    className="w-4 h-4 text-gray-300 hidden md:block"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Review */}
            {step === 'cart' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-navy mb-6">Review Your Cart</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b last:border-b-0"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        ) : (
                          <svg
                            className="w-8 h-8 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          className="font-medium text-navy hover:text-brand-red"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-navy">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between">
                  <Link href="/products" className="btn-secondary">
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() => setStep('shipping')}
                    className="btn-primary"
                  >
                    Continue to Shipping
                  </button>
                </div>
              </div>
            )}

            {/* Shipping Information */}
            {step === 'shipping' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-navy mb-6">
                  Shipping Information
                </h2>
                <form className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, firstName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, lastName: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, email: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={shippingInfo.phone}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company (optional)
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.company}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, company: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.address}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, city: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shippingInfo.postalCode}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={shippingInfo.country}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, country: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-white"
                      >
                        <option value="Poland">Poland</option>
                        <option value="Germany">Germany</option>
                        <option value="Czech Republic">Czech Republic</option>
                        <option value="Slovakia">Slovakia</option>
                        <option value="Lithuania">Lithuania</option>
                      </select>
                    </div>
                  </div>
                </form>
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep('cart')}
                    className="btn-secondary"
                  >
                    Back to Cart
                  </button>
                  <button
                    onClick={() => setStep('payment')}
                    className="btn-primary"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Payment */}
            {step === 'payment' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-navy mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {/* Payment options */}
                  <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-brand-red transition-colors ${paymentMethod === 'stripe' ? 'border-brand-red bg-red-50' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="stripe"
                      checked={paymentMethod === 'stripe'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-brand-red"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-navy">Credit/Debit Card</p>
                      <p className="text-sm text-gray-500">Pay securely with Stripe</p>
                    </div>
                    <svg className="w-10 h-6 text-gray-400" viewBox="0 0 40 24">
                      <rect fill="#1a1f71" width="40" height="24" rx="4" />
                      <text x="20" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">VISA</text>
                    </svg>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-brand-red transition-colors ${paymentMethod === 'paypal' ? 'border-brand-red bg-red-50' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-brand-red"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-navy">PayPal</p>
                      <p className="text-sm text-gray-500">Pay with your PayPal account</p>
                    </div>
                    <svg className="w-10 h-6 text-gray-400" viewBox="0 0 40 24">
                      <rect fill="#003087" width="40" height="24" rx="4" />
                      <text x="20" y="15" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PayPal</text>
                    </svg>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:border-brand-red transition-colors ${paymentMethod === 'bank_transfer' ? 'border-brand-red bg-red-50' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 text-brand-red"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-navy">Bank Transfer</p>
                      <p className="text-sm text-gray-500">Pay via direct bank transfer</p>
                    </div>
                    <svg
                      className="w-10 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                      />
                    </svg>
                  </label>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium mb-2">Bank Transfer Details:</p>
                    <p className="text-sm text-blue-700">Bank: Bank Pekao S.A.</p>
                    <p className="text-sm text-blue-700">IBAN: PL 00 0000 0000 0000 0000 0000 0000</p>
                    <p className="text-sm text-blue-700">SWIFT: PKOPPLPW</p>
                    <p className="text-sm text-blue-600 mt-2">Please include your order number in the transfer title.</p>
                  </div>
                )}

                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setStep('shipping')}
                    className="btn-secondary"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation */}
            {step === 'confirmation' && orderResult && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-navy mb-2">
                  Order Confirmed!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We&apos;ll send you a confirmation email shortly.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="text-xl font-bold text-navy">{orderResult.orderNumber}</p>
                </div>
                <Link href="/products" className="btn-primary">
                  Continue Shopping
                </Link>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-bold text-navy mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({itemCount} items)</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shippingCost === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-gray-500">
                    Free shipping on orders over {formatPrice(1000000)}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="font-bold text-navy">Total</span>
                  <span className="font-bold text-xl text-navy">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Including VAT
                </p>
              </div>

              {/* Promo Code */}
              <div className="mt-6 pt-6 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promo Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                  />
                  <button className="btn-secondary text-sm py-2">Apply</button>
                </div>
              </div>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Secure checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
