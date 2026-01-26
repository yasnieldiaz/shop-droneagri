'use client';

import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CartButton } from '@/components/cart/CartButton';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useB2BStore } from '@/lib/store/b2b';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccessoriesOpen, setIsAccessoriesOpen] = useState(false);
  const [isMobileAccessoriesOpen, setIsMobileAccessoriesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const { isLoggedIn, customer } = useB2BStore();

  // Focus search input when modal opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    if (isSearchOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

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
            <a
              href="https://droneagri.pl"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-brand-red font-semibold hover:text-red-700 transition-colors"
            >
              XAG Polska
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

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
              href="/spare-parts"
              className="text-navy font-medium hover:text-brand-red transition-colors"
            >
              {t('spareParts')}
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* B2B Portal */}
            {isLoggedIn && customer ? (
              <Link
                href="/b2b/dashboard"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                B2B
              </Link>
            ) : (
              <Link
                href="/b2b/login"
                className="hidden sm:block text-sm text-gray-600 hover:text-brand-red transition-colors"
              >
                B2B Login
              </Link>
            )}

            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-navy hover:text-brand-red transition-colors"
              aria-label={tCommon('search')}
            >
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
              <a
                href="https://droneagri.pl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-red font-semibold hover:text-red-700 transition-colors py-2"
              >
                XAG Polska
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

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
                href="/spare-parts"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-navy font-medium hover:text-brand-red transition-colors py-2"
              >
                {t('spareParts')}
              </Link>

              {/* B2B Link for Mobile */}
              <div className="border-t border-gray-100 pt-2 mt-2">
                {isLoggedIn && customer ? (
                  <Link
                    href="/b2b/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition-colors py-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    B2B Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/b2b/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-600 font-medium hover:text-brand-red transition-colors py-2"
                  >
                    B2B Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsSearchOpen(false)}
          />
          {/* Modal */}
          <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg">
            <div className="container py-4">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={tCommon('search') + '...'}
                    className="w-full pl-12 pr-4 py-3 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary px-6 py-3"
                >
                  {tCommon('search')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="p-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
