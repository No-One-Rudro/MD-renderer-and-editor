import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { VirtualizedPreview } from './components/Preview/VirtualizedPreview';
import { BufferedPreview } from './components/Preview/BufferedPreview';
import { LivePreview } from './components/Preview/LivePreview';
import { SettingsModal } from './components/SettingsModal';
import { FindReplace } from './components/FindReplace';
import { TopBar } from './components/Toolbar/TopBar';
import { loadTheme } from './store';
import { useSettings } from './context/SettingsContext';
import { useNotes } from './hooks/useNotes';
import { CommandPalette } from './components/CommandPalette';

export default function App() {
  const {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    unsavedNotes,
    handleCreateNote,
    handleDeleteNote,
    handleRenameNote,
    handleCreateDailyNote,
    handleUpdateContent,
    handleSave,
    handleImportFile,
    handleDownloadNote
  } = useNotes();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scrollInfo, setScrollInfo] = useState<{ percentage: number, topLine: number }>({ percentage: 0, topLine: 0 });
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const [debouncedContent, setDebouncedContent] = useState<string>('');
  
  const { settings, updateSettings } = useSettings();
  
  // Ensure we default to raw mode at startup
  useEffect(() => {
    if (settings.viewMode !== 'raw') {
      updateSettings({ viewMode: 'raw' });
    }
  }, []);

  // Immediate sync when syncScroll is toggled on
  useEffect(() => {
    if (settings.syncScroll && settings.viewMode === 'split') {
      // We don't need to do much as the next render will use the current scrollInfo
      // but we can force a small state update if needed.
    }
  }, [settings.syncScroll]);

  const handlePreviewClick = (line: number) => {
    // Manual click-to-sync always works
    setScrollToLine(line);
  };

  const [editorScrollTop, setEditorScrollTop] = useState(0);
  const [previewScrollTop, setPreviewScrollTop] = useState(0);

  const handleEditorScroll = (info: { percentage: number, topLine: number }) => {
    // Auto-sync only if enabled
    if (settings.syncScroll) {
      setScrollInfo(info);
    }
  };

  const handlePreviewScroll = (topLine: number) => {
    if (settings.syncScroll) {
       setScrollToLine(topLine);
    }
  }

  const handleEditorClick = (line: number) => {
    // Manual click-to-sync always works
    setScrollInfo({ percentage: 0, topLine: line });
  };

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [wordCount, setWordCount] = useState<{words: number, chars: number} | null>(null);

  const calculateWordCount = (text: string) => {
    if (!text) {
      setWordCount({ words: 0, chars: 0 });
      return;
    }
    // Better word count for complex scripts
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    setWordCount({ words, chars });
  };

  useEffect(() => {
    const savedTheme = loadTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (!activeNote) return;
    const timer = setTimeout(() => {
      setDebouncedContent(activeNote.content);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeNote?.content]);

  useEffect(() => {
    if (activeNote) {
      setDebouncedContent(activeNote.content);
    }
  }, [activeNoteId]);

  useEffect(() => {
    if (settings.liveWordCount && activeNote) {
      calculateWordCount(activeNote.content);
    } else if (!settings.liveWordCount) {
      setWordCount(null);
    }
  }, [activeNote?.content, settings.liveWordCount]);

  const handleManualWordCount = () => {
    if (activeNote) {
      const text = activeNote.content;
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      const chars = text.length;
      alert(`Word Count: ${words}\nCharacter Count: ${chars}`);
    }
  };

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key === 'k') || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      if ((e.ctrlKey && e.key === 's')) {
        e.preventDefault();
        handleSave();
      }
      
      if (e.ctrlKey && e.key === 'x') {
        const handleEmacsSave = (se: KeyboardEvent) => {
          if (se.key === 's') {
            se.preventDefault();
            handleSave();
            window.removeEventListener('keydown', handleEmacsSave);
          }
        };
        window.addEventListener('keydown', handleEmacsSave);
        setTimeout(() => window.removeEventListener('keydown', handleEmacsSave), 1000);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleSave]);

  const commands = [
    { name: 'Switch to Raw Mode', action: () => updateSettings({ viewMode: 'raw' }) },
    { name: 'Switch to Split Mode', action: () => updateSettings({ viewMode: 'split' }) },
    { name: 'Switch to Preview Mode', action: () => updateSettings({ viewMode: 'preview' }) },
    { name: 'Switch to Live Mode', action: () => updateSettings({ viewMode: 'live' }) },
    { name: 'Create New Note', action: handleCreateNote },
    { name: 'Create Daily Note', action: handleCreateDailyNote },
    { name: 'Open Settings', action: () => setIsSettingsOpen(true) },
    { name: 'Toggle Find & Replace', action: () => setShowFindReplace(!showFindReplace) },
    ...notes.map(note => ({ name: `Open Note: ${note.title}`, action: () => setActiveNoteId(note.id) }))
  ];

  return (
    <div className="flex h-screen w-full bg-[var(--bg-secondary)] overflow-hidden font-sans text-[var(--text-primary)] transition-colors duration-200">
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
        commands={commands} 
      />

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          unsavedNotes={unsavedNotes}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setIsSidebarOpen(false);
          }}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onRenameNote={handleRenameNote}
          onImportFile={(e) => handleImportFile(e, () => setIsSidebarOpen(false))}
          onDownloadNote={handleDownloadNote}
          onCreateDailyNote={handleCreateDailyNote}
        />
      </div>
      
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <TopBar 
          title={activeNote?.title || 'Crystal Render'}
          isUnsaved={activeNoteId ? unsavedNotes.has(activeNoteId) : false}
          onSave={handleSave}
          onCountWords={handleManualWordCount}
          wordCountResult={wordCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleFindReplace={() => setShowFindReplace(!showFindReplace)}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {showFindReplace && activeNote && (
          <FindReplace 
            content={activeNote.content} 
            onChange={handleUpdateContent} 
            onClose={() => setShowFindReplace(false)} 
          />
        )}

        <div className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
          {activeNote ? (
            <>
              {settings.viewMode === 'raw' && (
                <div className="w-full h-full">
                  <Editor 
                    content={activeNote.content} 
                    onChange={handleUpdateContent} 
                    onScroll={handleEditorScroll}
                    onClickLine={handleEditorClick}
                    autoCommentNextLine={settings.autoCommentNextLine}
                    syntaxHighlightRaw={settings.syntaxHighlightRaw}
                  />
                </div>
              )}

              {settings.viewMode === 'split' && (
                <>
                  <div className="w-full h-1/2 md:w-1/2 md:h-full order-2 md:order-1 border-t md:border-t-0 md:border-r border-[var(--border-color)]">
                    <Editor 
                      content={activeNote.content} 
                      onChange={handleUpdateContent} 
                      onScroll={handleEditorScroll}
                      onClickLine={handleEditorClick}
                      autoCommentNextLine={settings.autoCommentNextLine}
                      syntaxHighlightRaw={settings.syntaxHighlightRaw}
                      scrollToLine={scrollToLine}
                    />
                  </div>
                  <div className="w-full h-1/2 md:w-1/2 md:h-full order-1 md:order-2 bg-[var(--bg-secondary)]">
                    <VirtualizedPreview 
                      content={debouncedContent} 
                      topLine={scrollInfo.topLine} 
                      onChunkClick={handlePreviewClick}
                      onScroll={handlePreviewScroll}
                    />
                  </div>
                </>
              )}

              {settings.viewMode === 'preview' && (
                <div className="w-full h-full bg-[var(--bg-secondary)]">
                  <BufferedPreview content={debouncedContent} />
                </div>
              )}

              {(settings.viewMode === 'lightning' || settings.viewMode === 'live') && (
                <div className="w-full h-full bg-[var(--bg-secondary)]">
                  <LivePreview 
                    content={debouncedContent}
                    onChange={handleUpdateContent}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[var(--text-tertiary)] p-4 text-center">
              Select or create a note to begin.
            </div>
          )}
        </div>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
