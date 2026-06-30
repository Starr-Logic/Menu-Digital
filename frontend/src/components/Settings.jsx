import { Settings as SettingsIcon, Store, Clock, MapPin, Phone, Mail, Save, X } from 'lucide-react';
import { useState } from 'react';

export default function Settings({ onCancel }) {
  const [settings, setSettings] = useState({
    storeName: 'BiteQR Restaurant',
    storePhone: '+855 23 123 456',
    storeEmail: 'contact@biteqr.com',
    storeLocation: 'Phnom Penh, Cambodia',
    businessHours: '10:00 AM - 11:00 PM',
    deliveryZone: '5km radius',
    minOrderValue: '$5.00',
    currency: 'USD',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-fade-in" id="settings-container">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-100 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-teal-500" />
            Store Settings
          </h1>
          <p className="text-slate-400 text-sm mt-1">Manage your restaurant configuration</p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Success Message */}
      {saveMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-400 text-sm font-semibold">
          ✓ {saveMessage}
        </div>
      )}

      {/* Store Information Section */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Store className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-black text-slate-100">Store Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Name */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Store Name
            </label>
            <input
              type="text"
              name="storeName"
              value={settings.storeName}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Currency
            </label>
            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm focus:outline-none transition-all"
            >
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (៛)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              <Phone className="inline w-3 h-3 mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              name="storePhone"
              value={settings.storePhone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              <Mail className="inline w-3 h-3 mr-1" />
              Email Address
            </label>
            <input
              type="email"
              name="storeEmail"
              value={settings.storeEmail}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>

          {/* Location */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              <MapPin className="inline w-3 h-3 mr-1" />
              Store Location
            </label>
            <input
              type="text"
              name="storeLocation"
              value={settings.storeLocation}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Business Hours Section */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <Clock className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-black text-slate-100">Operating Hours</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Hours */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Business Hours
            </label>
            <input
              type="text"
              name="businessHours"
              value={settings.businessHours}
              onChange={handleChange}
              placeholder="e.g., 10:00 AM - 11:00 PM"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>

          {/* Min Order Value */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Minimum Order Value
            </label>
            <input
              type="text"
              name="minOrderValue"
              value={settings.minOrderValue}
              onChange={handleChange}
              placeholder="e.g., $5.00"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Delivery Settings Section */}
      <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <MapPin className="w-5 h-5 text-emerald-500" />
          <h2 className="text-lg font-black text-slate-100">Delivery Settings</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Zone */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Delivery Zone
            </label>
            <input
              type="text"
              name="deliveryZone"
              value={settings.deliveryZone}
              onChange={handleChange}
              placeholder="e.g., 5km radius"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 text-sm placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 justify-end pt-6 border-t border-slate-800">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 font-bold text-sm transition-all"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-600/50 text-white font-bold text-sm rounded-xl transition-all"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-slate-950/40 rounded-2xl border border-slate-800/50 p-6">
        <p className="text-xs text-slate-400 leading-relaxed">
          <span className="font-bold text-slate-300">💡 Tip:</span> These settings will be displayed in your restaurant's menu and used for orders. 
          Changes take effect immediately.
        </p>
      </div>
    </div>
  );
}
