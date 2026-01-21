'use client';

import { useState } from 'react';

export default function SettingsPage() {
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

  const handleTestEmail = () => {
    alert('Test email would be sent to: ' + storeEmail);
  };

  const handleTestSms = () => {
    alert('Test SMS would be sent to: ' + storePhone);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your store configuration</p>
      </div>

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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={storeEmail}
              onChange={(e) => setStoreEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={storePhone}
              onChange={(e) => setStorePhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
            >
              <option value="PLN">PLN - Polish Złoty</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Email SMTP Settings (Gmail) */}
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00a651]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a651]"></div>
          </label>
        </div>
        {smtpEnabled && (
          <div className="p-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> For Gmail, you need to use an App Password. Go to your Google Account → Security → 2-Step Verification → App passwords to generate one.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50 bg-gray-50"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                <select
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">App Password</label>
                <div className="relative">
                  <input
                    type={showSmtpPassword ? 'text' : 'password'}
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50 pr-10"
                    placeholder="xxxx xxxx xxxx xxxx"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showSmtpPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                  placeholder="DroneAgri.pl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email</label>
                <input
                  type="email"
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                  placeholder="noreply@droneagri.pl"
                />
              </div>
            </div>
            <div className="pt-4 border-t">
              <button
                onClick={handleTestEmail}
                className="px-4 py-2 border border-[#00a651] text-[#00a651] rounded-lg hover:bg-[#00a651]/10 transition-colors"
              >
                Send Test Email
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
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00a651]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a651]"></div>
          </label>
        </div>
        {smsEnabled && (
          <div className="p-6 space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-800">
                <strong>Get your credentials:</strong> Log in to your <a href="https://dashboard.nexmo.com" target="_blank" rel="noopener noreferrer" className="underline">Vonage Dashboard</a> → API Settings to find your API Key and Secret.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <input
                  type="text"
                  value={vonageApiKey}
                  onChange={(e) => setVonageApiKey(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                  placeholder="abc12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Secret</label>
                <div className="relative">
                  <input
                    type={showVonageSecret ? 'text' : 'password'}
                    value={vonageApiSecret}
                    onChange={(e) => setVonageApiSecret(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50 pr-10"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVonageSecret(!showVonageSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showVonageSecret ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Sender Number / Name</label>
                <input
                  type="text"
                  value={vonageFromNumber}
                  onChange={(e) => setVonageFromNumber(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
                  placeholder="+48123456789 or DroneAgri"
                />
                <p className="text-xs text-gray-500 mt-1">Use a registered phone number or alphanumeric sender ID (max 11 characters)</p>
              </div>
            </div>

            {/* SMS Notification Types */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-3">SMS Notifications</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsOrderConfirmation}
                    onChange={(e) => setSmsOrderConfirmation(e.target.checked)}
                    className="w-4 h-4 text-[#00a651] border-gray-300 rounded focus:ring-[#00a651]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Order Confirmation</span>
                    <p className="text-xs text-gray-500">Send SMS when a new order is placed</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsShippingUpdate}
                    onChange={(e) => setSmsShippingUpdate(e.target.checked)}
                    className="w-4 h-4 text-[#00a651] border-gray-300 rounded focus:ring-[#00a651]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Shipping Update</span>
                    <p className="text-xs text-gray-500">Send SMS when order is shipped</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsDeliveryConfirmation}
                    onChange={(e) => setSmsDeliveryConfirmation(e.target.checked)}
                    className="w-4 h-4 text-[#00a651] border-gray-300 rounded focus:ring-[#00a651]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Delivery Confirmation</span>
                    <p className="text-xs text-gray-500">Send SMS when order is delivered</p>
                  </div>
                </label>
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
              className="w-full max-w-xs px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00a651]/50"
            />
            <p className="text-xs text-gray-500 mt-1">Products with stock below this number will trigger low stock alerts</p>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Bank Transfer Details</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-sm"><span className="font-medium">Bank:</span> Bank Pekao S.A.</p>
            <p className="text-sm"><span className="font-medium">Account (PLN):</span> PL XX XXXX XXXX XXXX XXXX XXXX XXXX</p>
            <p className="text-sm"><span className="font-medium">Account (EUR):</span> PL XX XXXX XXXX XXXX XXXX XXXX XXXX</p>
            <p className="text-sm"><span className="font-medium">SWIFT:</span> PKOPPLPW</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button className="px-6 py-2 bg-[#00a651] text-white rounded-lg hover:bg-[#00a651]/90 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
