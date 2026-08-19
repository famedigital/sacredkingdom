import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Navigation } from '@/components/public/Navigation';
import { Footer } from '@/components/public/Footer';
import { Folio } from '@/components/public/Folio';
import { CTASection } from '@/components/public/CTASection';
import { Calendar, User, Clock, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/lib/database';
import { BlogMarkdown } from '@/components/public/BlogMarkdown';
import { buildSocialMetadata, SITE_NAME } from '@/lib/seo';

// Always fetch fresh posts after admin edits (avoid stale Vercel/RSC cache)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const optimizeImageUrl = (url: string | null | undefined, width: number, height: number) => {
  if (!url) return '/placeholder.jpg';
  if (url.includes('cloudinary')) {
    const transformations = `q_auto,f_auto,w_${width},h_${height},c_fill`;
    return url.replace('/image/upload/', `/image/upload/${transformations}/`);
  }
  return url;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogPostBySlug(slug);

  if (!blog) {
    return { title: `Post not found | ${SITE_NAME}` };
  }

  return buildSocialMetadata({
    title: blog.title,
    description: blog.meta_description || blog.excerpt || `Read ${blog.title} on ${SITE_NAME}.`,
    path: `/journal/${slug}`,
    image: blog.featured_image_url,
    type: 'article',
  });
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlogPostBySlug(slug);

  if (!blog) {
    notFound();
  }

  const allPosts = await getPublishedBlogPosts();
  const relatedPosts = allPosts
    .filter((post) => post.category === blog.category && post.id !== blog.id)
    .slice(0, 3);

  return (
    <div className="wash-paper flex min-h-screen flex-col">
      <Navigation forceSolid />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={optimizeImageUrl(blog.featured_image_url, 1920, 1080)}
              alt={blog.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/35" />
          </div>

          <div className="relative container pt-32 pb-16 md:pt-40 md:pb-24">
            <Link
              href="/journal"
              className="mb-6 inline-flex items-center gap-2 font-medium text-white/75 transition-colors hover:text-white"
            >
              <ArrowLeft className="size-4" />
              Back to Journal
            </Link>
            <div className="mx-auto max-w-4xl">
              <Folio index="01" label={blog.category || 'Journal'} onDark />
              <h1 className="font-accent mb-8 text-4xl font-medium text-[#E8D5A3] md:text-5xl lg:text-6xl">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/85">
                <span className="inline-flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  {blog.author_name}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  {format(new Date(blog.published_at || blog.created_at || new Date()), 'MMMM d, yyyy')}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  {Math.ceil(blog.content.length / 1000)} min read
                </span>
              </div>
            </div>
          </div>
        </section>

        <article className="wash-paper py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              {blog.tags.length > 0 && (
                <div className="mb-10 flex flex-wrap gap-x-4 gap-y-2 text-[13px]">
                  {blog.tags.map((tag) => (
                    <span key={tag} className="text-foreground/70">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <BlogMarkdown content={blog.content || ''} />

              {blog.author_bio ? (
                <div className="mt-16 border-t border-primary/20 pt-10">
                  <p className="font-accent text-xl font-medium">Written by {blog.author_name}</p>
                  <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">{blog.author_bio}</p>
                </div>
              ) : null}
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section className="wash-dusk border-y border-primary/20 py-16 md:py-20">
            <div className="container">
              <Folio index="02" label="Further reading" />
              <h2 className="font-accent mb-10 text-2xl font-medium md:text-3xl">Related stories</h2>
              <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                {relatedPosts.map((post) => (
                  <Link key={post.id} href={`/journal/${post.slug}`} className="group block">
                    {post.featured_image_url ? (
                      <img
                        src={optimizeImageUrl(post.featured_image_url, 600, 400)}
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
                ))}
              </div>
            </div>
          </section>
        )}

        <CTASection chapter="03" />
      </main>

      <Footer />
    </div>
  );
}
