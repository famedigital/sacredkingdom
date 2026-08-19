'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Loader2, Save, Mail, Phone, MapPin, Clock, Share2, MessageSquare } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { StaggerChildren } from '@/components/ui/scroll-reveal';
import { Switch } from '@/components/ui/switch';
import { SOCIAL_DEFAULTS } from '@/lib/content/social';

interface ContactContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    address: string;
    whatsapp?: string;
  };
  officeHours: {
    weekdays: string;
    saturdays: string;
    sundays: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    tripadvisor?: string;
  };
  formFields: {
    showName: boolean;
    showEmail: boolean;
    showPhone: boolean;
    showTravelDates: boolean;
    showGroupSize: boolean;
    showMessage: boolean;
    requiredFields: string[];
  };
  autoReply: {
    enabled: boolean;
    subject: string;
    message: string;
  };
}

type BooleanFormFieldKey = Exclude<keyof ContactContent['formFields'], 'requiredFields'>;

const formFieldsConfig: { key: BooleanFormFieldKey; label: string }[] = [
  { key: 'showName', label: 'Name Field' },
  { key: 'showEmail', label: 'Email Field' },
  { key: 'showPhone', label: 'Phone Field' },
  { key: 'showTravelDates', label: 'Travel Dates Field' },
  { key: 'showGroupSize', label: 'Group Size Field' },
  { key: 'showMessage', label: 'Message Field' }
];

const defaultContent: ContactContent = {
  hero: {
    title: 'Get in Touch',
    subtitle: "We're here to help you plan your perfect Bhutanese adventure",
    backgroundImage: 'https://res.cloudinary.com/hqxti5zm/image/upload/v1787140718/sacred-himalaya/generated-punakha.png'
  },
  contactInfo: {
    email: 'sacredkingdomtravel@gmail.com',
    phone: '+975 77888822',
    address: 'Changlam Plaza, Room No. 502, P.O. Box 1459, Thimphu, Bhutan',
    whatsapp: '+97577888822'
  },
  officeHours: {
    weekdays: '9:00 AM - 6:00 PM',
    saturdays: '9:00 AM - 3:00 PM',
    sundays: 'Closed'
  },
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    tripadvisor: SOCIAL_DEFAULTS.tripadvisor,
  },
  formFields: {
    showName: true,
    showEmail: true,
    showPhone: true,
    showTravelDates: true,
    showGroupSize: true,
    showMessage: true,
    requiredFields: ['name', 'email', 'message']
  },
  autoReply: {
    enabled: true,
    subject: 'Thank you for contacting Sacred Kingdom Travel!',
    message: 'We have received your inquiry and will respond within 24 hours. In the meantime, explore our tour packages for inspiration!'
  }
};

