'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCurrencyStore } from '@/lib/store/currency';

// Languages the store actually OFFERS to human visitors. Everything else exists
// only as an SEO endpoint (server-rendered HTML + hreflang) so search engines keep
// indexing all markets, but a person browsing in those languages is sent to the
// default Polish store — protecting direct (PL/CZ) vs. indirect (dealer) sales.
const offeredLocales = ['pl', 'cs'];

// Geo auto-routing: only Polish and Czech/Slovak traffic is sent to a localized
// experience; every other country stays on the default Polish store.
const countryToLocale: Record<string, string> = {
  PL: 'pl',
  CZ: 'cs', SK: 'cs',
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

// Strip a leading locale prefix (e.g. "/es/products" -> "/products", "/es" -> "/").
function stripLocale(pathname: string): string {
  for (const loc of supportedLocales) {
    if (pathname.startsWith('/' + loc + '/')) return pathname.substring(loc.length + 1);
    if (pathname === '/' + loc) return '/';
  }
  return pathname;
}

export function LocaleDetector({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { setCurrency, setAutoDetected, setLoading } = useCurrencyStore();

  useEffect(() => {
    // A human visitor on a non-offered locale (es/en/de/it/nl) — typically arriving
    // from a search result or a stale cookie — is redirected to the Polish version.
    // The page still rendered server-side for the crawler that requested it.
    if (!offeredLocales.includes(currentLocale)) {
      setCookie('NEXT_LOCALE', 'pl', 365);
      router.replace(stripLocale(pathname) || '/');
      return;
    }

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

        // Only PL and CZ/SK are auto-routed; everyone else stays on the default (pl).
        const detectedLocale = countryToLocale[countryCode] || 'pl';
        const currency = countryCode === 'PL' ? 'PLN' : 'EUR';

        setCookie('geo_detected', '1', 30);
        setCookie('NEXT_LOCALE', detectedLocale, 365);
        setCookie('preferred_currency', currency, 365);

        setCurrency(currency);
        setAutoDetected(true);
        setLoading(false);

        if (detectedLocale !== currentLocale && offeredLocales.includes(detectedLocale)) {
          const cleanPath = stripLocale(pathname);
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
