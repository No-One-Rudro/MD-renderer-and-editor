import React, { useRef, useEffect, useState } from 'react';
import EditorComponent from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css'; // Or any other theme

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onScroll?: (info: { percentage: number, topLine: number }) => void;
  autoCommentNextLine?: boolean;
  syntaxHighlightRaw?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  onScroll,
  autoCommentNextLine = false,
  syntaxHighlightRaw = false
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [languagesLoaded, setLanguagesLoaded] = useState(false);

  // ... (useEffect for Prism remains same)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).Prism = Prism;
    }
    // Load languages dynamically
    Promise.all([
      import('prismjs/components/prism-markup'),
      import('prismjs/components/prism-markdown'),
      import('prismjs/components/prism-latex')
    ]).then(() => setLanguagesLoaded(true)).catch(console.error);
  }, []);

  const highlightWithPrism = (code: string) => {
    if (!syntaxHighlightRaw || !languagesLoaded || !Prism.languages.markdown) return code;
    return Prism.highlight(code, Prism.languages.markdown, 'markdown');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    if (!onScroll) return;
    const target = e.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const maxScroll = scrollHeight - clientHeight;
    const percentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
    
    // Estimate top line
    // Assuming text-sm (14px) and leading-relaxed (1.625) => ~22.75px
    // Plus padding-top (p-8 = 2rem = 32px)
    const padding = 32;
    const lineHeight = 22.75;
    const effectiveScrollTop = Math.max(0, scrollTop - padding);
    const topLine = Math.floor(effectiveScrollTop / lineHeight);

    onScroll({ percentage, topLine });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
    // ... (handleKeyDown implementation remains same)
    if (autoCommentNextLine && e.key === 'Enter') {
      const target = e.target as HTMLTextAreaElement;
      const { selectionStart, value } = target;
      
      if (selectionStart === undefined) return;

      // Find the current line
      const textBeforeCursor = value.substring(0, selectionStart);
      const linesBeforeCursor = textBeforeCursor.split('\n');
      const currentLine = linesBeforeCursor[linesBeforeCursor.length - 1];
      
      // Check if current line starts with a comment or list item
      const match = currentLine.match(/^(\s*(?:>|-|\*|\d+\.)\s+)/);
      
      if (match) {
        e.preventDefault();
        const prefix = match[1];
        
        // If the line is just the prefix, remove it (like vim/most editors do)
        if (currentLine === prefix.trimEnd() || currentLine === prefix) {
          const newValue = value.substring(0, selectionStart - prefix.length) + '\n' + value.substring(selectionStart);
          onChange(newValue);
          // Need to set cursor position after render, but simple approach:
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = selectionStart - prefix.length + 1;
              textareaRef.current.selectionEnd = selectionStart - prefix.length + 1;
            } else {
              // For react-simple-code-editor
              target.selectionStart = selectionStart - prefix.length + 1;
              target.selectionEnd = selectionStart - prefix.length + 1;
            }
          }, 0);
        } else {
          const newValue = value.substring(0, selectionStart) + '\n' + prefix + value.substring(selectionStart);
          onChange(newValue);
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = selectionStart + 1 + prefix.length;
              textareaRef.current.selectionEnd = selectionStart + 1 + prefix.length;
            } else {
              target.selectionStart = selectionStart + 1 + prefix.length;
              target.selectionEnd = selectionStart + 1 + prefix.length;
            }
          }, 0);
        }
      }
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (!onScroll) return;
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, value } = target;
    if (selectionStart !== undefined) {
      const lines = value.substr(0, selectionStart).split('\n').length;
      const totalLines = value.split('\n').length;
      const percentage = totalLines > 1 ? (lines - 1) / (totalLines - 1) : 0;
      
      // Pass line number as topLine
      onScroll({ percentage, topLine: lines - 1 });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 h-full flex flex-col bg-[var(--bg-primary)] transition-colors duration-200 overflow-y-auto"
      onScroll={handleScroll}
    >
      {syntaxHighlightRaw ? (
        <div className="min-h-full p-8" onClick={handleKeyUp} onKeyUp={handleKeyUp}>
          <EditorComponent
            value={content}
            onValueChange={onChange}
            highlight={highlightWithPrism}
            padding={0}
            textareaId="code-editor"
            textareaClassName="focus:outline-none"
            className="font-mono text-sm text-[var(--text-primary)] leading-relaxed min-h-full"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          className="flex-1 w-full h-full p-8 resize-none focus:outline-none font-mono text-sm text-[var(--text-primary)] bg-[var(--bg-primary)] leading-relaxed transition-colors duration-200 whitespace-pre overflow-x-auto"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onClick={handleKeyUp}
          placeholder="Start typing your Markdown or LaTeX here..."
          spellCheck={false}
        />
      )}
    </div>
  );
};
