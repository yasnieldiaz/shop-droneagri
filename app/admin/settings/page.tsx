'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // General Settings
  const [storeName, setStoreName] = useState('DroneAgri.pl');
  const [storeEmail, setStoreEmail] = useState('biuro@imegagroup.pl');
  const [storePhone, setStorePhone] = useState('+48 518 416 466');
  const [currency, setCurrency] = useState('PLN');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');

  // SMTP Gmail Settings
  const [smtpEnabled, setSmtpEnabled] = useState(true);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('DroneAgri.pl');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  // Vonage SMS Settings
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [vonageApiKey, setVonageApiKey] = useState('');
  const [vonageApiSecret, setVonageApiSecret] = useState('');
  const [vonageFromNumber, setVonageFromNumber] = useState('');
  const [showVonageSecret, setShowVonageSecret] = useState(false);

  // SMS Notifications
  const [smsOrderConfirmation, setSmsOrderConfirmation] = useState(true);
  const [smsShippingUpdate, setSmsShippingUpdate] = useState(true);
  const [smsDeliveryConfirmation, setSmsDeliveryConfirmation] = useState(false);

  // Bank Details
  const [bankName, setBankName] = useState('Bank Pekao S.A.');
  const [bankAccountPLN, setBankAccountPLN] = useState('');
  const [bankAccountEUR, setBankAccountEUR] = useState('');
  const [bankSwift, setBankSwift] = useState('PKOPPLPW');
  const [bankRecipient, setBankRecipient] = useState('IMEGA Sp. z o.o.');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        const s = data.settings || {};

        setStoreName(s.store_name || 'DroneAgri.pl');
        setStoreEmail(s.store_email || 'biuro@imegagroup.pl');
        setStorePhone(s.store_phone || '+48 518 416 466');
        setCurrency(s.currency || 'PLN');
        setLowStockThreshold(s.low_stock_threshold || '5');

        setSmtpEnabled(s.smtp_enabled !== 'false');
        setSmtpHost(s.smtp_host || 'smtp.gmail.com');
        setSmtpPort(s.smtp_port || '587');
        setSmtpUser(s.smtp_user || '');
        setSmtpPassword(s.smtp_password || '');
        setSmtpFromName(s.smtp_from_name || 'DroneAgri.pl');
        setSmtpFromEmail(s.smtp_from_email || '');

        setSmsEnabled(s.sms_enabled === 'true');
        setVonageApiKey(s.vonage_api_key || '');
        setVonageApiSecret(s.vonage_api_secret || '');
        setVonageFromNumber(s.vonage_from_number || '');
        setSmsOrderConfirmation(s.sms_order_confirmation !== 'false');
        setSmsShippingUpdate(s.sms_shipping_update !== 'false');
        setSmsDeliveryConfirmation(s.sms_delivery_confirmation === 'true');

        setBankName(s.bank_name || 'Bank Pekao S.A.');
        setBankRecipient(s.bank_recipient || 'IMEGA Sp. z o.o.');
        setBankAccountPLN(s.bank_account_pln || '');
        setBankAccountEUR(s.bank_account_eur || '');
        setBankSwift(s.bank_swift || 'PKOPPLPW');
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: storeName,
          store_email: storeEmail,
          store_phone: storePhone,
          currency: currency,
          low_stock_threshold: lowStockThreshold,
          smtp_enabled: smtpEnabled.toString(),
          smtp_host: smtpHost,
          smtp_port: smtpPort,
          smtp_user: smtpUser,
          smtp_password: smtpPassword,
          smtp_from_name: smtpFromName,
          smtp_from_email: smtpFromEmail,
          sms_enabled: smsEnabled.toString(),
          vonage_api_key: vonageApiKey,
          vonage_api_secret: vonageApiSecret,
          vonage_from_number: vonageFromNumber,
          sms_order_confirmation: smsOrderConfirmation.toString(),
          sms_shipping_update: smsShippingUpdate.toString(),
          sms_delivery_confirmation: smsDeliveryConfirmation.toString(),
          bank_name: bankName,
          bank_recipient: bankRecipient,
          bank_account_pln: bankAccountPLN,
          bank_account_eur: bankAccountEUR,
          bank_swift: bankSwift,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!smtpUser || !smtpPassword) {
      setMessage({ type: 'error', text: 'Please configure SMTP settings first and save them' });
      return;
    }

    setTestingEmail(true);
    setMessage(null);

    try {
      // First save the settings
      await handleSave();

      // Then send test email
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: storeEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Test email sent to ${storeEmail}!` });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send test email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test email' });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleTestSms = () => {
    alert('SMS feature coming soon. Test SMS would be sent to: ' + storePhone);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your store configuration</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            >
              <option value="PLN">PLN - Polish Zloty</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email SMTP Settings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Gmail SMTP</h2>
              <p className="text-sm text-gray-500">Configure email sending via Gmail</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={smtpEnabled}
              onChange={(e) => setSmtpEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-red/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
          </label>
        </div>
        {smtpEnabled && (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> For Gmail, use an App Password. Go to Google Account &rarr; Security &rarr; 2-Step Verification &rarr; App passwords. Enter password <strong>without spaces</strong>.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 bg-gray-50"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <select
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                >
                  <option value="587">587 (TLS - Recommended)</option>
                  <option value="465">465 (SSL)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gmail Address</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="biuro@imegagroup.pl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Password (no spaces)</label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value.replace(/\s/g, ''))}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 pr-10"
                    placeholder="xxxxxxxxxxxxxxxx"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSmtpPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="DroneAgri.pl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input
                  type="email"
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="biuro@imegagroup.pl"
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <button
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="px-4 py-2 border border-brand-red text-brand-red rounded-lg hover:bg-brand-red/10 transition-colors disabled:opacity-50"
              >
                {testingEmail ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Vonage SMS Settings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Vonage SMS</h2>
              <p className="text-sm text-gray-500">Configure SMS notifications via Vonage</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={smsEnabled}
              onChange={(e) => setSmsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-red/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-red"></div>
          </label>
        </div>
        {smsEnabled && (
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="text"
                  value={vonageApiKey}
                  onChange={(e) => setVonageApiKey(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                <input
                  type={showVonageSecret ? 'text' : 'password'}
                  value={vonageApiSecret}
                  onChange={(e) => setVonageApiSecret(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender Number / Name</label>
                <input
                  type="text"
                  value={vonageFromNumber}
                  onChange={(e) => setVonageFromNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
                  placeholder="+48123456789 or DroneAgri"
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <button
                onClick={handleTestSms}
                className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Send Test SMS
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inventory Settings */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
        </div>
        <div className="p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert Threshold</label>
            <input
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
            />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
              <input
                type="text"
                value={bankRecipient}
                onChange={(e) => setBankRecipient(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (PLN)</label>
            <input
              type="text"
              value={bankAccountPLN}
              onChange={(e) => setBankAccountPLN(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 font-mono"
              placeholder="PL XX XXXX XXXX XXXX XXXX XXXX XXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number (EUR)</label>
            <input
              type="text"
              value={bankAccountEUR}
              onChange={(e) => setBankAccountEUR(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 font-mono"
              placeholder="PL XX XXXX XXXX XXXX XXXX XXXX XXXX"
            />
          </div>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT/BIC Code</label>
            <input
              type="text"
              value={bankSwift}
              onChange={(e) => setBankSwift(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red/50 font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-brand-red text-white rounded-lg hover:bg-brand-red/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
