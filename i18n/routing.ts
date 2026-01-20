import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en', 'pl', 'de', 'cs', 'nl'],
  defaultLocale: 'pl',
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
