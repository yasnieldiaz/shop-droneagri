import { Metadata } from 'next';
import { getPrisma } from '@/lib/db/prisma';

const siteUrl = 'https://shop.droneagri.pl';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

async function getProduct(slug: string, locale: string) {
  try {
    const prisma = await getPrisma();
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale }
        }
      }
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  
  const product = await getProduct(slug, locale);

  if (!product) {
    return { title: 'Product Not Found' };
  }

  const translation = product.translations[0];
  const name = translation?.name || product.sku;
  const rawDescription = translation?.tagline || translation?.description || '';
  const description = rawDescription.replace(/<[^>]*>/g, '').substring(0, 160);
  
  const imageUrl = product.mainImage 
    ? (product.mainImage.startsWith('http') 
        ? product.mainImage 
        : siteUrl + product.mainImage)
    : siteUrl + '/images/og-image.jpg';

  const productUrl = siteUrl + '/' + locale + '/products/' + slug;

  return {
    title: name,
    description: description,
    openGraph: {
      title: name,
      description: description,
      url: productUrl,
      siteName: 'XAG IMEGA Shop',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: name,
      description: description,
      images: [imageUrl],
    },
    alternates: {
      canonical: productUrl,
    },
  };
}

function generateProductJsonLd(product: {
  sku: string;
  slug: string;
  pricePLN: number;
  priceEUR: number;
  compareAtPLN: number | null;
  compareAtEUR: number | null;
  stock: number;
  mainImage: string | null;
  gallery: string[];
  category: string | null;
  translations: { name: string; tagline: string | null; description: string | null }[];
}, locale: string) {
  const translation = product.translations[0];
  const name = translation?.name || product.sku;
  const description = (translation?.tagline || translation?.description || '')
    .replace(/<[^>]*>/g, '').substring(0, 500);
  
  const imageUrl = product.mainImage
    ? (product.mainImage.startsWith('http') ? product.mainImage : siteUrl + product.mainImage)
    : siteUrl + '/images/og-image.jpg';

  const images = [imageUrl, ...product.gallery.map(img => 
    img.startsWith('http') ? img : siteUrl + img
  )];

  const pricePLN = (product.pricePLN / 100).toFixed(2);
  const priceEUR = (product.priceEUR / 100).toFixed(2);
  const productUrl = siteUrl + '/' + locale + '/products/' + product.slug;
  
  const availability = product.stock > 0 
    ? 'https://schema.org/InStock' 
    : 'https://schema.org/PreOrder';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: images,
    sku: product.sku,
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: 'XAG',
    },
    category: product.category || 'Agricultural Drones',
    manufacturer: {
      '@type': 'Organization',
      name: 'XAG',
      url: 'https://www.xa.com',
    },
    offers: [
      {
        '@type': 'Offer',
        price: pricePLN,
        priceCurrency: 'PLN',
        availability,
        url: productUrl,
        seller: {
          '@type': 'Organization',
          name: 'DroneAgri.pl - XAG IMEGA Polska',
          url: 'https://droneagri.pl',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'PL',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 10, unitCode: 'DAY' },
          },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'PL',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 14,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
      },
      {
        '@type': 'Offer',
        price: priceEUR,
        priceCurrency: 'EUR',
        availability,
        url: productUrl,
        seller: {
          '@type': 'Organization',
          name: 'DroneAgri.pl - XAG IMEGA Polska',
          url: 'https://droneagri.pl',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'PL',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 10, unitCode: 'DAY' },
          },
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'PL',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 14,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
        },
      },
    ],
  };
}

export default async function ProductLayout({ children, params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug, locale);

  const jsonLd = product ? generateProductJsonLd(product as Parameters<typeof generateProductJsonLd>[0], locale) : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
