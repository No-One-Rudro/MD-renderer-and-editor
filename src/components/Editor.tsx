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
  scrollToLine?: number | null;
}

export const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  onScroll,
  autoCommentNextLine = false,
  syntaxHighlightRaw = false,
  scrollToLine
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [languagesLoaded, setLanguagesLoaded] = useState(false);

  // Handle external scroll request (reverse sync)
  useEffect(() => {
    if (scrollToLine !== undefined && scrollToLine !== null) {
      const lineHeight = 22.75; // Estimated line height
      const padding = 32; // p-8
      const targetScrollTop = (scrollToLine * lineHeight) + padding;
      
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
      }
    }
  }, [scrollToLine]);

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
    const target = e.target as HTMLTextAreaElement;
    
    // Safety check: if target doesn't have selection properties, it's not the textarea
    if (target.selectionStart === undefined || target.value === undefined) return;

    const { selectionStart, selectionEnd, value } = target;

    // Emacs-style keybindings
    if (e.ctrlKey) {
      switch (e.key) {
        case 'a': // Start of line
          e.preventDefault();
          const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
          target.setSelectionRange(lineStart, lineStart);
          break;
        case 'e': // End of line
          e.preventDefault();
          let lineEnd = value.indexOf('\n', selectionStart);
          if (lineEnd === -1) lineEnd = value.length;
          target.setSelectionRange(lineEnd, lineEnd);
          break;
        case 'k': // Kill line
          e.preventDefault();
          let nextLine = value.indexOf('\n', selectionStart);
          if (nextLine === -1) nextLine = value.length;
          // If at the end of line, kill the newline character
          if (nextLine === selectionStart && nextLine < value.length) nextLine++;
          const killedText = value.substring(selectionStart, nextLine);
          const newValueKilled = value.substring(0, selectionStart) + value.substring(nextLine);
          onChange(newValueKilled);
          // Optional: copy to clipboard
          navigator.clipboard.writeText(killedText).catch(() => {});
          break;
        case 'y': // Yank (paste)
          // Standard paste works, but we can intercept if we want custom yank buffer
          break;
        case 'p': // Previous line
          // Browser default might interfere, but we can try
          break;
        case 'n': // Next line
          break;
        case 'f': // Forward char
          e.preventDefault();
          target.setSelectionRange(selectionStart + 1, selectionStart + 1);
          break;
        case 'b': // Backward char
          e.preventDefault();
          target.setSelectionRange(Math.max(0, selectionStart - 1), Math.max(0, selectionStart - 1));
          break;
        case 'd': // Delete char
          e.preventDefault();
          const newValueD = value.substring(0, selectionStart) + value.substring(selectionStart + 1);
          onChange(newValueD);
          setTimeout(() => {
            target.setSelectionRange(selectionStart, selectionStart);
          }, 0);
          break;
        case 'h': // Backspace (Backward delete char)
          e.preventDefault();
          if (selectionStart > 0) {
            const newValueH = value.substring(0, selectionStart - 1) + value.substring(selectionStart);
            onChange(newValueH);
            setTimeout(() => {
              target.setSelectionRange(selectionStart - 1, selectionStart - 1);
            }, 0);
          }
          break;
      }
    }

    if (e.altKey) {
      switch (e.key) {
        case 'f': // Forward word
          e.preventDefault();
          const nextWord = value.indexOf(' ', selectionStart + 1);
          const nextLine = value.indexOf('\n', selectionStart + 1);
          const targetPos = Math.min(
            nextWord === -1 ? value.length : nextWord + 1,
            nextLine === -1 ? value.length : nextLine + 1
          );
          target.setSelectionRange(targetPos, targetPos);
          break;
        case 'b': // Backward word
          e.preventDefault();
          const prevWord = value.lastIndexOf(' ', selectionStart - 2);
          const prevLine = value.lastIndexOf('\n', selectionStart - 2);
          const targetPosB = Math.max(
            prevWord === -1 ? 0 : prevWord + 1,
            prevLine === -1 ? 0 : prevLine + 1
          );
          target.setSelectionRange(targetPosB, targetPosB);
          break;
      }
    }

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
    
    if (selectionStart !== undefined && value !== undefined) {
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
            value={content || ''}
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
          value={content || ''}
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
