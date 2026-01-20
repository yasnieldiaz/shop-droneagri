'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CartButton } from '@/components/cart/CartButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccessoriesOpen, setIsAccessoriesOpen] = useState(false);
  const [isMobileAccessoriesOpen, setIsMobileAccessoriesOpen] = useState(false);
  const t = useTranslations('nav');

  const accessorySubcategories = [
    { name: t('smartBattery'), href: '/products?category=smart-battery' },
    { name: t('batteryChargers'), href: '/products?category=battery-chargers' },
    { name: t('taskSystem'), href: '/products?category=task-system' },
    { name: t('remoteController'), href: '/products?category=remote-controller' },
    { name: t('gnssRtk'), href: '/products?category=gnss-rtk' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
            <Image
              src="/images/logo-xag-imega.svg"
              alt="DroneAgri Shop"
              width={160}
              height={45}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/products"
              className="text-navy font-medium hover:text-brand-red transition-colors"
            >
              {t('products')}
            </Link>

            {/* Accessories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsAccessoriesOpen(true)}
              onMouseLeave={() => setIsAccessoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-navy font-medium hover:text-brand-red transition-colors">
                {t('accessories')}
                <svg
                  className={`w-4 h-4 transition-transform ${isAccessoriesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isAccessoriesOpen && (
                <div className="absolute top-full left-0 pt-2">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-100 py-2 min-w-[200px]">
                    <Link
                      href="/products?category=accessories"
                      className="block px-4 py-2 text-navy hover:bg-gray-50 hover:text-brand-red transition-colors font-medium"
                    >
                      {t('allAccessories')}
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    {accessorySubcategories.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-brand-red transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/products?category=parts"
              className="text-navy font-medium hover:text-brand-red transition-colors"
            >
              {t('spareParts')}
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Search */}
            <button className="p-2 text-navy hover:text-brand-red transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <CartButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-navy"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col space-y-2">
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-navy font-medium hover:text-brand-red transition-colors py-2"
              >
                {t('products')}
              </Link>

              {/* Mobile Accessories Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileAccessoriesOpen(!isMobileAccessoriesOpen)}
                  className="flex items-center justify-between w-full text-navy font-medium hover:text-brand-red transition-colors py-2"
                >
                  {t('accessories')}
                  <svg
                    className={`w-4 h-4 transition-transform ${isMobileAccessoriesOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMobileAccessoriesOpen && (
                  <div className="pl-4 space-y-2 mt-2">
                    <Link
                      href="/products?category=accessories"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block text-gray-600 hover:text-brand-red transition-colors py-1"
                    >
                      {t('allAccessories')}
                    </Link>
                    {accessorySubcategories.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-gray-600 hover:text-brand-red transition-colors py-1"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/products?category=parts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-navy font-medium hover:text-brand-red transition-colors py-2"
              >
                {t('spareParts')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
