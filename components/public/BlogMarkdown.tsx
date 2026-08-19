'use client';

import ReactMarkdown from 'react-markdown';
import { isHtmlContent } from '@/lib/blog-content';

const proseClassName =
  "prose prose-neutral dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary prose-img:rounded-xl prose-img:shadow-md prose-p:text-muted-foreground prose-p:text-base md:prose-p:text-lg prose-p:leading-relaxed prose-li:text-muted-foreground";

export function BlogMarkdown({ content }: { content: string }) {
  const body = content || '';

  if (isHtmlContent(body)) {
    return (
      <div
        className={proseClassName}
        dangerouslySetInnerHTML={{ __html: body }}
      />
    );
  }

  return (
    <div className={proseClassName}>
      <ReactMarkdown
        components={{
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={typeof src === 'string' ? src : undefined}
              alt={alt || 'Blog image'}
              className="my-6 h-auto w-full rounded-xl object-cover"
              loading="lazy"
            />
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          p: ({ children }) => (
            <p className="mb-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1 className="font-heading mb-4 mt-10 text-3xl font-bold text-foreground md:text-4xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="font-heading mb-4 mt-10 text-2xl font-bold text-foreground md:text-3xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="font-heading mb-3 mt-8 text-xl font-semibold text-foreground md:text-2xl">
              {children}
            </h3>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-6 text-muted-foreground">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-6 text-muted-foreground">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-relaxed md:text-lg">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-primary pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {body}
      </ReactMarkdown>
    </div>
  );
}
