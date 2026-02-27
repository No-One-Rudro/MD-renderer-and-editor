import React, { useRef, useEffect, useState } from 'react';
import EditorComponent from 'react-simple-code-editor';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import { useEditorKeybindings } from '../hooks/useEditorKeybindings';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onScroll?: (info: { percentage: number, topLine: number }) => void;
  onClickLine?: (line: number) => void;
  autoCommentNextLine?: boolean;
  syntaxHighlightRaw?: boolean;
  scrollToLine?: number | null;
  percentage?: number | null;
  minimal?: boolean;
  autoFocus?: boolean;
  debounceMs?: number;
}

export const Editor: React.FC<EditorProps> = ({ 
  content, 
  onChange, 
  onScroll,
  onClickLine,
  autoCommentNextLine = false,
  syntaxHighlightRaw = false,
  scrollToLine,
  percentage,
  minimal = false,
  autoFocus = false,
  debounceMs = 300
}) => {
  const [localContent, setLocalContent] = useState(content);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (!isInternalChange.current && content !== localContent) {
      setLocalContent(content);
    }
    isInternalChange.current = false;
  }, [content]);

  const handleLocalChange = (newContent: string) => {
    isInternalChange.current = true;
    setLocalContent(newContent);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    if (debounceMs > 0) {
      debounceTimer.current = setTimeout(() => {
        onChange(newContent);
      }, debounceMs);
    } else {
      onChange(newContent);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { handleKeyDown } = useEditorKeybindings(handleLocalChange, autoCommentNextLine, textareaRef);

  // Handle scroll sync based on percentage or scrollToLine
  useEffect(() => {
    if (containerRef.current) {
      if (percentage !== undefined && percentage !== null) {
        const { scrollHeight, clientHeight } = containerRef.current;
        const targetScrollTop = percentage * (scrollHeight - clientHeight);
        if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 10) {
          containerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'auto'
          });
        }
      } else if (scrollToLine !== undefined && scrollToLine !== null) {
        const lineHeight = 22.75; // Estimated line height
        const padding = minimal ? 0 : 32; // p-8
        const targetScrollTop = (scrollToLine * lineHeight) + padding;
        
        // Only scroll if it's significantly different to avoid loops
        if (Math.abs(containerRef.current.scrollTop - targetScrollTop) > 10) {
          containerRef.current.scrollTo({
            top: targetScrollTop,
            behavior: 'auto'
          });
        }
      }
    }
  }, [scrollToLine, percentage, minimal]);

  const highlightWithPrism = (code: string) => {
    if (!syntaxHighlightRaw || !Prism.languages.markdown) return code;
    return Prism.highlight(code, Prism.languages.markdown, 'markdown');
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement | HTMLTextAreaElement>) => {
    if (!onScroll) return;
    const target = e.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    
    // Estimate top line
    const padding = minimal ? 0 : 32;
    const lineHeight = 22.75;
    const effectiveScrollTop = Math.max(0, scrollTop - padding);
    const topLine = Math.floor(effectiveScrollTop / lineHeight);

    const maxScroll = scrollHeight - clientHeight;
    const percentage = maxScroll > 0 ? scrollTop / maxScroll : 0;

    onScroll({ percentage, topLine });
  };

  const handleKeyUp = (e: React.KeyboardEvent | React.MouseEvent) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, value } = target;
    if (selectionStart !== undefined) {
      const lines = value.substr(0, selectionStart).split('\n').length;
      const totalLines = value.split('\n').length;
      const percentage = totalLines > 1 ? (lines - 1) / (totalLines - 1) : 0;
      
      const currentLine = lines - 1;
      
      // Auto-sync
      if (onScroll) {
        onScroll({ percentage, topLine: currentLine });
      }
      
      // Manual click-to-sync
      if (e.type === 'click' && onClickLine) {
        onClickLine(currentLine);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 h-full flex flex-col ${minimal ? '' : 'bg-[var(--bg-primary)]'} transition-colors duration-200 overflow-y-auto`}
      onScroll={handleScroll}
    >
      {syntaxHighlightRaw ? (
        <div className={`min-h-full ${minimal ? 'p-0' : 'p-8'}`} onClick={handleKeyUp} onKeyUp={handleKeyUp}>
          <EditorComponent
            value={localContent || ''}
            onValueChange={handleLocalChange}
            highlight={highlightWithPrism}
            padding={0}
            textareaId="code-editor"
            textareaClassName="focus:outline-none"
            className="font-mono text-sm text-[var(--text-primary)] leading-relaxed min-h-full"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
          />
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          className={`flex-1 w-full h-full ${minimal ? 'p-0' : 'p-8'} resize-none focus:outline-none font-mono text-sm text-[var(--text-primary)] ${minimal ? 'bg-transparent' : 'bg-[var(--bg-primary)]'} leading-relaxed transition-colors duration-200 whitespace-pre overflow-x-auto custom-scrollbar`}
          value={localContent || ''}
          onChange={(e) => handleLocalChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onClick={handleKeyUp}
          placeholder="Start typing your Markdown or LaTeX here..."
          spellCheck={false}
          autoFocus={autoFocus}
        />
      )}
    </div>
  );
};
