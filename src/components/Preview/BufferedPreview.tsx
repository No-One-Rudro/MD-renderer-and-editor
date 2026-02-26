import React, { useState, useEffect, useRef } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useSettings } from '../../context/SettingsContext';

interface BufferedPreviewProps {
  content: string;
}

const CHUNK_SIZE = 15000; // X characters max buffer

export const BufferedPreview: React.FC<BufferedPreviewProps> = ({ content }) => {
  const { settings } = useSettings();
  const [bufferStart, setBufferStart] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeBufferStart = Math.max(0, Math.min(bufferStart, content.length - CHUNK_SIZE));
  const visibleContent = content.length > CHUNK_SIZE 
    ? content.slice(safeBufferStart, safeBufferStart + CHUNK_SIZE) 
    : content;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (content.length <= CHUNK_SIZE) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
    
    // If scrolled to 2/3 of the current content height
    if (scrollPercentage > 0.66) {
      if (safeBufferStart + CHUNK_SIZE < content.length) {
        setBufferStart(Math.min(safeBufferStart + CHUNK_SIZE / 2, content.length - CHUNK_SIZE));
        // Adjust scroll position to maintain visual continuity (approximate)
        if (containerRef.current) {
          containerRef.current.scrollTop = scrollHeight * 0.33;
        }
      }
    } else if (scrollPercentage < 0.33) {
      if (safeBufferStart > 0) {
        setBufferStart(Math.max(0, safeBufferStart - CHUNK_SIZE / 2));
        // Adjust scroll position to maintain visual continuity (approximate)
        if (containerRef.current) {
          containerRef.current.scrollTop = scrollHeight * 0.66;
        }
      }
    }
  };

  useEffect(() => {
    if (content.length < safeBufferStart) {
      setBufferStart(0);
    }
  }, [content, safeBufferStart]);

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto bg-[var(--bg-secondary)] font-sans px-4 md:px-8 py-4 markdown-body custom-scrollbar"
      style={{
        fontFamily: "'Inter', 'Noto Sans Bengali', 'Noto Serif Bengali', 'Kalpurush', 'Siyam Rupali', 'SolaimanLipi', 'Nirmala UI', 'Vrinda', sans-serif"
      }}
    >
      <MarkdownRenderer 
        content={visibleContent} 
        syntaxHighlight={settings.syntaxHighlightRendered} 
      />
    </div>
  );
};
