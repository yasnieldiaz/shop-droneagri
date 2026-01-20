import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'PLN' | 'EUR';

interface CurrencyState {
  currency: Currency;
  isAutoDetected: boolean;
  isLoading: boolean;
  setCurrency: (currency: Currency) => void;
  setAutoDetected: (detected: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set) => ({
      currency: 'PLN',
      isAutoDetected: false,
      isLoading: true,
      setCurrency: (currency) => set({ currency }),
      setAutoDetected: (detected) => set({ isAutoDetected: detected }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'currency-storage',
      partialize: (state) => ({
        currency: state.currency,
        isAutoDetected: state.isAutoDetected,
      }),
    }
  )
);

// Format price based on currency
export function formatPrice(pricePLN: number, priceEUR: number | null, currency: Currency): string {
  // If EUR price is not available, convert from PLN (approximate rate)
  const eurAmount = priceEUR ?? Math.round(pricePLN / 4.3);
  const amount = currency === 'PLN' ? pricePLN : eurAmount;
  const locale = currency === 'PLN' ? 'pl-PL' : 'de-DE';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
}

// Detect currency based on user's country
export async function detectCurrencyByLocation(): Promise<Currency> {
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }

    const data = await response.json();
    const countryCode = data.country_code;

    // Poland uses PLN, everyone else uses EUR
    return countryCode === 'PL' ? 'PLN' : 'EUR';
  } catch {
    // Default to PLN if detection fails
    return 'PLN';
  }
}
