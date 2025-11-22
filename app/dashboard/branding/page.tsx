'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function BrandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [organization, setOrganization] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    email: '',
    phone: '',
    country: '',
    logo_url: '',
    logo_dark_url: '',
    favicon_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#6366F1'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);

    // Fetch organization data
    fetch(`/api/organizations/${parsedUser.organizationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setOrganization(data);
        setFormData({
          name: data.name || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          country: data.country || '',
          logo_url: data.logo_url || '',
          logo_dark_url: data.logo_dark_url || '',
          favicon_url: data.favicon_url || '',
          primary_color: data.primary_color || '#3B82F6',
          secondary_color: data.secondary_color || '#6366F1'
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching organization:', error);
        setLoading(false);
      });

    // Load Cloudinary Upload Widget script
    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [router]);

  const openCloudinaryWidget = (field: 'logo_url' | 'logo_dark_url' | 'favicon_url') => {
    if (!window.cloudinary) {
      alert('Cloudinary widget is loading, please try again in a moment.');
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwgua2oxy';
    const uploadPreset = 'tqa_branding';

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        // Folder is optional - can be configured in the upload preset instead
        // folder: `tqa/${organization?.slug || 'default'}/branding`,
        clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp'],
        maxFileSize: 5000000,
        showPoweredBy: false,
        styles: {
          palette: {
            window: '#FFFFFF',
            windowBorder: '#E5E7EB',
            tabIcon: '#3B82F6',
            menuIcons: '#6B7280',
            textDark: '#1F2937',
            textLight: '#FFFFFF',
            link: '#3B82F6',
            action: '#3B82F6',
            inactiveTabIcon: '#9CA3AF',
            error: '#EF4444',
            inProgress: '#3B82F6',
            complete: '#10B981',
            sourceBg: '#F9FAFB'
          }
        }
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Upload error:', error);
          return;
        }
        if (result.event === 'success') {
          setFormData(prev => ({
            ...prev,
            [field]: result.info.secure_url
          }));
        }
      }
    );

    widget.open();
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Branding settings saved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to save settings'}`);
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600 mx-auto absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Branding Settings</h1>
        <p className="text-gray-600 mt-1">Customize your organization's brand identity</p>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-100 rounded-lg">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 group-hover:border-gray-300 placeholder:text-gray-400"
              placeholder="Enter company name"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 group-hover:border-gray-300 placeholder:text-gray-400"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 group-hover:border-gray-300 placeholder:text-gray-400"
              placeholder="contact@example.com"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 group-hover:border-gray-300 placeholder:text-gray-400"
              placeholder="+90 XXX XXX XX XX"
            />
          </div>

          <div className="group md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 group-hover:border-gray-300 placeholder:text-gray-400"
              placeholder="Turkey"
            />
          </div>
        </div>
      </div>

      {/* Logos & Images */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Logos & Images</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Logo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Main Logo
            </label>
            <div className="relative group">
              {formData.logo_url ? (
                <div className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-gray-50 to-white hover:border-teal-300 transition-all duration-300">
                  <img
                    src={formData.logo_url}
                    alt="Logo"
                    className="h-32 mx-auto object-contain mb-4"
                  />
                  <button
                    onClick={() => openCloudinaryWidget('logo_url')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Change Logo
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openCloudinaryWidget('logo_url')}
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-teal-500 hover:bg-teal-50/50 transition-all duration-300 group"
                >
                  <div className="text-gray-400 group-hover:text-teal-500 transition-colors mb-3">
                    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-teal-700">Upload Main Logo</p>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG up to 5MB</p>
                </button>
              )}
            </div>
          </div>

          {/* Dark Mode Logo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Dark Mode Logo
              <span className="text-gray-400 text-xs ml-1">(Optional)</span>
            </label>
            <div className="relative group">
              {formData.logo_dark_url ? (
                <div className="border-2 border-gray-700 rounded-2xl p-6 bg-gradient-to-br from-gray-900 to-gray-800 hover:border-gray-600 transition-all duration-300">
                  <img
                    src={formData.logo_dark_url}
                    alt="Dark Logo"
                    className="h-32 mx-auto object-contain mb-4"
                  />
                  <button
                    onClick={() => openCloudinaryWidget('logo_dark_url')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-sm font-medium rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg"
                  >
                    Change Logo
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openCloudinaryWidget('logo_dark_url')}
                  className="w-full border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center bg-gray-900 hover:border-gray-500 hover:bg-gray-800 transition-all duration-300 group"
                >
                  <div className="text-gray-500 group-hover:text-gray-300 transition-colors mb-3">
                    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-300 group-hover:text-white">Upload Dark Logo</p>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, SVG up to 5MB</p>
                </button>
              )}
            </div>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Favicon
            </label>
            <div className="relative group">
              {formData.favicon_url ? (
                <div className="border-2 border-gray-200 rounded-2xl p-6 bg-gradient-to-br from-teal-50 to-white hover:border-purple-300 transition-all duration-300">
                  <img
                    src={formData.favicon_url}
                    alt="Favicon"
                    className="h-32 mx-auto object-contain mb-4"
                  />
                  <button
                    onClick={() => openCloudinaryWidget('favicon_url')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-teal-600 to-pink-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Change Favicon
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openCloudinaryWidget('favicon_url')}
                  className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-500 hover:bg-purple-50/50 transition-all duration-300 group"
                >
                  <div className="text-gray-400 group-hover:text-purple-500 transition-colors mb-3">
                    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700">Upload Favicon</p>
                  <p className="text-xs text-gray-500 mt-2">ICO, PNG 32x32 or 64x64</p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Brand Colors</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Primary Color
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="h-16 w-16 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-teal-500 transition-all duration-200 shadow-lg"
                />
                <div className="absolute inset-0 rounded-xl ring-2 ring-offset-2 ring-transparent group-hover:ring-teal-500 transition-all duration-200 pointer-events-none"></div>
              </div>
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 font-mono uppercase group-hover:border-gray-300 placeholder:text-gray-400"
                placeholder="#3B82F6"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Used for buttons, links, and primary accents
            </p>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Secondary Color
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="h-16 w-16 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-cyan-500 transition-all duration-200 shadow-lg"
                />
                <div className="absolute inset-0 rounded-xl ring-2 ring-offset-2 ring-transparent group-hover:ring-cyan-500 transition-all duration-200 pointer-events-none"></div>
              </div>
              <input
                type="text"
                value={formData.secondary_color}
                onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 font-mono uppercase group-hover:border-gray-300 placeholder:text-gray-400"
                placeholder="#6366F1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Used for highlights and secondary UI elements
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Live Preview</h2>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 shadow-inner">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            {formData.logo_url ? (
              <div className="flex items-center gap-4">
                <img src={formData.logo_url} alt="Logo Preview" className="h-16 object-contain" />
                <div className="h-12 w-px bg-gray-200"></div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{formData.name}</p>
                  <p className="text-sm text-gray-500">{formData.website || 'yourwebsite.com'}</p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xl font-bold text-gray-900">{formData.name}</p>
                <p className="text-sm text-gray-500">{formData.website || 'yourwebsite.com'}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                style={{ backgroundColor: formData.primary_color }}
                className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Primary Button
              </button>
              <button
                style={{ backgroundColor: formData.secondary_color }}
                className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Secondary Button
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Email</p>
                <p className="text-gray-900 font-medium">{formData.email || 'contact@example.com'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Phone</p>
                <p className="text-gray-900 font-medium">{formData.phone || '+90 XXX XXX XX XX'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Country</p>
                <p className="text-gray-900 font-medium">{formData.country || 'Turkey'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Favicon</p>
                {formData.favicon_url ? (
                  <img src={formData.favicon_url} alt="Favicon" className="h-6 w-6 object-contain" />
                ) : (
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-sm border border-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving Changes...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
