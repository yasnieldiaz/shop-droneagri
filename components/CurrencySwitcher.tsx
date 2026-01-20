'use client';

import { useEffect, useState } from 'react';
import {
  useCurrencyStore,
  detectCurrencyByLocation,
  type Currency,
} from '@/lib/store/currency';

export function CurrencySwitcher() {
  const { currency, isAutoDetected, setCurrency, setAutoDetected, setLoading } =
    useCurrencyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Only auto-detect if not already detected
    if (!isAutoDetected) {
      detectCurrencyByLocation().then((detectedCurrency) => {
        setCurrency(detectedCurrency);
        setAutoDetected(true);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isAutoDetected, setCurrency, setAutoDetected, setLoading]);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 text-sm font-medium text-navy hover:text-brand-red transition-colors border border-gray-200 rounded-md"
      >
        <span className="font-semibold">{currency}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50 min-w-[100px]">
            <button
              onClick={() => handleCurrencyChange('PLN')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                currency === 'PLN' ? 'text-brand-red font-medium' : 'text-gray-700'
              }`}
            >
              <span>PLN (zł)</span>
              {currency === 'PLN' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => handleCurrencyChange('EUR')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                currency === 'EUR' ? 'text-brand-red font-medium' : 'text-gray-700'
              }`}
            >
              <span>EUR (€)</span>
              {currency === 'EUR' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
