import React, { useState, memo } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';
import katex from 'katex';

export const CodeBlock = memo(({ node, inline, className, children, syntaxHighlight = true, ...props }: any) => {
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
    if (language === 'math' || language === 'latex') {
      try {
        const html = katex.renderToString(codeString, {
          displayMode: true,
          throwOnError: false,
        });
        return <span className="block my-4" dangerouslySetInnerHTML={{ __html: html }} />;
      } catch (e) {
        // Fallback to code block if KaTeX fails
      }
    }

    return (
      <span className="block relative group my-4 rounded-lg overflow-hidden bg-[#1E1E1E] border border-zinc-800">
        <span className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-xs text-zinc-400 font-mono border-b border-zinc-800">
          <span>{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 hover:text-white transition-colors focus:outline-none"
            title="Copy code"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </span>
        <span className="block overflow-x-auto">
          {syntaxHighlight ? (
            <SyntaxHighlighter
              style={vscDarkPlus as any}
              language={language}
              PreTag="span"
              customStyle={{ margin: 0, padding: '1rem', background: 'transparent', display: 'block' }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          ) : (
            <span className="block m-0 p-4 bg-transparent text-zinc-300 font-mono text-sm overflow-x-auto">
              <code>{codeString}</code>
            </span>
          )}
        </span>
      </span>
    );
  }

  return (
    <code className={`${className} bg-[var(--bg-tertiary)] text-[var(--accent-color)] px-1.5 py-0.5 rounded-md text-sm font-mono`} {...props}>
      {children}
    </code>
  );
});
