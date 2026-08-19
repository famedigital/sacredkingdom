import { marked } from 'marked';

/** True when content is already HTML (TipTap / WYSIWYG), not Markdown. */
export function isHtmlContent(content: string): boolean {
  const trimmed = (content || '').trim();
  if (!trimmed) return true;
  return /^<[a-z!/?]/i.test(trimmed);
}

/** Convert stored blog body to HTML for TipTap or public HTML rendering. */
export function normalizeBlogContentToHtml(content: string): string {
  if (!content?.trim()) return '';
  if (isHtmlContent(content)) return content;
  return marked.parse(content, { async: false }) as string;
}

/** Plain-text word count for read-time estimates (strips tags). */
export function blogWordCount(content: string): number {
  const text = (content || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#*_`>~\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 0;
  return text.split(' ').filter(Boolean).length;
}

export function estimateReadTimeMinutes(content: string): number {
  return Math.max(1, Math.ceil(blogWordCount(content) / 200));
}
