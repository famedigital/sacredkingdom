'use client';

import {
  forwardRef,
  useImperativeHandle,
  useMemo,
} from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  Quote,
  Minus,
  Highlighter,
  RemoveFormatting,
  Link2Off,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { normalizeBlogContentToHtml, estimateReadTimeMinutes } from '@/lib/blog-content';

export interface RichTextEditorHandle {
  insertImage: (src: string, alt?: string) => void;
  focus: () => void;
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  /** Opens the media library instead of asking for a raw URL. */
  onRequestImage?: () => void;
  className?: string;
}

type BlockStyle = 'paragraph' | 'h1' | 'h2' | 'h3';

function MenuButton({
  onClick,
  isActive,
  children,
  title,
  disabled,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
      disabled={disabled}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-foreground/80 transition-colors',
        'hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40',
        isActive && 'bg-primary/10 text-primary'
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden />;
}

function FormatToolbar({
  editor,
  onRequestImage,
  compact = false,
}: {
  editor: Editor;
  onRequestImage?: () => void;
  compact?: boolean;
}) {
  const currentStyle: BlockStyle = editor.isActive('heading', { level: 1 })
    ? 'h1'
    : editor.isActive('heading', { level: 2 })
      ? 'h2'
      : editor.isActive('heading', { level: 3 })
        ? 'h3'
        : 'paragraph';

  const setBlockStyle = (style: BlockStyle) => {
    const chain = editor.chain().focus();
    if (style === 'paragraph') {
      chain.setParagraph().run();
      return;
    }
    const level = style === 'h1' ? 1 : style === 'h2' ? 2 : 3;
    chain.toggleHeading({ level }).run();
  };

  const addLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Paste the link URL:', previous || 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  const handleImageClick = () => {
    if (onRequestImage) {
      onRequestImage();
      return;
    }
    const url = window.prompt('Paste image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-0.5', compact && 'gap-0')}>
      {!compact && (
        <>
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo (Ctrl+Z)"
            disabled={!editor.can().undo()}
          >
            <Undo className="size-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo (Ctrl+Y)"
            disabled={!editor.can().redo()}
          >
            <Redo className="size-4" />
          </MenuButton>
          <ToolbarDivider />
          <label className="sr-only" htmlFor="blog-block-style">
            Text style
          </label>
          <select
            id="blog-block-style"
            value={currentStyle}
            onChange={(e) => setBlockStyle(e.target.value as BlockStyle)}
            className="mr-1 h-8 max-w-[9.5rem] rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            title="Styles"
          >
            <option value="paragraph">Normal text</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
          </select>
          <ToolbarDivider />
        </>
      )}

      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </MenuButton>
      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive('highlight')}
        title="Highlight"
      >
        <Highlighter className="size-4" />
      </MenuButton>

      {!compact && (
        <>
          <ToolbarDivider />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet list"
          >
            <List className="size-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Numbered list"
          >
            <ListOrdered className="size-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Quote"
          >
            <Quote className="size-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal line"
          >
            <Minus className="size-4" />
          </MenuButton>
          <ToolbarDivider />
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align left"
          >
            <AlignLeft className="size-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align center"
          >
            <AlignCenter className="size-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align right"
          >
            <AlignRight className="size-4" />
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            title="Justify"
          >
            <AlignJustify className="size-4" />
          </MenuButton>
          <ToolbarDivider />
        </>
      )}

      <MenuButton onClick={addLink} isActive={editor.isActive('link')} title="Insert link">
        <LinkIcon className="size-4" />
      </MenuButton>
      {editor.isActive('link') && (
        <MenuButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          title="Remove link"
        >
          <Link2Off className="size-4" />
        </MenuButton>
      )}
      {!compact && (
        <MenuButton onClick={handleImageClick} title="Insert image">
          <ImageIcon className="size-4" />
        </MenuButton>
      )}
      <MenuButton
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        title="Clear formatting"
      >
        <RemoveFormatting className="size-4" />
      </MenuButton>
    </div>
  );
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
      content,
      onChange,
      placeholder = 'Start writing… Select text to format, just like Google Docs.',
      onRequestImage,
      className,
    },
    ref
  ) {
    const initialHtml = useMemo(() => normalizeBlogContentToHtml(content), []);

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
          code: false,
          codeBlock: false,
        }),
        Image.configure({
          inline: false,
          allowBase64: false,
          HTMLAttributes: {
            class: 'rounded-lg max-w-full h-auto my-4',
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-primary underline underline-offset-2',
          },
        }),
        Highlight.configure({
          multicolor: false,
        }),
        Placeholder.configure({ placeholder }),
        CharacterCount.configure(),
        TextAlign.configure({
          types: ['heading', 'paragraph'],
        }),
      ],
      content: initialHtml,
      editorProps: {
        attributes: {
          class:
            'prose prose-neutral max-w-none min-h-[520px] px-8 py-10 sm:px-14 sm:py-12 focus:outline-none ' +
            'prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-base prose-img:rounded-lg',
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        insertImage: (src: string, alt?: string) => {
          if (!editor || !src) return;
          editor.chain().focus().setImage({ src, alt: alt || 'Image' }).run();
        },
        focus: () => editor?.chain().focus().run(),
      }),
      [editor]
    );

    if (!editor) {
      return (
        <div
          className={cn(
            'flex min-h-[560px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground',
            className
          )}
        >
          Loading editor…
        </div>
      );
    }

    const chars = editor.storage.characterCount.characters() as number;
    const words = editor.storage.characterCount.words?.() as number | undefined;
    const wordCount =
      typeof words === 'number'
        ? words
        : editor.getText().trim().split(/\s+/).filter(Boolean).length;

    return (
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-border bg-card shadow-sm',
          className
        )}
      >
        {/* Sticky Google Docs–style toolbar */}
        <div className="sticky top-0 z-10 border-b border-border bg-white/95 px-2 py-2 shadow-sm backdrop-blur-sm sm:px-4">
          <div className="mx-auto flex max-w-4xl flex-col gap-1">
            <FormatToolbar editor={editor} onRequestImage={onRequestImage} />
            <p className="hidden px-1 text-xs text-muted-foreground sm:block">
              Tip: select text to open a floating format bar — bold, italic, highlight, and links
              without leaving the page.
            </p>
          </div>
        </div>

        {/* Floating selection toolbar (Google Docs style) */}
        <BubbleMenu
          editor={editor}
          options={{ placement: 'top' }}
          className="z-50 flex items-center gap-0.5 rounded-lg border border-border bg-white px-1.5 py-1 shadow-lg"
        >
          <FormatToolbar editor={editor} compact />
        </BubbleMenu>

        {/* Document page canvas */}
        <div className="bg-[#f0eeea] px-2 py-5 sm:px-8 sm:py-8">
          <div className="mx-auto min-h-[640px] max-w-[816px] rounded-sm border border-black/5 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)]">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <span>
            {wordCount} words · ~{estimateReadTimeMinutes(editor.getText())} min read
          </span>
          <span>{chars} characters</span>
        </div>
      </div>
    );
  }
);
