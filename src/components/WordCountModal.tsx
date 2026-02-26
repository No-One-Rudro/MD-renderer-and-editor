import React from 'react';
import { X, FileText, Type, AlignLeft } from 'lucide-react';

interface WordCountModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    words: number;
    chars: number;
    charsNoSpaces: number;
    lines: number;
  } | null;
}

export const WordCountModal: React.FC<WordCountModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen || !stats) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[var(--bg-primary)] rounded-xl shadow-2xl w-full max-w-sm border border-[var(--border-color)] overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <FileText size={18} className="text-[var(--accent-color)]" />
            Statistics
          </h3>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-3 bg-[var(--bg-secondary)]/50 rounded-lg border border-[var(--border-color)]">
            <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.words}</span>
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-medium">Words</span>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-[var(--bg-secondary)]/50 rounded-lg border border-[var(--border-color)]">
            <span className="text-3xl font-bold text-[var(--text-primary)]">{stats.chars}</span>
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-medium">Characters</span>
          </div>

          <div className="col-span-2 flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-center text-sm p-2 border-b border-[var(--border-color)] border-dashed">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <Type size={14} /> Chars (no spaces)
              </span>
              <span className="font-mono font-medium text-[var(--text-primary)]">{stats.charsNoSpaces}</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <AlignLeft size={14} /> Lines
              </span>
              <span className="font-mono font-medium text-[var(--text-primary)]">{stats.lines}</span>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-[var(--accent-color)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
