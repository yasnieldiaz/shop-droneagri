'use client';

import { useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/store/cart';

export function CartDrawer() {
  const t = useTranslations('cart');
  const isOpen = useCartStore((state) => state.isOpen);
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const currency = useCartStore((state) => state.currency);
  const itemCount = useCartStore((state) => state.itemCount);

  const drawerRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    useCartStore.getState().closeCart();
  }, []);

  const handleRemove = useCallback((productId: string) => {
    useCartStore.getState().removeItem(productId);
  }, []);

  const handleUpdateQuantity = useCallback((productId: string, quantity: number) => {
    useCartStore.getState().updateQuantity(productId, quantity);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClose]);

  const formatPrice = (amount: number, itemCurrency?: 'PLN' | 'EUR') => {
    const curr = itemCurrency || currency;
    return new Intl.NumberFormat(curr === 'PLN' ? 'pl-PL' : 'de-DE', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-navy flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {t('title')}
            {itemCount > 0 && (
              <span className="bg-brand-red text-white text-sm px-2 py-0.5 rounded-full">
                {itemCount}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <svg className="w-20 h-20 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('emptyCart')}</h3>
            <p className="text-gray-500 mb-6">{t('emptyCartDesc')}</p>
            <Link
              href="/products"
              onClick={handleClose}
              className="btn-primary"
            >
              {t('browseProducts')}
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80}
                        height={80}
                        unoptimized
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={handleClose}
                      className="font-medium text-navy hover:text-brand-red transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-brand-red font-semibold mt-1">
                      {formatPrice(item.price, item.currency)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 border rounded flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemove(item.productId)}
                        className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{t('subtotal')}</span>
                <span className="text-xl font-bold text-navy">
                  {formatPrice(
                    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
                    items[0]?.currency
                  )}
                </span>
              </div>
              <p className="text-sm text-gray-500">{t('shippingAtCheckout')}</p>
              <Link
                href="/checkout"
                onClick={handleClose}
                className="btn-primary w-full justify-center"
              >
                {t('checkout')}
              </Link>
              <button
                onClick={handleClose}
                className="btn-secondary w-full justify-center"
              >
                {t('continueShopping')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
