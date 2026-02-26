import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { MarkdownRenderer } from './MarkdownRenderer';
import { splitMarkdownIntoChunks } from '../../utils/markdownSplitter';
import { useSettings } from '../../context/SettingsContext';
import clsx from 'clsx';

interface VirtualizedPreviewProps {
  content: string;
  topLine?: number;
  onChunkClick?: (line: number) => void;
  onScroll?: (topLine: number) => void;
}

export const VirtualizedPreview: React.FC<VirtualizedPreviewProps> = ({ content, topLine, onChunkClick, onScroll }) => {
  const { settings } = useSettings();
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [overscan, setOverscan] = useState<{ main: number, reverse: number }>({ main: 2000, reverse: 2000 });

  const currentStartIndexRef = useRef<number>(0);

  // Calculate dynamic overscan based on window height
  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      // 5 pages ahead and behind (total 10 pages buffer) to save RAM while keeping smooth scroll
      setOverscan({ main: height * 5, reverse: height * 5 });
    };

    handleResize(); // Initial
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const chunks = useMemo(() => splitMarkdownIntoChunks(content), [content]);

  // Handle scroll sync based on topLine
  useEffect(() => {
    if (topLine !== undefined && virtuosoRef.current && chunks.length > 0) {
      // Find the chunk that contains the topLine
      const targetChunkIndex = chunks.findIndex(chunk => chunk.startLine <= topLine && chunk.endLine >= topLine);
      
      if (targetChunkIndex !== -1) {
        // Only scroll if we are far away (e.g. > 1 chunk away) to prevent loop
        if (Math.abs(targetChunkIndex - currentStartIndexRef.current) > 1) {
          virtuosoRef.current.scrollToIndex({
            index: targetChunkIndex,
            align: 'start',
            behavior: 'auto',
          });
        }
      } else {
        // Find the closest chunk before the topLine
        let closestIndex = -1;
        for (let i = chunks.length - 1; i >= 0; i--) {
          if (chunks[i].endLine < topLine) {
            closestIndex = i;
            break;
          }
        }
        
        if (closestIndex !== -1) {
           if (Math.abs(closestIndex - currentStartIndexRef.current) > 1) {
            virtuosoRef.current.scrollToIndex({
              index: closestIndex,
              align: 'end',
              behavior: 'auto'
            });
          }
        }
      }
    }
  }, [topLine, chunks]);

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
          if (onScroll && virtuosoRef.current) {
             // This is a rough estimation. Virtuoso doesn't give us the exact item index easily on scroll event alone
             // We might need rangeChanged or similar, but let's try to infer from scrollTop if needed
             // Actually, rangeChanged is better
          }
        }}
        rangeChanged={(range) => {
           currentStartIndexRef.current = range.startIndex;
           if (onScroll && chunks.length > 0) {
             const firstVisibleIndex = range.startIndex;
             if (chunks[firstVisibleIndex]) {
               onScroll(chunks[firstVisibleIndex].startLine);
             }
           }
        }}
        itemContent={(index, chunk) => (
          <div 
            className="px-4 md:px-8 py-1 markdown-body cursor-pointer hover:bg-black/5 transition-colors duration-200 rounded-sm"
            onClick={() => onChunkClick?.(chunk.startLine)}
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
