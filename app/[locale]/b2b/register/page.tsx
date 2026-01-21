'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const EU_COUNTRIES = [
  { code: 'PL', name: 'Poland' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'SE', name: 'Sweden' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'IE', name: 'Ireland' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'HR', name: 'Croatia' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Cyprus' },
];

export default function B2BRegisterPage() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('b2b.register');
  const tc = useTranslations('b2b.countries');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    vatNumber: '',
    countryCode: 'PL',
    contactName: '',
    contactPhone: '',
    street: '',
    city: '',
    postalCode: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vatValidation, setVatValidation] = useState<{
    valid: boolean;
    companyName?: string;
    address?: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Reset VAT validation when country or VAT number changes
    if (name === 'countryCode' || name === 'vatNumber') {
      setVatValidation(null);
    }
  };

  const validateVAT = async () => {
    if (!formData.vatNumber) {
      setError('Please enter a VAT number');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const response = await fetch('/api/b2b/validate-vat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          countryCode: formData.countryCode,
          vatNumber: formData.vatNumber,
        }),
      });

      const data = await response.json();

      if (data.valid) {
        setVatValidation({
          valid: true,
          companyName: data.companyName,
          address: data.address,
        });

        // Auto-fill company name if returned
        if (data.companyName) {
          setFormData((prev) => ({ ...prev, companyName: data.companyName }));
        }
      } else {
        setVatValidation({ valid: false });
        setError(data.error || 'VAT validation failed');
      }
    } catch {
      setError('Failed to validate VAT number');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/b2b/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      setSuccess(data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push(`/${locale}/b2b/login`);
      }, 3000);
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}

            {/* VAT Validation Section */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="font-medium text-gray-900">{t('businessVerification')}</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700">
                    {t('country')}
                  </label>
                  <select
                    id="countryCode"
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-red focus:border-brand-red sm:text-sm rounded-md border h-[42px]"
                  >
                    {EU_COUNTRIES.map((country) => (
                      <option key={country.code} value={country.code}>
                        {tc(country.code)} ({country.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700">
                    {t('vatNumber')} {formData.countryCode === 'PL' ? `(${t('nip')})` : ''} <span className="text-gray-400 font-normal">({t('optional')})</span>
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                      {formData.countryCode}
                    </span>
                    <input
                      type="text"
                      id="vatNumber"
                      name="vatNumber"
                      value={formData.vatNumber}
                      onChange={handleChange}
                      placeholder={formData.countryCode === 'PL' ? '1234567890' : '123456789'}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={validateVAT}
                disabled={isValidating || !formData.vatNumber}
                className="inline-flex items-center px-4 py-2 border border-brand-red text-sm font-medium rounded-md text-brand-red bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50"
              >
                {isValidating ? t('validating') : t('validateVat')}
              </button>

              {vatValidation && (
                <div className={`p-3 rounded ${vatValidation.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {vatValidation.valid ? (
                    <>
                      <p className="font-medium">{t('vatValid')}</p>
                      {vatValidation.companyName && (
                        <p className="text-sm mt-1">{t('companyLabel')} {vatValidation.companyName}</p>
                      )}
                      {vatValidation.address && (
                        <p className="text-sm">{t('addressLabel')} {vatValidation.address}</p>
                      )}
                    </>
                  ) : (
                    <p>{t('vatInvalid')}</p>
                  )}
                </div>
              )}
            </div>

            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">{t('companyInfo')}</h3>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  {t('companyName')}
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                    {t('contactPerson')}
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                    {t('phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">{t('businessAddress')}</h3>

              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700">
                  {t('streetAddress')}
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    {t('city')}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    {t('postalCode')}
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                  />
                </div>
              </div>
            </div>

            {/* Account Credentials */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">{t('accountCredentials')}</h3>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('emailAddress')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t('password')}
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t('confirmPassword')}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red sm:text-sm h-[42px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-red hover:bg-brand-red-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? t('registering') : t('registerButton')}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('hasAccount')}{' '}
              <Link href={`/${locale}/b2b/login`} className="font-medium text-brand-red hover:text-brand-red-hover">
                {t('signInLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
