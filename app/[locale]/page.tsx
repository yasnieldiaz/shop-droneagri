import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { NewsletterForm } from '@/components/NewsletterForm';

export default function HomePage() {
  const t = useTranslations();

  const categories = [
    {
      name: t('categories.airborne'),
      description: t('categories.airborneDesc'),
      image: '/images/categories/airborne.jpg',
      href: '/products?category=airborne',
    },
    {
      name: t('categories.landborne'),
      description: t('categories.landborneDesc'),
      image: '/images/categories/landborne.webp',
      href: '/products?category=landborne',
    },
    {
      name: t('categories.accessories'),
      description: t('categories.accessoriesDesc'),
      image: '/images/categories/accessories.png',
      href: '/products?category=accessories',
    },
    {
      name: t('categories.spareParts'),
      description: t('categories.sparePartsDesc'),
      image: '/images/categories/parts.jpg',
      href: '/products?category=parts',
    },
  ];

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      ),
      title: t('features.officialDealer'),
      description: t('features.officialDealerDesc'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t('features.warrantySupport'),
      description: t('features.warrantySupportDesc'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: t('features.localService'),
      description: t('features.localServiceDesc'),
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: t('features.flexiblePayment'),
      description: t('features.flexiblePaymentDesc'),
    },
  ];

  return (
    <>
      {/* Hero Section with Video Background */}
      <section className="relative bg-navy text-white overflow-hidden min-h-[600px] lg:min-h-[700px]">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/40 z-10" />

        <div className="container relative z-20 py-20 lg:py-32 flex items-center min-h-[600px] lg:min-h-[700px]">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {t('hero.badge')}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {t('hero.title')} <br />
              <span className="text-brand-red">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="text-lg text-gray-300 max-w-xl">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary">
                {t('common.shopAllProducts')}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link href="/products?category=airborne" className="btn-secondary bg-white border-white text-navy hover:bg-gray-100">
                {t('common.viewDrones')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-gray-50 border-b">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="text-brand-red flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-navy">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100"
              >
                {/* Background Image */}
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-2 transition-transform">
                    {category.name}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {category.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                    {t('common.browseProducts')}
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* P150 Max Featured Product */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container">
          <div className="relative rounded-3xl overflow-hidden bg-navy">
            <div className="absolute inset-0">
              <Image
                src="/images/products/p150-max/radar.jpg"
                alt="XAG P150 Max"
                fill
                className="object-cover opacity-40"
              />
            </div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-8 lg:p-16">
              <div className="text-white">
                <span className="inline-block bg-brand-red px-4 py-1 rounded-full text-sm font-medium mb-4">
                  {t('p150Max.badge')}
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {t('p150Max.title')}
                </h2>
                <p className="text-xl text-gray-200 mb-6">
                  {t('p150Max.description')}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-brand-red">80kg</div>
                    <div className="text-sm text-gray-300">{t('p150Max.maxPayload')}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-brand-red">115L</div>
                    <div className="text-sm text-gray-300">{t('p150Max.spreadingTank')}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-brand-red">20m/s</div>
                    <div className="text-sm text-gray-300">{t('p150Max.maxSpeed')}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-brand-red">32kg</div>
                    <div className="text-sm text-gray-300">{t('p150Max.droneWeight')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link href="/products/p150-max" className="btn-primary">
                    {t('common.viewFullDetails')}
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    href="https://www.youtube.com/watch?v=hUJC8pnoX2w"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary bg-white border-white text-navy hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    {t('common.watchVideo')}
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-navy text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {t('cta.title')}
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:shop@droneagri.pl" className="btn-primary">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('common.contactUs')}
              </a>
              <a href="tel:+48123456789" className="btn-secondary bg-white border-white text-navy hover:bg-gray-100">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('common.callUs')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-navy mb-4">
              {t('newsletter.title')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('newsletter.description')}
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
