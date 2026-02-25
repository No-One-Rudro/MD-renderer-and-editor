import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  syntaxHighlight?: boolean;
}

export const MarkdownRenderer = memo(({ content, syntaxHighlight = true }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code: (props) => <CodeBlock {...props} syntaxHighlight={syntaxHighlight} />,
      }}
    >
      {content || '*No content to preview*'}
    </ReactMarkdown>
  );
});
