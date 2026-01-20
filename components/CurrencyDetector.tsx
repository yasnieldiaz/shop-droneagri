'use client';

import { useEffect } from 'react';
import {
  useCurrencyStore,
  detectCurrencyByLocation,
} from '@/lib/store/currency';

export function CurrencyDetector() {
  const { isAutoDetected, setCurrency, setAutoDetected, setLoading } =
    useCurrencyStore();

  useEffect(() => {
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

  // This component doesn't render anything visible
  return null;
}
