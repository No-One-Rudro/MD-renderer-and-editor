import React, { useEffect, useRef, useDeferredValue, useState } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface PreviewProps {
  content: string;
  scrollPercentage?: number;
  syntaxHighlightRendered?: boolean;
}

function getVisibleContent(content: string, percentage: number, isMobile: boolean) {
  const lines = content.split('\n');
  const totalLines = lines.length;
  // Don't chunk small files to avoid unnecessary overhead
  if (totalLines < 100) return { visibleContent: content, paddingTop: 0, paddingBottom: 0 };

  const currentLine = Math.floor(totalLines * percentage);
  // 1.5 pages for mobile, 3 pages for PC (assuming roughly 50 lines per page)
  const buffer = isMobile ? 75 : 150; 
  
  let startLine = Math.max(0, currentLine - buffer);
  let endLine = Math.min(totalLines - 1, currentLine + buffer);
  
  // Adjust for code blocks to prevent breaking them
  let inCodeBlock = false;
  let codeBlockStart = -1;
  for (let i = 0; i < totalLines; i++) {
    if (lines[i].trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockStart = i;
      } else {
        inCodeBlock = false;
        if (startLine > codeBlockStart && startLine <= i) startLine = codeBlockStart;
        if (endLine >= codeBlockStart && endLine < i) endLine = i;
      }
    }
  }
  
  // Adjust for math blocks $$
  let inMathBlock = false;
  let mathBlockStart = -1;
  for (let i = 0; i < totalLines; i++) {
    if (lines[i].trim() === '$$') {
      if (!inMathBlock) {
        inMathBlock = true;
        mathBlockStart = i;
      } else {
        inMathBlock = false;
        if (startLine > mathBlockStart && startLine <= i) startLine = mathBlockStart;
        if (endLine >= mathBlockStart && endLine < i) endLine = i;
      }
    }
  }

  const visibleContent = lines.slice(startLine, endLine + 1).join('\n');
  
  // Estimate padding to keep scrollbar roughly accurate and prevent layout jumping
  const estimatedLineHeight = 24; // px
  const paddingTop = startLine * estimatedLineHeight;
  const paddingBottom = (totalLines - 1 - endLine) * estimatedLineHeight;

  return { visibleContent, paddingTop, paddingBottom };
}

export const Preview: React.FC<PreviewProps> = ({ content, scrollPercentage = 0, syntaxHighlightRendered = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { visibleContent, paddingTop, paddingBottom } = getVisibleContent(content, scrollPercentage, isMobile);
  
  // useDeferredValue ensures typing in the editor remains buttery smooth
  // by deferring the heavy markdown/latex rendering to the background
  const deferredContent = useDeferredValue(visibleContent);

  useEffect(() => {
    if (containerRef.current) {
      // Since we are using padding to simulate height, we need to scroll to the correct relative position
      const { scrollHeight, clientHeight } = containerRef.current;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll > 0) {
        containerRef.current.scrollTop = maxScroll * scrollPercentage;
      }
    }
  }, [scrollPercentage, deferredContent, paddingTop, paddingBottom]);

  // Trigger MathJax typesetting when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([containerRef.current]).catch((err: any) => console.error(err));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [deferredContent]);

  return (
    <div ref={containerRef} className="flex-1 h-full overflow-y-auto bg-[var(--bg-primary)] p-8 scroll-smooth transition-colors duration-200">
      <div style={{ height: paddingTop }} />
      <div 
        className={`prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-[var(--accent-color)] hover:prose-a:text-[var(--accent-color)] prose-pre:bg-transparent prose-pre:p-0 transition-opacity duration-200 ${visibleContent !== deferredContent ? 'opacity-50' : 'opacity-100'}`}
        style={{ contentVisibility: 'auto', containIntrinsicSize: '500px' }}
      >
        <MarkdownRenderer content={deferredContent} syntaxHighlight={syntaxHighlightRendered} />
      </div>
      <div style={{ height: paddingBottom }} />
    </div>
  );
};
