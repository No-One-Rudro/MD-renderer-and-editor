import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Settings, Check, Menu, Edit3, SplitSquareHorizontal, Search, FileText, Zap, Save, Eye, ChevronDown } from 'lucide-react';
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
  const [modesOpen, setModesOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const modesRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (modesRef.current && !modesRef.current.contains(event.target as Node)) {
        setModesOpen(false);
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

  const getModeLabel = (mode: string) => {
    switch(mode) {
      case 'raw': return 'Raw';
      case 'split': return 'Split';
      case 'preview': return 'Preview';
      case 'lightning': return 'Lightning';
      case 'live': return 'Live';
      default: return 'Mode';
    }
  };

  const getModeIcon = (mode: string) => {
    switch(mode) {
      case 'raw': return <Edit3 size={14} />;
      case 'split': return <SplitSquareHorizontal size={14} />;
      case 'preview': return <Eye size={14} />;
      case 'lightning': return <Zap size={14} />;
      case 'live': return <Zap size={14} className="text-emerald-500" />;
      default: return <Edit3 size={14} />;
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] flex flex-col shrink-0 transition-colors duration-200 z-50 relative">
      {/* Top Row: Save, Title, Actions */}
      <div className="h-12 flex items-center justify-between px-2 sm:px-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleSidebar}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] md:hidden rounded-lg hover:bg-[var(--bg-secondary)] flex-shrink-0"
          >
            <Menu size={20} />
          </button>
          
          {onSave && (
            <button
              onClick={onSave}
              className={clsx(
                "p-1.5 rounded-lg transition-colors flex items-center justify-center flex-shrink-0",
                isUnsaved && settings.detectUnsaved
                  ? "text-yellow-500 hover:text-yellow-400 bg-yellow-500/10" 
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              )}
              title={isUnsaved ? "Unsaved Changes (Ctrl+S)" : "Saved"}
            >
              <Save size={20} />
            </button>
          )}

          <div className="flex flex-col justify-center">
            <h1 className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] truncate max-w-[200px]">
              {title}
            </h1>
            <div className="flex items-center space-x-2">
               {/* Compact Mode Selector */}
               <div className="relative" ref={modesRef}>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setModesOpen(!modesOpen);
                    }}
                    className="flex items-center space-x-1 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-color)] transition-colors"
                  >
                    <span>{getModeLabel(settings.viewMode)}</span>
                    <ChevronDown size={10} />
                  </button>
                  
                  {modesOpen && (
                    <div className="absolute left-0 top-full mt-1 w-32 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 z-50">
                      {['raw', 'split', 'preview', 'lightning', 'live'].map((mode) => (
                        <button
                          key={mode}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateSettings({ viewMode: mode as any });
                            setModesOpen(false);
                          }}
                          className={clsx(
                            "w-full text-left px-3 py-1.5 text-xs flex items-center space-x-2 hover:bg-[var(--bg-secondary)]",
                            settings.viewMode === mode ? "text-[var(--accent-color)] bg-[var(--bg-secondary)]" : "text-[var(--text-primary)]"
                          )}
                        >
                          {getModeIcon(mode)}
                          <span>{getModeLabel(mode)}</span>
                        </button>
                      ))}
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
           {(settings.liveWordCount || wordCountResult) && (
            <div className="hidden sm:flex items-center text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2 py-1 rounded flex-shrink-0 mr-2">
              <span className="mr-2">{wordCountResult?.words || 0} w</span>
              <span>{wordCountResult?.chars || 0} c</span>
            </div>
          )}

          <button
            onClick={onToggleFindReplace}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            title="Find & Replace"
          >
            <Search size={18} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-xl py-1 z-50 text-sm text-[var(--text-primary)]">
                <button
                  onClick={handleCountClick}
                  className="w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] flex items-center space-x-2 transition-colors"
                >
                  <FileText size={14} />
                  <span>Word Count</span>
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

                <div className="border-t border-[var(--border-color)] my-1"></div>

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
    </div>
  );
};
