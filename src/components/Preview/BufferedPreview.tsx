import React, { useState, useEffect, useRef } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { useSettings } from '../../context/SettingsContext';

interface BufferedPreviewProps {
  content: string;
}

const CHUNK_SIZE = 5000; // Characters to render initially

export const BufferedPreview: React.FC<BufferedPreviewProps> = ({ content }) => {
  const { settings } = useSettings();
  const [visibleContent, setVisibleContent] = useState('');
  const [renderLimit, setRenderLimit] = useState(CHUNK_SIZE);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset limit when content changes significantly (new file)
  // Or maybe just update visible content based on limit
  useEffect(() => {
    setVisibleContent(content.slice(0, renderLimit));
  }, [content, renderLimit]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    
    // If scrolled to 2/3 of the current content height
    if (scrollTop + clientHeight > scrollHeight * 0.66) {
      if (renderLimit < content.length) {
        setRenderLimit(prev => Math.min(prev + CHUNK_SIZE, content.length));
      }
    }
  };

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
      {renderLimit < content.length && (
        <div className="py-4 text-center text-[var(--text-tertiary)] text-sm">
          Loading more content...
        </div>
      )}
    </div>
  );
};
