import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { LocaleDetector } from "@/components/LocaleDetector";
import { CookieConsent } from "@/components/CookieConsent";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DroneAgri.pl - Oficjalny Dystrybutor XAG w Polsce | Drony Rolnicze",
    template: "%s | DroneAgri.pl - XAG Polska"
  },
  description: "Oficjalny sklep internetowy XAG w Polsce. Drony rolnicze, roboty naziemne i części zamienne. Profesjonalny sprzęt do precyzyjnego rolnictwa od autoryzowanego dystrybutora IMEGA.",
  keywords: ["XAG", "drony rolnicze", "drony do oprysku", "XAG Polska", "droneagri", "rolnictwo precyzyjne", "P100 Pro", "V40", "R150", "robot rolniczy", "opryskiwacz", "rozsiewacz", "części zamienne XAG", "dystrybutor XAG", "IMEGA"],
  authors: [{ name: "IMEGA Sp. z o.o.", url: "https://droneagri.pl" }],
  creator: "IMEGA Sp. z o.o.",
  publisher: "IMEGA Sp. z o.o.",
  metadataBase: new URL("https://shop.droneagri.pl"),
  alternates: {
    canonical: "/",
    languages: {
      "pl": "/pl",
      "en": "/en",
      "de": "/de",
      "es": "/es",
      "cs": "/cs",
      "nl": "/nl"
    }
  },
  openGraph: {
    type: "website",
    locale: "pl_PL",
    url: "https://shop.droneagri.pl",
    siteName: "DroneAgri.pl - Sklep XAG Polska",
    title: "DroneAgri.pl - Oficjalny Dystrybutor XAG w Polsce",
    description: "Sklep internetowy z dronami rolniczymi XAG. Autoryzowany dystrybutor w Polsce. Drony do oprysku, roboty naziemne, części zamienne.",
    images: [
      {
        url: "https://shop.droneagri.pl/images/og-image.jpg",
        secureUrl: "https://shop.droneagri.pl/images/og-image.jpg",
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "DroneAgri.pl - Drony rolnicze XAG"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "DroneAgri.pl - Oficjalny Dystrybutor XAG w Polsce",
    description: "Sklep internetowy z dronami rolniczymi XAG. Autoryzowany dystrybutor w Polsce.",
    images: ["/images/og-image.jpg"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "verification-code-here"
  }
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <LocaleDetector currentLocale={locale} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <CookieConsent />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
