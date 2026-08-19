'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { Folio } from '@/components/public/Folio';
import { CTASection } from '@/components/public/CTASection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search } from 'lucide-react';
import Image from 'next/image';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/content?type=faq');
      const data = await response.json();

      if (response.ok) {
        // Fetch active FAQs
        const faqsResponse = await fetch('/api/admin/content/faqs');
        const faqsData = await faqsResponse.json();

        if (faqsResponse.ok) {
          const activeFaqs = faqsData.faqs.filter((faq: any) => faq.is_active);
          setFaqs(activeFaqs);

          // Extract unique categories
          const uniqueCategories = Array.from(new Set(activeFaqs.map((faq: any) => faq.category))) as string[];
          setCategories(uniqueCategories);
        }
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = !searchQuery ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group by category
  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const optimizeImageUrl = (url: string, width: number, height: number) => {
    if (!url) return '';
    if (url.includes('cloudinary')) {
      const transformations = `q_auto,f_auto,w_${width},h_${height},c_fill`;
      return url.replace('/image/upload/', `/image/upload/${transformations}/`);
    }
    return url;
  };

  if (loading) {
    return (
      <div className="wash-paper flex min-h-screen flex-col">
        <Navigation forceSolid />
        <main className="flex flex-1 items-center justify-center pt-16">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading answers…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wash-paper flex min-h-screen flex-col">
        <Navigation forceSolid />
        <main className="flex flex-1 items-center justify-center pt-16">
          <div className="text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={fetchFAQs}>Try again</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src={optimizeImageUrl(
                'https://res.cloudinary.com/hqxti5zm/image/upload/sacred-himalaya/generated-taktsang.png',
                1920,
                1080
              )}
              alt="Frequently Asked Questions"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/30" />
          </div>

          <div className="relative container pt-28 pb-16 md:pt-36 md:pb-24">
            <div className="mx-auto max-w-3xl text-center">
              <Folio index="01" label="FAQ" onDark />
              <h1 className="font-accent mb-5 text-4xl font-medium tracking-tight text-[#E8D5A3] md:text-5xl lg:text-6xl">
                Are you ready?
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/85">
                Visa, seasons, and how our Bhutanese team plans with you from Changlam Plaza, Thimphu.
              </p>
            </div>
          </div>
        </section>

        <section className="sticky top-16 z-30 border-b border-primary/20 wash-paper py-6">
          <div className="container">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <div className="relative w-full flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 bg-card pl-10"
                />
              </div>

              <div className="flex w-full items-center gap-2 overflow-x-auto md:w-auto">
                <Button
                  type="button"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="rounded-full text-[11px] uppercase tracking-[0.14em]"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    type="button"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    className="whitespace-nowrap rounded-full text-[11px] uppercase tracking-[0.14em]"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="wash-dusk py-16 md:py-20">
          <div className="container">
            {Object.keys(groupedFaqs).length > 0 ? (
              <div className="space-y-14">
                {Object.entries(groupedFaqs).map(([category, categoryFaqs]: [string, FAQ[]]) => (
                  <div key={category}>
                    <h2 className="font-accent text-2xl font-medium tracking-tight">{category}</h2>
                    <div className="mt-4">
                      {categoryFaqs.map((faq) => (
                        <div key={faq.id} className="border-t border-primary/20 py-6">
                          <h3 className="font-heading text-sm font-medium md:text-base">{faq.question}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <h3 className="font-accent mb-3 text-2xl font-medium">No answers match</h3>
                <p className="mb-8 text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all'
                    ? 'Try another search, or write to us.'
                    : 'No FAQs available yet.'}
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        <CTASection chapter="02" />
      </main>

      <Footer />
    </div>
  );
}