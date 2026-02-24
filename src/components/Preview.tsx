import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface PreviewProps {
  content: string;
}

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group my-4 rounded-lg overflow-hidden bg-[#1E1E1E]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-xs text-zinc-400 font-mono">
          <span>{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 hover:text-white transition-colors focus:outline-none"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={language}
          PreTag="div"
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className={`${className} bg-zinc-100 text-pink-600 px-1.5 py-0.5 rounded-md text-sm font-mono`} {...props}>
      {children}
    </code>
  );
};

export const Preview: React.FC<PreviewProps> = ({ content }) => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-white p-8">
      <div className="prose prose-zinc max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-pre:bg-transparent prose-pre:p-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            code: CodeBlock,
          }}
        >
          {content || '*No content to preview*'}
        </ReactMarkdown>
      </div>
    </div>
  );
};
