import React, { useState, memo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Check, Copy } from 'lucide-react';

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
    return (
      <div className="relative group my-4 rounded-lg overflow-hidden bg-[#1E1E1E] border border-zinc-800">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2 bg-[#2D2D2D] text-xs text-zinc-400 font-mono border-b border-zinc-800">
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
        <div className="overflow-x-auto">
          {syntaxHighlight ? (
            <SyntaxHighlighter
              style={vscDarkPlus as any}
              language={language}
              PreTag="div"
              customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
              {...props}
            >
              {codeString}
            </SyntaxHighlighter>
          ) : (
            <pre className="m-0 p-4 bg-transparent text-zinc-300 font-mono text-sm overflow-x-auto">
              <code>{codeString}</code>
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <code className={`${className} bg-[var(--bg-tertiary)] text-[var(--accent-color)] px-1.5 py-0.5 rounded-md text-sm font-mono`} {...props}>
      {children}
    </code>
  );
});
