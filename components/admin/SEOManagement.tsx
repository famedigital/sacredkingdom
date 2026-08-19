'use client';

import { useState, useEffect } from 'react';
import { Save, Globe, Mail, Phone, MapPin, Check, X, Search, Image as ImageIcon, FileText, Code2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SEOSettings {
  // Site Info
  site_name: string;
  site_tagline: string;
  site_description: string;
  site_url: string;

  // Contact Info
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  contact_city: string;
  contact_country: string;
  contact_timezone: string;

  // Social Media
  social_facebook: string;
  social_instagram: string;
  social_twitter: string;
  social_tripadvisor: string;

  // Global SEO
  seo_title_template: string;
  seo_description_template: string;
  seo_keywords: string;
  seo_robots: string;
  seo_canonical: string;

  // Open Graph
  og_title: string;
  og_description: string;
  og_image: string;
  og_type: string;

  // Twitter Cards
  twitter_card: string;
  twitter_site: string;
  twitter_creator: string;

  // Structured Data
  schema_organization: string;
  schema_website: string;
  schema_localbusiness: string;

  // Analytics
  google_analytics_id: string;
  google_tag_manager_id: string;
  facebook_pixel_id: string;

  // Verification
  google_site_verification: string;
  bing_site_verification: string;

  // Performance
  enable_cdn: boolean;
  enable_lazy_loading: boolean;
  enable_compression: boolean;
}

export function SEOManagement() {
  const [settings, setSettings] = useState<SEOSettings>({
    site_name: 'Sacred Kingdom Travel',
    site_tagline: 'Experience Bhutan like never before',
    site_description: 'Travel Bhutan with Sacred Kingdom Travel. Locally owned journeys through culture, treks, festivals, and wildlife.',
    site_url: 'https://sacredkingdom.travel',
    contact_email: 'sacredkingdomtravel@gmail.com',
    contact_phone: '+975 77888822',
    contact_address: 'Changlam Plaza, Room No. 502, P.O. Box 1459, Thimphu, Bhutan',
    contact_city: 'Thimphu',
    contact_country: 'Bhutan',
    contact_timezone: 'Asia/Thimphu',
    social_facebook: '',
    social_instagram: '',
    social_twitter: '',
    social_linkedin: '',
    social_tripadvisor:
      'https://www.tripadvisor.com/UserReviewEdit-g293845-d32891284-Sacred_Kingdom_Travel-Thimphu_Thimphu_District.html',
    seo_title_template: '{title} | Sacred Kingdom Travel',
    seo_description_template: '{description}',
    seo_keywords: 'Bhutan tours, trekking in Bhutan, cultural tours Bhutan, Bhutan travel, Himalaya tours, Buddhist festivals, Tiger\'s Nest',
    seo_robots: 'index, follow',
    seo_canonical: 'https://sacredkingdom.travel',
    og_title: 'Sacred Kingdom Travel',
    og_description: 'Experience authentic Bhutanese culture, breathtaking Himalayan landscapes, and spiritual journeys.',
    og_image: '',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    twitter_site: '',
    twitter_creator: '',
    schema_organization: '',
    schema_website: '',
    schema_localbusiness: '',
    google_analytics_id: '',
    google_tag_manager_id: '',
    facebook_pixel_id: '',
    google_site_verification: '',
    bing_site_verification: '',
    enable_cdn: true,
    enable_lazy_loading: true,
    enable_compression: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings?category=seo');
      const data = await response.json();
      if (data.settings) {
        // SEO form saves the whole object under key `seo_settings`
        const blob =
          data.settings.seo_settings && typeof data.settings.seo_settings === 'object'
            ? data.settings.seo_settings
            : data.settings;
        setSettings((prev) => ({
          ...prev,
          ...blob,
          site_name: normalizeCompanyName(
            data.settings.site_name || blob.site_name || prev.site_name
          ),
          site_tagline: data.settings.site_tagline || blob.site_tagline || prev.site_tagline,
          social_facebook:
            data.settings.social_facebook || blob.social_facebook || prev.social_facebook,
          social_instagram:
            data.settings.social_instagram || blob.social_instagram || prev.social_instagram,
          social_tripadvisor:
            data.settings.social_tripadvisor ||
            blob.social_tripadvisor ||
            prev.social_tripadvisor,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'seo_settings',
          value: settings,
          category: 'seo',
          description: 'Comprehensive SEO settings for the entire website',
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SEOSettings, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const tabs = [
    { id: 'general', label: 'General Info', icon: Globe },
    { id: 'seo', label: 'SEO Settings', icon: Search },
    { id: 'social', label: 'Social Media', icon: Shield },
    { id: 'structured', label: 'Structured Data', icon: Code2 },
    { id: 'analytics', label: 'Analytics & Tracking', icon: FileText },
    { id: 'performance', label: 'Performance', icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button type="button" onClick={handleSave} disabled={saving}>
          <Save className="size-4" />
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-600">Settings saved successfully!</p>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <X className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600">Failed to save settings. Please try again.</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-primary/20 bg-card">
          {/* Tabs */}
          <div className="border-b overflow-x-auto">
            <div className="flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">General Site Information</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Company name</label>
                    <input
                      type="text"
                      value={settings.site_name}
                      onChange={(e) => updateSetting('site_name', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Used across the public site, invoices, emails, and CRM alerts
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Tagline</label>
                    <input
                      type="text"
                      value={settings.site_tagline}
                      onChange={(e) => updateSetting('site_tagline', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Site Description</label>
                  <textarea
                    value={settings.site_description}
                    onChange={(e) => updateSetting('site_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Default description for your website"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for meta descriptions and SEO</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Site URL</label>
                  <input
                    type="url"
                    value={settings.site_url}
                    onChange={(e) => updateSetting('site_url', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://www.sacredhimalayatravel.com"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contact_email}
                      onChange={(e) => updateSetting('contact_email', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={settings.contact_phone}
                      onChange={(e) => updateSetting('contact_phone', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Address</label>
                  <input
                    type="text"
                    value={settings.contact_address}
                    onChange={(e) => updateSetting('contact_address', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={settings.contact_city}
                      onChange={(e) => updateSetting('contact_city', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <input
                      type="text"
                      value={settings.contact_country}
                      onChange={(e) => updateSetting('contact_country', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Timezone</label>
                    <select
                      value={settings.contact_timezone}
                      onChange={(e) => updateSetting('contact_timezone', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="Asia/Thimphu">Asia/Thimphu (BST +6:00)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'seo' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Search Engine Optimization</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title Template</label>
                    <input
                      type="text"
                      value={settings.seo_title_template}
                      onChange={(e) => updateSetting('seo_title_template', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="{title} | Sacred Kingdom Travel"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use {'{title}'} for page title</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description Template</label>
                    <input
                      type="text"
                      value={settings.seo_description_template}
                      onChange={(e) => updateSetting('seo_description_template', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="{description}"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use {'{description}'} for page content</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Global Keywords</label>
                  <textarea
                    value={settings.seo_keywords}
                    onChange={(e) => updateSetting('seo_keywords', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Comma-separated keywords for your entire website"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Robots</label>
                    <input
                      type="text"
                      value={settings.seo_robots}
                      onChange={(e) => updateSetting('seo_robots', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="index, follow"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Canonical URL</label>
                    <input
                      type="url"
                      value={settings.seo_canonical}
                      onChange={(e) => updateSetting('seo_canonical', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://www.sacredhimalayatravel.com"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">💡 SEO Best Practices</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use descriptive, keyword-rich titles (50-60 characters)</li>
                    <li>• Write compelling meta descriptions (150-160 characters)</li>
                    <li>• Include location-based keywords for local SEO</li>
                    <li>• Use canonical URLs to prevent duplicate content</li>
                    <li>• Keep robots.txt as "index, follow" for public pages</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Social Media Integration</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Facebook URL
                    </label>
                    <input
                      type="url"
                      value={settings.social_facebook}
                      onChange={(e) => updateSetting('social_facebook', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-pink-600" />
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      value={settings.social_instagram}
                      onChange={(e) => updateSetting('social_instagram', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      Twitter/X URL
                    </label>
                    <input
                      type="url"
                      value={settings.social_twitter}
                      onChange={(e) => updateSetting('social_twitter', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder=""
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-600" />
                      Tripadvisor URL
                    </label>
                    <input
                      type="url"
                      value={settings.social_tripadvisor}
                      onChange={(e) => updateSetting('social_tripadvisor', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="https://www.tripadvisor.com/..."
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-8">Open Graph Settings</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">OG Title</label>
                    <input
                      type="text"
                      value={settings.og_title}
                      onChange={(e) => updateSetting('og_title', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">OG Type</label>
                    <select
                      value={settings.og_type}
                      onChange={(e) => updateSetting('og_type', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="website">Website</option>
                      <option value="article">Article</option>
                      <option value="business.business">Business</option>
                      <option value="place">Place</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">OG Description</label>
                  <textarea
                    value={settings.og_description}
                    onChange={(e) => updateSetting('og_description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">OG Image URL</label>
                  <input
                    type="url"
                    value={settings.og_image}
                    onChange={(e) => updateSetting('og_image', e.target.value)}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="https://res.cloudinary.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630px, less than 5MB</p>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-8">Twitter Card Settings</h3>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Card Type</label>
                    <select
                      value={settings.twitter_card}
                      onChange={(e) => updateSetting('twitter_card', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="summary">Summary</option>
                      <option value="summary_large_image">Summary Large Image</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Site Handle</label>
                    <input
                      type="text"
                      value={settings.twitter_site}
                      onChange={(e) => updateSetting('twitter_site', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="@sacredhimalaya"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Creator Handle</label>
                    <input
                      type="text"
                      value={settings.twitter_creator}
                      onChange={(e) => updateSetting('twitter_creator', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="@sacredhimalaya"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'structured' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Structured Data (Schema.org)</h3>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold mb-2">⚠️ Advanced SEO</h4>
                  <p className="text-sm text-gray-700">
                    Structured data helps search engines understand your content better.
                    These settings generate JSON-LD schema markup automatically.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Organization Schema</label>
                  <textarea
                    value={settings.schema_organization}
                    onChange={(e) => updateSetting('schema_organization', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                    placeholder='{"@context": "https://schema.org", "@type": "Organization", "name": "Sacred Kingdom Travel"}'
                  />
                  <p className="text-xs text-gray-500 mt-1">JSON-LD format for organization information</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Website Schema</label>
                  <textarea
                    value={settings.schema_website}
                    onChange={(e) => updateSetting('schema_website', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                    placeholder='{"@context": "https://schema.org", "@type": "WebSite", "url": "https://www.sacredhimalayatravel.com"}'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Local Business Schema</label>
                  <textarea
                    value={settings.schema_localbusiness}
                    onChange={(e) => updateSetting('schema_localbusiness', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                    placeholder='{"@context": "https://schema.org", "@type": "LocalBusiness", "address": {...}}'
                  />
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">✅ Schema Validation</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Test your structured data using Google's Rich Results Test
                  </p>
                  <a
                    href="https://search.google.com/test/rich-results"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Open Rich Results Test
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Analytics & Tracking</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Google Analytics ID</label>
                    <input
                      type="text"
                      value={settings.google_analytics_id}
                      onChange={(e) => updateSetting('google_analytics_id', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="G-XXXXXXXXXX"
                    />
                    <p className="text-xs text-gray-500 mt-1">Google Analytics 4 (GA4) measurement ID</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Google Tag Manager ID</label>
                    <input
                      type="text"
                      value={settings.google_tag_manager_id}
                      onChange={(e) => updateSetting('google_tag_manager_id', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="GTM-XXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Facebook Pixel ID</label>
                    <input
                      type="text"
                      value={settings.facebook_pixel_id}
                      onChange={(e) => updateSetting('facebook_pixel_id', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="XXXXXXXXXX"
                    />
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-4 mt-8">Site Verification</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Google Search Console</label>
                    <input
                      type="text"
                      value={settings.google_site_verification}
                      onChange={(e) => updateSetting('google_site_verification', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Verification meta tag content"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Bing Webmaster Tools</label>
                    <input
                      type="text"
                      value={settings.bing_site_verification}
                      onChange={(e) => updateSetting('bing_site_verification', e.target.value)}
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Verification meta tag content"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">📊 Analytics Setup</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Set up Google Analytics 4 for visitor tracking</li>
                    <li>• Verify site ownership with Google Search Console</li>
                    <li>• Add Bing Webmaster Tools for comprehensive coverage</li>
                    <li>• Use Facebook Pixel for conversion tracking</li>
                    <li>• Regularly monitor performance in Google Search Console</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Performance Optimization</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <h4 className="font-semibold">Enable CDN</h4>
                      <p className="text-sm text-gray-500">Use Cloudinary CDN for static assets</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enable_cdn}
                        onChange={(e) => updateSetting('enable_cdn', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <h4 className="font-semibold">Enable Lazy Loading</h4>
                      <p className="text-sm text-gray-500">Load images as they enter viewport</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enable_lazy_loading}
                        onChange={(e) => updateSetting('enable_lazy_loading', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-xl">
                    <div>
                      <h4 className="font-semibold">Enable Compression</h4>
                      <p className="text-sm text-gray-500">Gzip compression for text-based assets</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.enable_compression}
                        onChange={(e) => updateSetting('enable_compression', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-semibold mb-2">⚡ Performance Tips</h4>
                  <ul className="text-sm space-y-1">
                    <li>• All Cloudinary images are automatically optimized (WebP, quality, size)</li>
                    <li>• Next.js 16 includes automatic code splitting and tree shaking</li>
                    <li>• Font optimization is enabled by default</li>
                    <li>• Static assets are served from CDN edge locations</li>
                    <li>• Monitor performance using PageSpeed Insights</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}