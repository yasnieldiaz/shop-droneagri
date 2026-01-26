'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const droneOptions = [
  {
    id: 'p100-pro',
    name: 'P100 Pro',
    description: '50kg payload, 50L tank - Professional agricultural drone',
    image: '/images/products/drones/p100-pro.webp',
    href: '/spare-parts/p100-pro',
    partsCount: '150+',
  },
  {
    id: 'p150-max',
    name: 'P150 Max',
    description: '80kg payload, 80L tank - Maximum performance drone',
    image: '/images/products/drones/p150-max/p150-max-1.png',
    href: '/spare-parts/p150-max',
    partsCount: '120+',
  },
];

export default function SparePartsPage() {
  const t = useTranslations('products');
  const tc = useTranslations('common');
  const ts = useTranslations('sparePartsPage');

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-navy text-white py-12">
        <div className="container">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-4">
            <Link href="/" className="hover:text-white">{t('home')}</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">{ts('title')}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold">{ts('title')}</h1>
          <p className="text-gray-300 mt-2">
            {ts('subtitle')}
          </p>
        </div>
      </div>

      <div className="container py-12">
        {/* Drone Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {droneOptions.map((drone) => (
            <Link
              key={drone.id}
              href={drone.href}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Image */}
              <div className="relative h-64 bg-white p-8">
                <Image
                  src={drone.image}
                  alt={drone.name}
                  fill
                  className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-gray-900 group-hover:text-brand-red transition-colors">
                    {drone.name}
                  </h2>
                  <span className="px-3 py-1 bg-brand-red/10 text-brand-red text-sm font-medium rounded-full">
                    {drone.partsCount} {ts('parts')}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{drone.description}</p>

                {/* CTA */}
                <div className="flex items-center text-brand-red font-medium group-hover:gap-3 gap-2 transition-all">
                  <span>{tc('browseParts')}</span>
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {ts('needHelp')}
          </h3>
          <p className="text-gray-600 mb-6">
            {ts('helpDescription')}
          </p>
          <a
            href="mailto:biuro@imegagroup.pl"
            className="inline-flex items-center gap-2 px-6 py-3 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {ts('contactSupport')}
          </a>
        </div>
      </div>
    </div>
  );
}
