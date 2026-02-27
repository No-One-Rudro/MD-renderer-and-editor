import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Settings, Check, X, FileText, Type, Code, Eye, EyeOff, Menu, Edit3, SplitSquareHorizontal, Search, File, Zap, Save } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import clsx from 'clsx';

interface TopBarProps {
  title: string;
  isUnsaved?: boolean;
  onSave?: () => void;
  onCountWords: () => void;
  wordCountResult: { words: number, chars: number } | null;
  onOpenSettings: () => void;
  onToggleFindReplace: () => void;
  onToggleSidebar: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  isUnsaved = false,
  onSave,
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
    <div className="h-14 bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex items-center justify-between px-2 sm:px-4 shrink-0 transition-colors duration-200 z-50 relative">
      <div className="flex items-center space-x-2 overflow-hidden">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden rounded-lg hover:bg-[var(--bg-secondary)] flex-shrink-0"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] truncate max-w-[150px] sm:max-w-xs flex items-center">
          {title}
          {isUnsaved && <span className="text-[var(--accent-color)] ml-1 text-xl leading-none">*</span>}
        </h1>
        {(settings.liveWordCount || wordCountResult) && (
          <div className="hidden sm:flex items-center text-xs text-[var(--text-tertiary)] ml-2 bg-[var(--bg-secondary)] px-2 py-1 rounded flex-shrink-0">
            <span className="mr-2">{wordCountResult?.words || 0} words</span>
            <span>{wordCountResult?.chars || 0} chars</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 relative flex-shrink-0">
        {onSave && (
          <button
            onClick={onSave}
            className={clsx(
              "p-2 rounded-lg transition-colors flex items-center justify-center flex-shrink-0",
              isUnsaved 
                ? "bg-[var(--accent-color)] text-white hover:opacity-90 shadow-sm" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            )}
            title="Save Note (Ctrl+S)"
          >
            <Save size={18} />
          </button>
        )}
        <div className="flex items-center space-x-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)] overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-none">
          <button
            onClick={() => updateSettings({ viewMode: 'raw' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
              settings.viewMode === 'raw' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Raw Editor (Mode 1)"
          >
            <Edit3 size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Raw</span>
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'split' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
              settings.viewMode === 'split' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Split View (Mode 2)"
          >
            <SplitSquareHorizontal size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Split</span>
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'preview' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
              settings.viewMode === 'preview' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Simple Preview (Mode 3)"
          >
            <Eye size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Preview</span>
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'lightning' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
              settings.viewMode === 'lightning' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Lightning/Chunk Edit (Mode 4)"
          >
            <Zap size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Lightning</span>
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'live' })}
            className={clsx(
              "p-1.5 rounded-md flex items-center space-x-1 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0",
              settings.viewMode === 'live' ? 'bg-[var(--bg-primary)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            title="Live/Inline Math (Mode 5)"
          >
            <Zap size={14} className="sm:w-4 sm:h-4 text-emerald-500" />
            <span className="hidden xs:inline">Live</span>
          </button>
        </div>

        <div className="flex items-center space-x-1 flex-shrink-0">
          {settings.viewMode === 'split' && (
            <button
              onClick={() => toggleSetting('syncScroll')}
              className={clsx(
                "px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center border border-transparent text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0",
                settings.syncScroll ? "text-[var(--accent-color)] bg-[var(--bg-secondary)] border-[var(--border-color)]" : "text-[var(--text-tertiary)] hover:bg-[var(--bg-secondary)]"
              )}
              title="Toggle Sync Scroll"
            >
              <SplitSquareHorizontal size={16} className={clsx("mr-1", settings.syncScroll ? "rotate-90" : "")} />
              <span className="hidden sm:inline">Sync Scroll: {settings.syncScroll ? 'ON' : 'OFF'}</span>
            </button>
          )}

          <div className="relative flex-shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[#8b5cf6] hover:text-[#7c3aed] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors border border-transparent hover:border-[var(--border-color)] flex-shrink-0"
            >
              <MoreVertical size={20} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 z-50 text-sm text-[var(--text-primary)]">
                <div className="px-3 py-2 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider border-b border-[var(--border-color)] mb-1">
                  Actions
                </div>
                
                <button
                  onClick={() => {
                    onToggleFindReplace();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center space-x-2 transition-colors"
                >
                  <Search size={14} />
                  <span>Find & Replace (Regex)</span>
                </button>

                <button
                  onClick={handleCountClick}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center space-x-2 transition-colors"
                >
                  <FileText size={14} />
                  <span>Word & Letter Count</span>
                </button>

                {settings.viewMode === 'split' && (
                  <button
                    onClick={() => {
                      toggleSetting('syncScroll');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <SplitSquareHorizontal size={14} />
                      <span>Sync Scroll</span>
                    </div>
                    {settings.syncScroll && <Check size={14} className="text-emerald-400" />}
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenSettings();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center space-x-2 transition-colors border-t border-[var(--border-color)] mt-1 pt-2"
                >
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
