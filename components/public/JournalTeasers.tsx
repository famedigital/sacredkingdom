import Link from 'next/link';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Folio } from '@/components/public/Folio';
import type { BlogPost } from '@/lib/database';
import type { HomeContent } from '@/lib/content/home';

function optimizeImageUrl(url: string, width: number, height: number) {
  if (url.includes('cloudinary')) {
    const transformations = `q_auto,f_auto,w_${width},h_${height},c_fill`;
    return url.replace('/image/upload/', `/image/upload/${transformations}/`);
  }
  return url;
}

export function JournalTeasers({
  posts,
  content,
}: {
  posts: BlogPost[];
  content: HomeContent['journal'];
}) {
  if (!posts.length) return null;

  return (
    <section className="wash-paper py-16 md:py-24">
      <div className="container">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between gap-4 md:mb-12">
            <div className="max-w-2xl">
              <Folio index="08" label={content.eyebrow} />
              <h2 className="font-accent text-[clamp(2rem,3.4vw,3.2rem)] leading-[1.08] font-medium tracking-tight">
                {content.title}
              </h2>
            </div>
            <Link
              href="/journal"
              className="hidden text-[13px] font-medium tracking-[0.04em] underline-offset-4 hover:text-primary hover:underline md:inline"
            >
              All stories
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          {posts.slice(0, 3).map((post, index) => (
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
  );
}
