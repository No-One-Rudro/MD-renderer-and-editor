import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Editor } from '../Editor';
import { useSettings } from '../../context/SettingsContext';
import { Edit3, Eye } from 'lucide-react';

interface LivePreviewProps {
  content: string;
  onChange: (content: string) => void;
}

interface Block {
  id: string;
  content: string;
  type: 'text' | 'code' | 'math';
}

export const LivePreview: React.FC<LivePreviewProps> = ({ content, onChange }) => {
  const { settings } = useSettings();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse content into blocks
  // This is a simplified parser. Real Obsidian uses an AST.
  // We split by double newlines to approximate paragraphs/blocks.
  useEffect(() => {
    const rawBlocks = content.split(/\n\n+/);
    const newBlocks = rawBlocks.map((text, index) => ({
      id: `block-${index}`,
      content: text,
      type: text.trim().startsWith('```') ? 'code' : text.trim().startsWith('$$') ? 'math' : 'text'
    } as Block));
    setBlocks(newBlocks);
  }, [content]);

  const handleBlockUpdate = (id: string, newContent: string) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, content: newContent } : b);
    // Reconstruct full content
    // We join with \n\n to maintain block separation
    const fullContent = newBlocks.map(b => b.content).join('\n\n');
    onChange(fullContent);
  };

  return (
    <div 
      ref={containerRef}
      className="h-full w-full overflow-y-auto bg-[var(--bg-secondary)] font-sans px-4 md:px-8 py-8 custom-scrollbar"
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="relative group min-h-[2rem]">
            {editingBlockId === block.id ? (
              <div className="relative">
                <div className="absolute -top-3 -right-3 z-10 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full p-1 shadow-sm">
                  <Edit3 size={12} className="text-[var(--accent-color)]" />
                </div>
                <div className="border border-[var(--accent-color)] rounded-lg overflow-hidden bg-[var(--bg-primary)]">
                  <Editor
                    content={block.content}
                    onChange={(val) => handleBlockUpdate(block.id, val)}
                    autoCommentNextLine={settings.autoCommentNextLine}
                    syntaxHighlightRaw={true} // Always highlight in edit mode
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBlockId(null);
                    }}
                    className="text-xs bg-[var(--accent-color)] text-white px-3 py-1 rounded-md hover:opacity-90"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setEditingBlockId(block.id)}
                className="cursor-text p-2 -m-2 rounded-lg hover:bg-[var(--bg-tertiary)]/50 transition-colors border border-transparent hover:border-[var(--border-color)]/50"
              >
                <MarkdownRenderer 
                  content={block.content} 
                  syntaxHighlight={settings.syntaxHighlightRendered} 
                />
              </div>
            )}
          </div>
        ))}
        
        {/* Empty state / New block creator */}
        {blocks.length === 0 && (
          <div 
            onClick={() => {
              onChange('# New Note\n\nStart typing...');
            }}
            className="text-[var(--text-tertiary)] italic cursor-pointer hover:text-[var(--text-primary)]"
          >
            Click to start writing...
          </div>
        )}
        
        {/* Bottom padding for scrolling */}
        <div className="h-[50vh]"></div>
      </div>
    </div>
  );
};
