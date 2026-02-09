import { Metadata } from 'next';
import { getPrisma } from '@/lib/db/prisma';

const siteUrl = 'https://shop.droneagri.pl';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  
  try {
    const prisma = await getPrisma();
    
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        translations: {
          where: { locale }
        }
      }
    });

    if (!product) {
      return {
        title: 'Product Not Found',
      };
    }

    const translation = product.translations[0];
    const name = translation?.name || product.sku;
    const description = translation?.tagline || translation?.description?.substring(0, 160) || '';
    
    const imageUrl = product.mainImage 
      ? (product.mainImage.startsWith('http') 
          ? product.mainImage 
          : siteUrl + product.mainImage)
      : siteUrl + '/images/og-image.jpg';

    const productUrl = siteUrl + '/'+locale+'/products/'+slug;

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
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'XAG IMEGA Shop',
    };
  }
}

export default function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
