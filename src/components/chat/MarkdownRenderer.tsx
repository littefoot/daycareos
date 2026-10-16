import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Ensure all links sanitized by DOMPurify safely open in a new tab
if (typeof window !== 'undefined') {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * High-performance, secure Markdown renderer for the ACCS AI Compliance Assistant.
 * Renders GitHub Flavored Markdown (headings, bold, lists, tables, code blocks, dividers)
 * with strict DOMPurify sanitization and neo-brutalist brand typography.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    try {
      const rawHtml = marked.parse(content, {
        gfm: true,
        breaks: true,
      }) as string;

      if (typeof window === 'undefined') {
        return rawHtml;
      }

      return DOMPurify.sanitize(rawHtml, {
        ADD_ATTR: ['target', 'rel'],
      });
    } catch (err) {
      console.error('Failed to parse assistant markdown:', err);
      return content;
    }
  }, [content]);

  return (
    <div
      className={`ai-chat-markdown leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
