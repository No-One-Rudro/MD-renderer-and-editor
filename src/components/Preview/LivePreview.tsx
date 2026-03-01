import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Editor } from '../Editor';
import { useSettings } from '../../context/SettingsContext';
import { Edit3, X, Check } from 'lucide-react';
import { splitMarkdownIntoChunks } from '../../utils/markdownSplitter';
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
  const [overscan, setOverscan] = useState<{ main: number, reverse: number }>({ main: 2000, reverse: 2000 });

  // Store the content being edited locally to avoid full re-renders of the app
  const [localEditContent, setLocalEditContent] = useState<string>('');
  const lastTapTimeRef = useRef<number>(0);

  const chunks = useMemo(() => splitMarkdownIntoChunks(content), [content]);

  useEffect(() => {
    const handleResize = () => {
      const height = window.innerHeight;
      setOverscan({ main: height * 5, reverse: height * 5 });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startEditing = (index: number, chunkContent: string) => {
    setEditingChunkIndex(index);
    setLocalEditContent(chunkContent);
  };

  const cancelEditing = () => {
    setEditingChunkIndex(null);
    setLocalEditContent('');
  };

  const commitChanges = useCallback(() => {
    if (editingChunkIndex === null) return;

    const chunk = chunks[editingChunkIndex];
    
    // We need to replace the specific lines in the original content
    // This is a bit complex because we need to map chunk lines back to original lines
    // A simpler approach for this prototype is to reconstruct the file from chunks, 
    // but that loses non-chunked formatting if the splitter isn't perfect.
    // Better: Use the chunk's start/end lines.

    const lines = content.split('\n');
    const newLines = [...lines];
    const newChunkLines = localEditContent.split('\n');
    
    // Replace the range
    // Note: chunk.endLine is inclusive
    const linesToRemove = (chunk.endLine - chunk.startLine) + 1;
    newLines.splice(chunk.startLine, linesToRemove, ...newChunkLines);
    
    onChange(newLines.join('\n'));
    setEditingChunkIndex(null);
  }, [editingChunkIndex, chunks, content, localEditContent, onChange]);

  // Handle Ctrl+Enter to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingChunkIndex !== null && (e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        commitChanges();
      }
      if (editingChunkIndex !== null && e.key === 'Escape') {
        e.preventDefault();
        cancelEditing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingChunkIndex, commitChanges]);

  return (
    <div className="h-full w-full bg-[var(--bg-primary)] overflow-hidden">
      <Virtuoso
        ref={virtuosoRef}
        data={chunks}
        overscan={overscan}
        itemContent={(index, chunk) => {
          const isEditing = editingChunkIndex === index;

          return (
            <div 
              className={clsx(
                "relative group px-4 md:px-8 py-2 transition-all duration-200 border-l-4",
                isEditing 
                  ? "border-[var(--accent-color)] bg-[var(--bg-secondary)]/10" 
                  : "border-transparent hover:border-[var(--border-color)]"
              )}
              onClick={(e) => {
                if (!isEditing && !window.getSelection()?.toString()) {
                   startEditing(index, chunk.content);
                }
              }}
            >
              {isEditing ? (
                <div className="animate-in fade-in duration-100">
                  <div className="-mx-4 md:-mx-8 px-4 md:px-8 bg-[var(--bg-primary)]">
                    <Editor
                      content={localEditContent}
                      onChange={setLocalEditContent}
                      autoCommentNextLine={settings.autoCommentNextLine}
                      syntaxHighlightRaw={true}
                      autoFocus={true}
                      minimal={true}
                      debounceMs={0}
                      className="min-h-[100px] max-h-[60vh]"
                    />
                  </div>
                  <div className="flex justify-end mt-2 space-x-2">
                    <button 
                      onClick={cancelEditing}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-md transition-colors"
                    >
                      <X size={14} />
                      <span>Cancel (Esc)</span>
                    </button>
                    <button 
                      onClick={commitChanges}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-white bg-[var(--accent-color)] hover:opacity-90 rounded-md shadow-sm transition-all"
                    >
                      <Check size={14} />
                      <span>Done (Ctrl+Enter)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="markdown-body">
                    <MarkdownRenderer 
                      content={chunk.content} 
                      syntaxHighlight={settings.syntaxHighlightRendered} 
                    />
                  </div>
                  
                  {/* Edit Button overlay */}
                  <button 
                    onClick={() => startEditing(index, chunk.content)}
                    className="absolute top-0 right-0 p-1.5 text-[var(--text-tertiary)] hover:text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-all bg-[var(--bg-primary)]/80 backdrop-blur-sm rounded-md border border-[var(--border-color)] shadow-sm"
                    title="Edit Block"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        }}
        className="h-full w-full custom-scrollbar"
        components={{
          Footer: () => <div className="h-[40vh]" />
        }}
      />
    </div>
  );
};
