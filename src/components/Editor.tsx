import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import EditorComponent from 'react-simple-code-editor';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-graphql';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-makefile';
import 'prismjs/themes/prism-tomorrow.css';
import { useEditorKeybindings } from '../hooks/useEditorKeybindings';

export interface EditorHandle {
  insertAtCursor: (text: string) => void;
  wrapSelection: (prefix: string, suffix: string, defaultText?: string) => void;
  getSelection: () => { start: number; end: number; text: string };
  replaceSelection: (text: string) => void;
  focus: () => void;
}

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
  className?: string;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(({ 
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
  debounceMs = 300,
  className
}, ref) => {
  const [localContent, setLocalContent] = useState(content);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isInternalChange = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // To restore selection after programmatic updates
  const pendingSelectionRef = useRef<{ start: number, end: number } | null>(null);

  useEffect(() => {
    if (!isInternalChange.current && content !== localContent) {
      setLocalContent(content);
    }
    isInternalChange.current = false;
  }, [content]);

  // Restore selection after render if pending
  useEffect(() => {
    if (pendingSelectionRef.current) {
      const textarea = syntaxHighlightRaw 
        ? document.getElementById('code-editor') as HTMLTextAreaElement
        : textareaRef.current;
        
      if (textarea) {
        textarea.setSelectionRange(pendingSelectionRef.current.start, pendingSelectionRef.current.end);
        textarea.focus();
        pendingSelectionRef.current = null;
      }
    }
  });

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

  const getTextArea = () => {
    return syntaxHighlightRaw 
      ? document.getElementById('code-editor') as HTMLTextAreaElement
      : textareaRef.current;
  };

  useImperativeHandle(ref, () => ({
    insertAtCursor: (text: string) => {
      const textarea = getTextArea();
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;
      
      const newText = currentText.substring(0, start) + text + currentText.substring(end);
      
      handleLocalChange(newText);
      pendingSelectionRef.current = { start: start + text.length, end: start + text.length };
    },
    wrapSelection: (prefix: string, suffix: string, defaultText: string = '') => {
      const textarea = getTextArea();
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;
      const selectedText = currentText.substring(start, end) || defaultText;
      
      const newText = currentText.substring(0, start) + prefix + selectedText + suffix + currentText.substring(end);
      
      handleLocalChange(newText);
      // Select the wrapped text (excluding prefix/suffix)
      pendingSelectionRef.current = { start: start + prefix.length, end: start + prefix.length + selectedText.length };
    },
    replaceSelection: (text: string) => {
      const textarea = getTextArea();
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentText = textarea.value;
      
      const newText = currentText.substring(0, start) + text + currentText.substring(end);
      
      handleLocalChange(newText);
      pendingSelectionRef.current = { start: start + text.length, end: start + text.length };
    },
    getSelection: () => {
      const textarea = getTextArea();
      if (!textarea) return { start: 0, end: 0, text: '' };
      return {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
        text: textarea.value.substring(textarea.selectionStart, textarea.selectionEnd)
      };
    },
    focus: () => {
      const textarea = getTextArea();
      if (textarea) textarea.focus();
    }
  }));

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

    // 1. Tokenize with Markdown
    const tokens = Prism.tokenize(code, Prism.languages.markdown);

    // 2. Process tokens to find code blocks and highlight them
    const processedTokens = tokens.map(token => {
      if (typeof token === 'string' || token.type !== 'code') {
        return token;
      }

      // It's a code block. Content might be string or array of tokens/strings.
      // We stringify it to get the raw text of the block to parse it ourselves.
      const blockContent = Prism.Token.stringify(token.content, 'markdown');
      
      // Regex to parse fenced code block: ```lang ... ```
      // Captures: 1=OpenFence, 2=Lang, 3=Body, 4=CloseFence
      // We allow optional spaces around lang
      // Note: This regex assumes the block starts with ```lang
      const match = blockContent.match(/^(\s*`{3,})(?:[ \t]*)([a-zA-Z0-9_\-]+)(?:[ \t]*)((?:\r\n|\r|\n)[\s\S]*?)(\s*`{3,}\s*)$/);

      if (match) {
        const [, openFence, lang, body, closeFence] = match;
        const grammar = Prism.languages[lang] || Prism.languages[lang.toLowerCase()];

        if (grammar) {
          // Highlight the body with the specific language
          const highlightedBody = Prism.tokenize(body, grammar);

          // Reconstruct the token content
          token.content = [
            new Prism.Token('punctuation', openFence),
            new Prism.Token('language-' + lang, lang),
            ...highlightedBody,
            new Prism.Token('punctuation', closeFence)
          ];
        }
      }
      
      return token;
    });

    return Prism.Token.stringify(processedTokens, 'markdown');
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
      const lines = value.substr(0, selectionStart).split('\n');
      const currentLineIdx = lines.length - 1;
      const currentLineText = lines[currentLineIdx];
      
      // Calculate visual position within the line
      // If line is long, cursor position within it matters for sync
      const lineProgress = currentLineText.length > 0 ? selectionStart / value.length : 0;
      
      // We use a more granular percentage that accounts for cursor position
      const totalChars = value.length || 1;
      const granularPercentage = selectionStart / totalChars;
      
      // Auto-sync
      if (onScroll) {
        onScroll({ percentage: granularPercentage, topLine: currentLineIdx });
      }
      
      // Manual click-to-sync
      if (e.type === 'click' && onClickLine) {
        onClickLine(currentLineIdx);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex-1 h-full flex flex-col ${minimal ? '' : 'bg-[var(--bg-primary)]'} transition-colors duration-200 overflow-y-auto ${className || ''}`}
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
});
