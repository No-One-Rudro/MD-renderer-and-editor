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
  const containerRef = useRef<HTMLDivElement>(null);
  const [overscan, setOverscan] = useState<{ main: number, reverse: number }>({ main: 2000, reverse: 2000 });

  const [tempChunkContent, setTempChunkContent] = useState<string>('');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settings.viewMode === 'live' && editingChunkIndex !== null) {
        // If clicking outside the editor container
        const target = event.target as HTMLElement;
        if (!target.closest('.live-editor-container')) {
          // In live mode, we commit on blur/click away
          if (editingChunkIndex !== null) {
             handleChunkUpdate(editingChunkIndex, tempChunkContent);
          }
          setEditingChunkIndex(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [settings.viewMode, editingChunkIndex, tempChunkContent]);

  const chunks = useMemo(() => splitMarkdownIntoChunks(content), [content]);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      // 10 pages ahead and behind as requested
      setOverscan({ main: height * 10, reverse: height * 10 });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startEditing = (index: number, currentContent: string) => {
    setEditingChunkIndex(index);
    setTempChunkContent(currentContent);
  };

  const handleChunkUpdate = (index: number, newChunkContent: string) => {
    const chunk = chunks[index];
    let finalContent = newChunkContent;
    
    // If it's a math block and we are editing just the inner part
    if (chunk.type === 'math' && !newChunkContent.trim().startsWith('$$')) {
      finalContent = `$$\n${newChunkContent}\n$$`;
    }

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

  const canEditChunk = (chunk: Chunk) => {
    if (settings.viewMode === 'lightning') {
      return true; // Mode 4: Editable every chunk precisely
    }
    if (settings.viewMode === 'live' && chunk.type === 'math') {
      return true; // Mode 5: Edit only math blocks
    }
    return false;
  };

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] overflow-hidden" ref={containerRef}>
      <Virtuoso
        ref={virtuosoRef}
        data={chunks}
        overscan={overscan}
        itemContent={(index, chunk) => (
          <div 
            className={clsx(
              "relative group px-4 md:px-8 py-1 transition-all duration-200",
              editingChunkIndex === index ? "bg-[var(--bg-secondary)] shadow-inner" : "hover:bg-[var(--bg-secondary)]/30"
            )}
            onDoubleClick={(e) => {
              if (window.getSelection()?.toString()) return;
              if (chunk.type === 'math' && settings.viewMode === 'live') {
                startEditing(index, chunk.content);
              }
            }}
            onClick={(e) => {
              if (window.getSelection()?.toString()) return;
              if (settings.viewMode === 'lightning' && canEditChunk(chunk)) {
                startEditing(index, chunk.content);
              }
            }}
          >
            {editingChunkIndex === index ? (
              <div className="py-2 live-editor-container">
                <div className={clsx(
                  "overflow-hidden transition-all",
                  settings.viewMode === 'live' ? "bg-transparent" : "border-2 rounded-lg bg-[var(--bg-primary)] shadow-lg",
                  settings.viewMode === 'lightning' ? (chunk.type === 'math' ? "border-[var(--math-edit-border)]" : "border-[var(--accent-color)]") : "border-transparent"
                )}>
                  <Editor
                    content={chunk.type === 'math' ? getMathContent(tempChunkContent) : tempChunkContent}
                    onChange={(val) => setTempChunkContent(val)}
                    autoCommentNextLine={settings.autoCommentNextLine}
                    syntaxHighlightRaw={true}
                    minimal={settings.viewMode === 'live'}
                    autoFocus={true}
                    debounceMs={0}
                  />
                </div>
                {settings.viewMode === 'lightning' && (
                  <div className="flex justify-between mt-1">
                    <button 
                      onClick={() => setEditingChunkIndex(null)}
                      className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded hover:opacity-90 shadow-sm transition-all uppercase font-bold"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        handleChunkUpdate(index, tempChunkContent);
                        setEditingChunkIndex(null);
                      }}
                      className="text-[10px] bg-[var(--accent-color)] text-white px-2 py-0.5 rounded hover:opacity-90 shadow-sm transition-all uppercase font-bold"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                {/* Floating Edit Button for Chunks */}
                {canEditChunk(chunk) && (
                  <button 
                    onClick={() => startEditing(index, chunk.content)}
                    className="absolute -right-2 top-0 p-1.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-[var(--accent-color)] z-10"
                    title="Edit Block"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
                
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
