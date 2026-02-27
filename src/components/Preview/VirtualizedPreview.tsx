import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { MarkdownRenderer } from './MarkdownRenderer';
import { splitMarkdownIntoChunks } from '../../utils/markdownSplitter';
import { useSettings } from '../../context/SettingsContext';
import clsx from 'clsx';

interface VirtualizedPreviewProps {
  content: string;
  topLine?: number;
  percentage?: number;
  onChunkClick?: (line: number) => void;
  onScroll?: (info: { percentage: number, topLine: number }) => void;
}

export const VirtualizedPreview: React.FC<VirtualizedPreviewProps> = ({ content, topLine, percentage, onChunkClick, onScroll }) => {
  const { settings } = useSettings();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [overscan, setOverscan] = useState<{ main: number, reverse: number }>({ main: 2000, reverse: 2000 });

  const currentStartIndexRef = useRef<number>(0);
  const isProgrammaticScroll = useRef(false);

  // Calculate dynamic overscan based on window height
  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      // 25 pages ahead and behind (total 50+ pages buffer) to save RAM while keeping smooth scroll
      setOverscan({ main: height * 25, reverse: height * 25 });
    };

    handleResize(); // Initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const chunks = useMemo(() => splitMarkdownIntoChunks(content), [content]);

  // Handle scroll sync based on percentage (smoother) or topLine (precise)
  useEffect(() => {
    if (virtuosoRef.current && chunks.length > 0) {
      isProgrammaticScroll.current = true;
      
      if (percentage !== undefined) {
         // Scroll by percentage for smoother sync across wrapped lines
         const targetIndex = Math.floor(percentage * (chunks.length - 1));
         if (Math.abs(targetIndex - currentStartIndexRef.current) > 0) {
            virtuosoRef.current.scrollToIndex({
              index: targetIndex,
              align: 'start',
              behavior: 'auto',
            });
         }
      } else if (topLine !== undefined) {
        // Find the chunk that contains the topLine
        const targetChunkIndex = chunks.findIndex(chunk => chunk.startLine <= topLine && chunk.endLine >= topLine);
        
        if (targetChunkIndex !== -1) {
          if (Math.abs(targetChunkIndex - currentStartIndexRef.current) > 0) {
             virtuosoRef.current.scrollToIndex({
              index: targetChunkIndex,
              align: 'start',
              behavior: 'auto',
            });
          }
        }
      }
      
      window.setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 100);
    }
  }, [topLine, percentage, chunks]);

  return (
    <div className={clsx(
      "h-full w-full bg-[var(--bg-secondary)]",
      "font-sans" 
    )}
    style={{
      // Ensure these fonts are available for the renderer
      fontFamily: "var(--font-sans)"
    }}
    >
      <Virtuoso
        ref={virtuosoRef}
        data={chunks}
        overscan={overscan}
        onScroll={(e) => {
          if (onScroll && !isProgrammaticScroll.current) {
             const target = e.target as HTMLElement;
             const { scrollTop, scrollHeight, clientHeight } = target;
             const maxScroll = scrollHeight - clientHeight;
             const scrollPercentage = maxScroll > 0 ? scrollTop / maxScroll : 0;
             
             // Estimate top line based on currentStartIndex
             const currentChunk = chunks[currentStartIndexRef.current];
             const estimatedTopLine = currentChunk ? currentChunk.startLine : 0;
             
             onScroll({ percentage: scrollPercentage, topLine: estimatedTopLine });
          }
        }}
        rangeChanged={(range) => {
           currentStartIndexRef.current = range.startIndex;
        }}
        itemContent={(index, chunk) => (
          <div 
            className="px-4 md:px-8 py-1 markdown-body cursor-pointer hover:bg-black/5 transition-colors duration-200 rounded-sm"
            onDoubleClick={() => onChunkClick?.(chunk.startLine)}
          >
            <MarkdownRenderer 
              content={chunk.content} 
              syntaxHighlight={settings.syntaxHighlightRendered} 
            />
          </div>
        )}
        className="h-full w-full custom-scrollbar"
      />
    </div>
  );
};
