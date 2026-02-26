import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Editor } from '../Editor';
import { useSettings } from '../../context/SettingsContext';
import { Edit3, Zap } from 'lucide-react';
import { splitMarkdownIntoChunks, Chunk } from '../../utils/markdownSplitter';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import clsx from 'clsx';

interface LivePreviewProps {
  content: string;
  onChange: (content: string) => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ content, onChange }) => {
  const { settings } = useSettings();
  const [editingChunkIndex, setEditingChunkIndex] = useState<number | null>(null);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [overscan, setOverscan] = useState(2000);

  const chunks = useMemo(() => splitMarkdownIntoChunks(content), [content]);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      setOverscan(Math.floor(height * 2));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleChunkUpdate = (index: number, newChunkContent: string) => {
    const chunk = chunks[index];
    let finalContent = newChunkContent;
    
    // If it's a math block and we are editing just the inner part
    if (chunk.type === 'math' && !newChunkContent.trim().startsWith('$$')) {
      finalContent = `$$\n${newChunkContent}\n$$`;
    }

    const newChunks = [...chunks];
    newChunks[index] = { ...newChunks[index], content: finalContent };
    
    // Reconstruct full content
    const lines = content.split('\n');
    
    // Replace lines in the original content
    const newLines = [...lines];
    const updatedChunkLines = finalContent.split('\n');
    
    newLines.splice(chunk.startLine, (chunk.endLine - chunk.startLine) + 1, ...updatedChunkLines);
    
    onChange(newLines.join('\n'));
  };

  const getMathContent = (content: string) => {
    return content.replace(/^\$\$\n?/, '').replace(/\n?\$\$$/, '');
  };

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] overflow-hidden">
      <Virtuoso
        ref={virtuosoRef}
        data={chunks}
        overscan={overscan}
        itemContent={(index, chunk) => (
          <div 
            key={`${index}-${chunk.startLine}`}
            className={clsx(
              "relative group px-4 md:px-8 py-1 transition-all duration-200",
              editingChunkIndex === index ? "bg-[var(--bg-secondary)] shadow-inner" : "hover:bg-[var(--bg-secondary)]/30"
            )}
            onDoubleClick={() => {
              if (chunk.type === 'math' || settings.viewMode === 'live') {
                setEditingChunkIndex(index);
              }
            }}
          >
            {editingChunkIndex === index ? (
              <div className="py-4">
                <div className="flex items-center justify-between mb-2 px-2">
                  <div className="flex items-center space-x-2 text-xs font-medium text-[var(--accent-color)]">
                    <Zap size={14} />
                    <span className="uppercase tracking-wider">
                      Editing {chunk.type === 'math' ? 'Equation' : chunk.type + ' block'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setEditingChunkIndex(null)}
                    className="text-xs bg-[var(--accent-color)] text-white px-3 py-1 rounded-md hover:opacity-90 shadow-sm transition-all"
                  >
                    Done
                  </button>
                </div>
                <div className={clsx(
                  "border-2 rounded-lg overflow-hidden bg-[var(--bg-primary)] shadow-lg transition-colors",
                  chunk.type === 'math' ? "border-[var(--math-edit-border)]" : "border-[var(--accent-color)]"
                )}>
                  <Editor
                    content={chunk.type === 'math' ? getMathContent(chunk.content) : chunk.content}
                    onChange={(val) => handleChunkUpdate(index, val)}
                    autoCommentNextLine={settings.autoCommentNextLine}
                    syntaxHighlightRaw={true}
                  />
                </div>
                <div className="mt-2 text-[10px] text-[var(--text-tertiary)] text-right italic">
                  {chunk.type === 'math' ? 'Equation content only - $$ delimiters are added automatically' : 'Press Ctrl+S to save changes to file'}
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Floating Edit Button for Chunks */}
                <button 
                  onClick={() => setEditingChunkIndex(index)}
                  className="absolute -right-2 top-0 p-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-[var(--accent-color)] z-10"
                  title="Edit Block"
                >
                  <Edit3 size={14} />
                </button>
                
                <div className={clsx(
                  "markdown-body",
                  chunk.type === 'math' && "cursor-pointer py-2 px-4 rounded-lg bg-[var(--bg-secondary)]/20 border border-transparent hover:border-[var(--math-edit-border)]/30 transition-all"
                )}>
                  <MarkdownRenderer 
                    content={chunk.content} 
                    syntaxHighlight={settings.syntaxHighlightRendered} 
                  />
                </div>
              </div>
            )}
          </div>
        )}
        className="h-full w-full custom-scrollbar"
        // Add a large footer to allow scrolling past the last chunk
        components={{
          Footer: () => <div className="h-[60vh]" />
        }}
      />
    </div>
  );
};
