'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Check } from 'lucide-react';

export function ContactForm() {
  const searchParams = useSearchParams();
  const intent = searchParams.get('intent') || 'inquire';
  const tourSlug = searchParams.get('tour') || '';
  const tourTitle = searchParams.get('title') || '';

  const isBooking = intent === 'book';

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    travelDates: '',
    groupSize: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (tourTitle || tourSlug) {
      setFormState((prev) => ({
        ...prev,
        message: prev.message
          ? prev.message
          : isBooking
            ? `I would like to book: ${tourTitle || tourSlug}.\nPreferred dates / group details:`
            : `I have a question about: ${tourTitle || tourSlug}.\n\n`,
      }));
    }
  }, [tourTitle, tourSlug, isBooking]);

  // Scroll form into view when arriving from Book / Inquire (or #contact-form hash)
  useEffect(() => {
    const shouldFocus =
      searchParams.has('intent') ||
      searchParams.has('tour') ||
      (typeof window !== 'undefined' && window.location.hash === '#contact-form');

    if (!shouldFocus) return;

    const scrollToForm = () => {
      const el = document.getElementById('contact-form');
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Wait for layout (hero + suspense) then scroll; retry once for mobile
    const t1 = window.setTimeout(scrollToForm, 100);
    const t2 = window.setTimeout(scrollToForm, 450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requiredFields = ['name', 'email', 'message'];
    const errors: Record<string, string> = {};

    requiredFields.forEach((field) => {
      if (!formState[field as keyof typeof formState]) {
        errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });

    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setSubmitting(true);

      const endpoint = isBooking ? '/api/booking-request' : '/api/contact';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formState,
          intent,
          tourSlug,
          tourTitle,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormState({
          name: '',
          email: '',
          phone: '',
          travelDates: '',
          groupSize: '',
          message: '',
        });
        setFormErrors({});
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mb-2 font-heading text-xl font-semibold">
          {isBooking ? 'Booking request sent!' : 'Message sent!'}
        </h3>
        <p className="text-muted-foreground">
          {isBooking
            ? 'Our team will confirm availability and get back to you within 24 hours.'
            : "Thank you for reaching out. We'll get back to you within 24 hours."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        {isBooking ? (
          <p>
            <span className="font-medium text-foreground">Booking request</span>
            {tourTitle ? ` for ${tourTitle}` : ''}. This creates a pending booking for our team to confirm.
          </p>
        ) : (
          <p>
            <span className="font-medium text-foreground">General inquiry</span>
            {tourTitle ? ` about ${tourTitle}` : ''}. We typically reply within 24 hours.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            name="name"
            value={formState.name}
            onChange={handleChange}
            placeholder="Your full name"
            aria-invalid={!!formErrors.name}
          />
          {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formState.email}
            onChange={handleChange}
            placeholder="you@email.com"
            aria-invalid={!!formErrors.email}
          />
          {formErrors.email && <p className="text-sm text-destructive">{formErrors.email}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            name="phone"
            value={formState.phone}
            onChange={handleChange}
            placeholder="+975 ..."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="groupSize">Group size</Label>
          <Input
            id="groupSize"
            type="text"
            name="groupSize"
            value={formState.groupSize}
            onChange={handleChange}
            placeholder="e.g. 2 adults"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="travelDates">Preferred travel dates</Label>
        <Input
          id="travelDates"
          type="text"
          name="travelDates"
          value={formState.travelDates}
          onChange={handleChange}
          placeholder="e.g. Oct 2026"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="message">Message *</Label>
        <Textarea
          id="message"
          name="message"
          value={formState.message}
          onChange={handleChange}
          placeholder="Tell us about your trip..."
          rows={5}
          aria-invalid={!!formErrors.message}
        />
        {formErrors.message && <p className="text-sm text-destructive">{formErrors.message}</p>}
      </div>

      <Button type="submit" disabled={submitting} className="w-full gap-2" size="lg">
        <Send className="h-4 w-4" />
        {submitting ? 'Sending...' : isBooking ? 'Submit booking request' : 'Send inquiry'}
      </Button>
    </form>
  );
}
