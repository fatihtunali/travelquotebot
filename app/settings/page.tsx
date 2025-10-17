'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Operator {
  id: string;
  companyName: string;
  subdomain: string;
  logoUrl: string | null;
  brandColors: {
    primary: string;
    secondary: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    companyName: '',
    logoUrl: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
  });

  useEffect(() => {
    const fetchOperator = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/operator/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load settings');
        }

        const data = await response.json();
        setOperator(data.operator);

        setFormData({
          companyName: data.operator.companyName,
          logoUrl: data.operator.logoUrl || '',
          primaryColor: data.operator.brandColors?.primary || '#3b82f6',
          secondaryColor: data.operator.brandColors?.secondary || '#8b5cf6',
        });
      } catch (err: any) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperator();
  }, [router]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload logo');
      }

      setFormData({ ...formData, logoUrl: data.url });
      setMessage('Logo uploaded successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/operator/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="glass-effect sticky top-0 z-50 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Branding Settings
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {message && (
          <div className={`mb-6 p-4 rounded-2xl ${
            message.includes('success')
              ? 'bg-green-50 border-2 border-green-300 text-green-700'
              : 'bg-red-50 border-2 border-red-300 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="bubble-card p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Company Information</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                placeholder="Your Company Name"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Company Logo
              </label>

              <div className="flex gap-3 mb-3">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                    className="hidden"
                    id="logo-upload"
                  />
                  <div className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer text-center">
                    <span className="text-blue-600 font-semibold">
                      {uploading ? 'Uploading...' : '📤 Upload Logo'}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Click to select an image (max 5MB)
                    </p>
                  </div>
                </label>
              </div>

              <div className="relative">
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  placeholder="Or paste a logo URL here"
                  disabled={uploading}
                />
              </div>

              {formData.logoUrl && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-medium text-gray-700 mb-2">Logo Preview:</p>
                  <img
                    src={formData.logoUrl}
                    alt="Logo preview"
                    className="max-h-24 object-contain"
                    onError={(e) => {
                      e.currentTarget.src = '';
                      e.currentTarget.alt = 'Failed to load image';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bubble-card p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Brand Colors</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-20 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all font-mono"
                  placeholder="#3b82f6"
                />
              </div>
              <div
                className="mt-3 p-4 rounded-xl text-white font-semibold text-center"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Primary Color Preview
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-20 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all font-mono"
                  placeholder="#8b5cf6"
                />
              </div>
              <div
                className="mt-3 p-4 rounded-xl text-white font-semibold text-center"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                Secondary Color Preview
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-3">Combined Preview</h3>
            <div className="flex gap-3">
              <button
                className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg transform hover:scale-105 transition-all"
                style={{ backgroundColor: formData.primaryColor }}
              >
                Primary Button
              </button>
              <button
                className="px-6 py-3 rounded-xl text-white font-semibold shadow-lg transform hover:scale-105 transition-all"
                style={{ backgroundColor: formData.secondaryColor }}
              >
                Secondary Button
              </button>
            </div>
          </div>
        </div>

        <div className="bubble-card p-8 bg-gradient-to-br from-cyan-50 to-blue-100">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Platform URL</h2>
          <div className="bg-white p-4 rounded-2xl border-2 border-blue-300 shadow-inner mb-3">
            <code className="text-blue-600 font-mono text-lg font-semibold">
              https://{operator?.subdomain}.travelquotebot.com
            </code>
          </div>
          <p className="text-sm text-gray-700">
            This is your white-labeled platform URL. Share it with your customers!
          </p>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </main>
    </div>
  );
}
