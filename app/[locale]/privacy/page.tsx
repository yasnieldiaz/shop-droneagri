import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  return {
    title: `${t('title')} | DroneAgri.pl`,
    description: t('metaDescription'),
  };
}

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-main py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-navy mb-8">
            {t('title')}
          </h1>

          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            {/* Administrator */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('administrator.title')}</h2>
              <p className="text-gray-600">{t('administrator.content')}</p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('dataCollection.title')}</h2>
              <p className="text-gray-600 mb-4">{t('dataCollection.intro')}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('dataCollection.personalData')}</li>
                <li>{t('dataCollection.businessData')}</li>
                <li>{t('dataCollection.technicalData')}</li>
                <li>{t('dataCollection.usageData')}</li>
              </ul>
            </section>

            {/* Processing Purposes */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('processingPurposes.title')}</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('processingPurposes.services')}</li>
                <li>{t('processingPurposes.newsletter')}</li>
                <li>{t('processingPurposes.orders')}</li>
                <li>{t('processingPurposes.complaints')}</li>
                <li>{t('processingPurposes.inquiries')}</li>
                <li>{t('processingPurposes.marketing')}</li>
                <li>{t('processingPurposes.legal')}</li>
              </ul>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('dataRetention.title')}</h2>
              <p className="text-gray-600">{t('dataRetention.content')}</p>
            </section>

            {/* Data Recipients */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('dataRecipients.title')}</h2>
              <p className="text-gray-600">{t('dataRecipients.content')}</p>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('userRights.title')}</h2>
              <p className="text-gray-600 mb-4">{t('userRights.intro')}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('userRights.access')}</li>
                <li>{t('userRights.correction')}</li>
                <li>{t('userRights.deletion')}</li>
                <li>{t('userRights.restriction')}</li>
                <li>{t('userRights.portability')}</li>
                <li>{t('userRights.objection')}</li>
                <li>{t('userRights.complaint')}</li>
              </ul>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('cookies.title')}</h2>
              <p className="text-gray-600 mb-4">{t('cookies.content')}</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>{t('cookies.session')}</li>
                <li>{t('cookies.analytics')}</li>
                <li>{t('cookies.marketing')}</li>
                <li>{t('cookies.functionality')}</li>
              </ul>
              <p className="text-gray-600 mt-4">{t('cookies.disable')}</p>
            </section>

            {/* Security */}
            <section>
              <h2 className="text-xl font-semibold text-navy mb-4">{t('security.title')}</h2>
              <p className="text-gray-600">{t('security.content')}</p>
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