export function ContactSettingsForm() {
  const [content, setContent] = useState<ContactContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContactContent();
  }, []);

  const fetchContactContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content?type=contact');
      const data = await response.json();

      if (response.ok && data.content) {
        setContent({
          ...defaultContent,
          ...data.content,
          contactInfo: {
            ...defaultContent.contactInfo,
            ...(data.content.contactInfo || {}),
          },
          autoReply: {
            ...defaultContent.autoReply,
            ...(data.content.autoReply || {}),
          },
          formFields: {
            ...defaultContent.formFields,
            ...(data.content.formFields || {}),
          },
          officeHours: {
            ...defaultContent.officeHours,
            ...(data.content.officeHours || {}),
          },
          socialMedia: {
            ...defaultContent.socialMedia,
            ...(data.content.socialMedia || {}),
          },
        });
      }
    } catch (error) {
      console.error('Error fetching Contact content:', error);
      toast.error('Failed to load Contact page content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageType: 'contact',
          content,
          metadata: {
            seoTitle: 'Contact Us - Sacred Kingdom Travel',
            seoDescription: 'Get in touch with our team for personalized Bhutan travel planning and inquiries.'
          }
        })
      });

      if (response.ok) {
        toast.success('Contact settings updated successfully!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving Contact content:', error);
      toast.error('Failed to save Contact settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSection = <K extends keyof ContactContent>(section: K, data: ContactContent[K]) => {
    setContent(prev => ({ ...prev, [section]: data }));
  };

  const toggleFormField = (field: keyof ContactContent['formFields']) => {
    setContent(prev => ({
      ...prev,
      formFields: {
        ...prev.formFields,
        [field]: !prev.formFields[field]
      }
    }));
  };

  const toggleRequiredField = (field: string) => {
    setContent(prev => {
      const requiredFields = prev.formFields.requiredFields.includes(field)
        ? prev.formFields.requiredFields.filter(f => f !== field)
        : [...prev.formFields.requiredFields, field];

      return {
        ...prev,
        formFields: {
          ...prev.formFields,
          requiredFields
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl font-bold">Contact Page Settings</h2>
          <p className="text-muted-foreground">Manage contact information and form configuration</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[140px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <StaggerChildren>
        {/* Hero Section */}
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold mb-2">Hero Section</h3>
              <p className="text-muted-foreground text-sm">Banner content and background</p>
            </div>

            <div className="space-y-4">
              <FormField
                label="Title"
                value={content.hero.title}
                onChange={(e) => updateSection('hero', { ...content.hero, title: e.target.value })}
                placeholder="e.g., Get in Touch"
              />

              <FormField
                label="Subtitle"
                value={content.hero.subtitle}
                onChange={(e) => updateSection('hero', { ...content.hero, subtitle: e.target.value })}
                placeholder="Contact page subtitle..."
                textarea
                rows={2}
              />
            </div>
          </Card>
        </ScrollReveal>

        {/* Contact Information */}
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold mb-2">Contact Information</h3>
              <p className="text-muted-foreground text-sm">Main contact details displayed on the page</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <FormField
                    label="Email Address"
                    value={content.contactInfo.email}
                    onChange={(e) => updateSection('contactInfo', {
                      ...content.contactInfo,
                      email: e.target.value
                    })}
                    placeholder="e.g., sacredkingdomtravel@gmail.com"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <FormField
                    label="Phone Number"
                    value={content.contactInfo.phone}
                    onChange={(e) => updateSection('contactInfo', {
                      ...content.contactInfo,
                      phone: e.target.value
                    })}
                    placeholder="e.g., +975 2 327654"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1">
                  <FormField
                    label="Address"
                    value={content.contactInfo.address}
                    onChange={(e) => updateSection('contactInfo', {
                      ...content.contactInfo,
                      address: e.target.value
                    })}
                    placeholder="e.g., Thimphu, Bhutan"
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1 space-y-1">
                  <FormField
                    label="WhatsApp Number"
                    value={content.contactInfo.whatsapp || ''}
                    onChange={(e) => updateSection('contactInfo', {
                      ...content.contactInfo,
                      whatsapp: e.target.value
                    })}
                    placeholder="e.g., +97517643416"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used by public “WhatsApp us” / mobile WhatsApp buttons. Enter one number for the
                    chat link (E.164, e.g. +97577889283). If you list two with / or a space, only the
                    first is used — never paste them together without a separator.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Office Hours */}
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold mb-2">Office Hours</h3>
              <p className="text-muted-foreground text-sm">Business hours displayed on the contact page</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    label="Weekdays"
                    value={content.officeHours.weekdays}
                    onChange={(e) => updateSection('officeHours', {
                      ...content.officeHours,
                      weekdays: e.target.value
                    })}
                    placeholder="e.g., 9:00 AM - 6:00 PM"
                  />

                  <FormField
                    label="Saturdays"
                    value={content.officeHours.saturdays}
                    onChange={(e) => updateSection('officeHours', {
                      ...content.officeHours,
                      saturdays: e.target.value
                    })}
                    placeholder="e.g., 10:00 AM - 4:00 PM"
                  />

                  <FormField
                    label="Sundays"
                    value={content.officeHours.sundays}
                    onChange={(e) => updateSection('officeHours', {
                      ...content.officeHours,
                      sundays: e.target.value
                    })}
                    placeholder="e.g., Closed"
                  />
                </div>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Social Media Links */}
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold mb-2">Social Media</h3>
              <p className="text-muted-foreground text-sm">Social media profile links</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Share2 className="h-5 w-5 text-primary mt-1" />
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Facebook"
                    value={content.socialMedia.facebook || ''}
                    onChange={(e) => updateSection('socialMedia', {
                      ...content.socialMedia,
                      facebook: e.target.value
                    })}
                    placeholder="https://facebook.com/..."
                  />

                  <FormField
                    label="Instagram"
                    value={content.socialMedia.instagram || ''}
                    onChange={(e) => updateSection('socialMedia', {
                      ...content.socialMedia,
                      instagram: e.target.value
                    })}
                    placeholder="https://instagram.com/..."
                  />

                  <FormField
                    label="Twitter"
                    value={content.socialMedia.twitter || ''}
                    onChange={(e) => updateSection('socialMedia', {
                      ...content.socialMedia,
                      twitter: e.target.value
                    })}
                    placeholder="https://twitter.com/..."
                  />

                  <FormField
                    label="Tripadvisor"
                    value={content.socialMedia.tripadvisor || ''}
                    onChange={(e) => updateSection('socialMedia', {
                      ...content.socialMedia,
                      tripadvisor: e.target.value
                    })}
                    placeholder="https://www.tripadvisor.com/..."
                  />

                  <FormField
                    label="LinkedIn (optional)"
                    value={content.socialMedia.linkedin || ''}
                    onChange={(e) => updateSection('socialMedia', {
                      ...content.socialMedia,
                      linkedin: e.target.value
                    })}
                    placeholder="https://linkedin.com/company/..."
                  />
                </div>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {/* Form Fields Configuration */}
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold mb-2">Contact Form Fields</h3>
              <p className="text-muted-foreground text-sm">Configure which fields appear on the contact form</p>
            </div>

            <div className="space-y-4">
              {formFieldsConfig.map(field => (
                <div key={field.key} className="flex items-center justify-between py-3 border-b border-muted last:border-0">
                  <div>
                    <h4 className="font-medium">{field.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {content.formFields.requiredFields.includes(field.key.replace('show', '').toLowerCase()) ? '(Required)' : '(Optional)'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleRequiredField(field.key.replace('show', '').toLowerCase())}
                      className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${
                        content.formFields.requiredFields.includes(field.key.replace('show', '').toLowerCase())
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                      disabled={!content.formFields[field.key]}
                    >
                      Required
                    </button>
                    <Switch
                      checked={content.formFields[field.key]}
                      onCheckedChange={() => toggleFormField(field.key as keyof ContactContent['formFields'])}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </ScrollReveal>

        {/* Auto-Reply Configuration */}
        <ScrollReveal>
          <Card className="p-6">
            <div className="mb-6">
              <h3 className="font-heading text-xl font-bold mb-2">Auto-Reply Message</h3>
              <p className="text-muted-foreground text-sm">
                Confirmation email sent to guests after contact or booking requests. Use free Gmail
                SMTP (<code className="text-xs">SMTP_*</code>) or optional Resend in Vercel.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h4 className="font-medium">Enable Auto-Reply</h4>
                  <p className="text-sm text-muted-foreground">Send automatic confirmation email</p>
                </div>
                <Switch
                  checked={content.autoReply?.enabled ?? true}
                  onCheckedChange={(checked: boolean) => updateSection('autoReply', {
                    ...content.autoReply,
                    enabled: checked
                  })}
                />
              </div>

              <FormField
                label="Email Subject"
                value={content.autoReply?.subject || ''}
                onChange={(e) => updateSection('autoReply', {
                  ...content.autoReply,
                  subject: e.target.value
                })}
                placeholder="Auto-reply email subject..."
                disabled={!content.autoReply?.enabled}
              />

              <FormField
                label="Auto-Reply Message"
                value={content.autoReply?.message || ''}
                onChange={(e) => updateSection('autoReply', {
                  ...content.autoReply,
                  message: e.target.value
                })}
                placeholder="Message sent to users who contact you..."
                textarea
                rows={4}
                disabled={!content.autoReply?.enabled}
              />
              <p className="text-xs text-muted-foreground">
                Optional placeholders: <code className="text-xs">{'{{name}}'}</code>,{' '}
                <code className="text-xs">{'{{company}}'}</code>
              </p>
            </div>
          </Card>
        </ScrollReveal>
      </StaggerChildren>
    </div>
  );
}