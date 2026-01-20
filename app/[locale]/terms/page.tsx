import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });

  return {
    title: `${t('title')} | DroneAgri.pl`,
    description: t('metaDescription'),
  };
}

export default function TermsPage() {
  const t = useTranslations('terms');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-main py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8">
            {t('title')}
          </h1>

          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            {/* General Provisions */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('general.title')}</h2>
              <p className="text-gray-600">{t('general.content')}</p>
            </section>

            {/* Technical Requirements */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('technical.title')}</h2>
              <p className="text-gray-600 mb-4">{t('technical.content')}</p>
              <p className="text-gray-600">{t('technical.prohibited')}</p>
            </section>

            {/* Order Process */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('orderProcess.title')}</h2>
              <p className="text-gray-600 mb-4">{t('orderProcess.intro')}</p>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>{t('orderProcess.step1')}</li>
                <li>{t('orderProcess.step2')}</li>
                <li>{t('orderProcess.step3')}</li>
                <li>{t('orderProcess.step4')}</li>
              </ol>
              <p className="text-gray-600 mt-4">{t('orderProcess.confirmation')}</p>
            </section>

            {/* Payments */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('payments.title')}</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('payments.bankTransfer')}</li>
                <li>{t('payments.online')}</li>
                <li>{t('payments.cod')}</li>
              </ul>
            </section>

            {/* Delivery */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('delivery.title')}</h2>
              <p className="text-gray-600">{t('delivery.content')}</p>
            </section>

            {/* Withdrawal */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('withdrawal.title')}</h2>
              <p className="text-gray-600">{t('withdrawal.content')}</p>
            </section>

            {/* Complaints */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('complaints.title')}</h2>
              <p className="text-gray-600">{t('complaints.content')}</p>
            </section>

            {/* Warranty */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('warranty.title')}</h2>
              <p className="text-gray-600 mb-4">{t('warranty.content')}</p>
              <p className="text-gray-600">{t('warranty.exclusions')}</p>
            </section>

            {/* Data Protection */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('dataProtection.title')}</h2>
              <p className="text-gray-600">{t('dataProtection.content')}</p>
            </section>

            {/* Final Provisions */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('finalProvisions.title')}</h2>
              <p className="text-gray-600">{t('finalProvisions.content')}</p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('contact.title')}</h2>
              <div className="text-gray-600 space-y-2">
                <p><strong>Email:</strong> biuro@imegagroup.pl</p>
                <p><strong>{t('contact.phone')}:</strong> +48 518 416 466</p>
                <p><strong>{t('contact.address')}:</strong> ul. Smolna 14, 44-200 Rybnik, Polska</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
