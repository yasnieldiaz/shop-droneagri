'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrencyStore } from '@/lib/store/currency';

const countryToLocale: Record<string, string> = {
  PL: 'pl',
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  CZ: 'cs', SK: 'cs',
  NL: 'nl', BE: 'nl',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IT: 'it', SM: 'it', VA: 'it',
};

const supportedLocales = ['pl', 'en', 'de', 'cs', 'nl', 'es', 'it'];

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + '=' + value + '; expires=' + expires + '; path=/';
}

export function LocaleDetector({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setCurrency, setAutoDetected, setLoading } = useCurrencyStore();

  useEffect(() => {
    const geoDetected = getCookie('geo_detected');
    
    if (geoDetected) {
      const currencyCookie = getCookie('preferred_currency');
      if (currencyCookie === 'PLN' || currencyCookie === 'EUR') {
        setCurrency(currencyCookie);
        setAutoDetected(true);
      }
      setLoading(false);
      return;
    }

    async function detectLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000),
        });

        if (!response.ok) throw new Error('Failed');

        const data = await response.json();
        const countryCode = data.country_code?.toUpperCase();

        if (!countryCode) throw new Error('No country');

        const detectedLocale = countryToLocale[countryCode] || 'en';
        const currency = countryCode === 'PL' ? 'PLN' : 'EUR';

        setCookie('geo_detected', '1', 30);
        setCookie('NEXT_LOCALE', detectedLocale, 365);
        setCookie('preferred_currency', currency, 365);

        setCurrency(currency);
        setAutoDetected(true);
        setLoading(false);

        if (detectedLocale !== currentLocale && supportedLocales.includes(detectedLocale)) {
          let cleanPath = pathname;
          for (const loc of supportedLocales) {
            if (pathname.startsWith('/' + loc + '/')) {
              cleanPath = pathname.substring(loc.length + 1);
              break;
            } else if (pathname === '/' + loc) {
              cleanPath = '/';
              break;
            }
          }
          
          const newPath = detectedLocale === 'pl' ? cleanPath : '/' + detectedLocale + cleanPath;
          router.replace(newPath);
        }
      } catch {
        setCookie('geo_detected', '1', 30);
        setLoading(false);
      }
    }

    detectLocation();
  }, [currentLocale, pathname, router, setCurrency, setAutoDetected, setLoading]);

  return null;
}
