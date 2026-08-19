import Link from 'next/link';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { Folio } from '@/components/public/Folio';
import { CTASection } from '@/components/public/CTASection';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { getPublishedBlogPosts } from '@/lib/database';
import { BlogSearch } from '@/components/blog/BlogSearch';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const optimizeImageUrl = (url: string, width: number, height: number) => {
  if (url.includes('cloudinary')) {
    const transformations = `q_auto,f_auto,w_${width},h_${height},c_fill`;
    return url.replace('/image/upload/', `/image/upload/${transformations}/`);
  }
  return url;
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();
  const featuredPosts = posts.filter((post) => post.status === 'published').slice(0, 3);
  const latest = posts.filter((p) => !featuredPosts.some((f) => f.id === p.id));
  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));

  if (!posts || posts.length === 0) {
    return (
      <div className="wash-paper flex min-h-screen flex-col">
        <Navigation forceSolid />
        <main className="flex flex-1 items-center justify-center pt-16">
          <div className="text-center">
            <h2 className="mb-4 font-accent text-2xl font-medium">No stories yet</h2>
            <p className="text-muted-foreground">Check back soon for notes from the kingdom.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={optimizeImageUrl(
                'https://res.cloudinary.com/hqxti5zm/image/upload/q_auto,f_auto/sacred-himalaya/generated-taktsang.png',
                1920,
                1080
              )}
              alt="Tiger's Nest Monastery"
              className="luxury-photo h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/30" />
          </div>

          <div className="relative container pt-32 pb-16 md:pt-40 md:pb-24">
            <div className="mx-auto max-w-3xl text-center">
              <Folio index="01" label="Journal" onDark />
              <h1 className="font-accent mb-6 text-5xl font-medium tracking-tight text-[#E8D5A3] md:text-6xl">
                Stories from Bhutan
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-white/85">
                Authentic journeys, culture, and festival days — written by a locally owned operator in Thimphu.
              </p>
              <BlogSearch />
            </div>
          </div>
        </section>

        {featuredPosts.length > 0 && (
          <section className="wash-paper py-16 md:py-24">
            <div className="container">
              <ScrollReveal>
                <Folio index="02" label="Featured" />
                <h2 className="font-accent mb-12 text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                  Featured stories
                </h2>
              </ScrollReveal>
              <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                {featuredPosts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={Math.min(index * 0.04, 0.12)}>
                    <Link href={`/journal/${post.slug}`} className="group block">
                      {post.featured_image_url ? (
                        <img
                          src={optimizeImageUrl(post.featured_image_url, 800, 520)}
                          alt={post.title}
                          className="aspect-[16/10] w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-[16/10] bg-muted" />
                      )}
                      <p className="mt-4 text-[10px] font-semibold tracking-[0.16em] text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)] uppercase">
                        {post.category || 'Journal'}
                      </p>
                      <h3 className="font-accent mt-1.5 text-xl leading-snug font-medium tracking-tight group-hover:text-primary">
                        {post.title}
                      </h3>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {latest.length > 0 && (
          <section className="wash-dusk border-y border-primary/20 py-16 md:py-24">
            <div className="container">
              <ScrollReveal>
                <Folio index="03" label="Latest" />
                <h2 className="font-accent mb-12 text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                  From the desk
                </h2>
              </ScrollReveal>
              <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                {latest.map((post, index) => (
                  <ScrollReveal key={post.id} delay={Math.min(index * 0.04, 0.12)}>
                    <Link href={`/journal/${post.slug}`} className="group block">
                      {post.featured_image_url ? (
                        <img
                          src={optimizeImageUrl(post.featured_image_url, 800, 520)}
                          alt={post.title}
                          className="aspect-[16/10] w-full object-cover"
                        />
                      ) : (
                        <div className="aspect-[16/10] bg-muted" />
                      )}
                      <p className="mt-4 text-[10px] font-semibold tracking-[0.16em] text-[color-mix(in_srgb,var(--primary)_55%,#0a0a0a)] uppercase">
                        {post.category || 'Journal'}
                      </p>
                      <h3 className="font-accent mt-1.5 text-xl leading-snug font-medium tracking-tight group-hover:text-primary">
                        {post.title}
                      </h3>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {allTags.length > 0 && (
          <section className="wash-paper py-12 md:py-16">
            <div className="container">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
                {allTags.slice(0, 12).map((tag) => (
                  <Link
                    key={tag}
                    href={`/journal?tag=${encodeURIComponent(tag)}`}
                    className="text-foreground/70 underline-offset-4 hover:text-primary hover:underline"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <CTASection chapter="04" />
      </main>

      <Footer />
    </div>
  );
}
