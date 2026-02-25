import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Settings, Check, X, FileText, Type, Code, Eye, EyeOff, Menu, Edit3, SplitSquareHorizontal, Search, File, Zap } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import clsx from 'clsx';

interface TopBarProps {
  title: string;
  onCountWords: () => void;
  wordCountResult: { words: number, chars: number } | null;
  onOpenSettings: () => void;
  onToggleFindReplace: () => void;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  onCountWords, 
  wordCountResult, 
  onOpenSettings, 
  onToggleFindReplace,
  onToggleSidebar
}) => {
  const { settings, updateSettings, toggleSetting } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCountClick = () => {
    onCountWords();
    setMenuOpen(false);
  };

  return (
    <div className="h-14 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-between px-2 sm:px-4 shrink-0 transition-colors duration-200 z-30">
      <div className="flex items-center space-x-2">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden rounded-lg hover:bg-[var(--bg-secondary)]"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate max-w-[150px] sm:max-w-xs">
          {title}
        </h1>
        {(settings.liveWordCount || wordCountResult) && (
          <div className="hidden sm:flex items-center text-xs text-[var(--text-tertiary)] ml-2 bg-[var(--bg-secondary)] px-2 py-1 rounded">
            <span className="mr-2">{wordCountResult?.words || 0} words</span>
            <span>{wordCountResult?.chars || 0} chars</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 relative">
        <div className="flex items-center space-x-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)] overflow-x-auto max-w-[200px] sm:max-w-none no-scrollbar">
          <button
            onClick={() => updateSettings({ viewMode: 'raw' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors whitespace-nowrap",
              settings.viewMode === 'raw' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Edit Only (Raw)"
          >
            <Edit3 size={16} />
            <span className="hidden sm:inline">Raw</span>
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'split' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors whitespace-nowrap",
              settings.viewMode === 'split' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Split View (Preview Edit)"
          >
            <SplitSquareHorizontal size={16} />
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'preview' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors whitespace-nowrap",
              settings.viewMode === 'preview' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Simple Preview"
          >
            <File size={16} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'live' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors whitespace-nowrap",
              settings.viewMode === 'live' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Live Preview (Obsidian-like)"
          >
            <Zap size={16} />
            <span className="hidden sm:inline">Live</span>
          </button>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-violet-500 hover:text-violet-400 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 z-50 text-sm text-[var(--text-primary)]">
              <div className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)] mb-1">
                Actions
              </div>
              
              <button
                onClick={handleCountClick}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center space-x-2 transition-colors"
              >
                <FileText size={14} />
                <span>Count Words & Chars</span>
              </button>

              <button
                onClick={() => {
                  onToggleFindReplace();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center space-x-2 transition-colors"
              >
                <Search size={14} />
                <span>Find & Replace</span>
              </button>

              <div className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-t border-b border-[var(--border-color)] my-1 bg-[var(--bg-secondary)]/50">
                View Options
              </div>

              <button
                onClick={() => toggleSetting('liveWordCount')}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <Type size={14} />
                  <span>Live Word Count</span>
                </div>
                {settings.liveWordCount && <Check size={14} className="text-emerald-400" />}
              </button>

              <button
                onClick={() => toggleSetting('autoCommentNextLine')}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <Code size={14} />
                  <span>Auto Comment (Vim)</span>
                </div>
                {settings.autoCommentNextLine && <Check size={14} className="text-emerald-400" />}
              </button>

              <button
                onClick={() => toggleSetting('syntaxHighlightRaw')}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  {settings.syntaxHighlightRaw ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>Highlight Raw Editor</span>
                </div>
                {settings.syntaxHighlightRaw && <Check size={14} className="text-emerald-400" />}
              </button>

              <button
                onClick={() => toggleSetting('syntaxHighlightRendered')}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  {settings.syntaxHighlightRendered ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>Highlight Rendered</span>
                </div>
                {settings.syntaxHighlightRendered && <Check size={14} className="text-emerald-400" />}
              </button>
              
              <div className="h-px bg-[var(--border-color)] my-1"></div>
              
              <button
                onClick={() => {
                  onOpenSettings();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center space-x-2 transition-colors"
              >
                <Settings size={14} />
                <span>Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
