import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor, EditorHandle } from './components/Editor';
import { VirtualizedPreview } from './components/Preview/VirtualizedPreview';
import { BufferedPreview } from './components/Preview/BufferedPreview';
import { LivePreview } from './components/Preview/LivePreview';
import { SettingsModal } from './components/SettingsModal';
import { FindReplace } from './components/FindReplace';
import { TopBar } from './components/Toolbar/TopBar';
import { FormattingToolbar, ToolbarAction } from './components/Toolbar/FormattingToolbar';
import { loadTheme } from './store';
import { ThemeType } from './components/Settings/types';
import { useSettings } from './context/SettingsContext';
import { useNotes } from './hooks/useNotes';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from './components/Toast';
import { WordCountModal } from './components/WordCountModal';
import { MatrixRain } from './components/Settings/MatrixRain';

// Memoize Editor to prevent unnecessary re-renders
const MemoizedEditor = React.memo(Editor);

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
    handleDownloadNote,
    handleBulkDownload
  } = useNotes();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWordCountModalOpen, setIsWordCountModalOpen] = useState(false);
  const [scrollInfo, setScrollInfo] = useState<{ percentage: number, topLine: number }>({ percentage: 0, topLine: 0 });
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const [scrollPercentage, setScrollPercentage] = useState<number | null>(null);
  const [debouncedContent, setDebouncedContent] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  
  const { settings, updateSettings } = useSettings();
  
  const editorRef = useRef<EditorHandle>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
  };

  // Ensure we default to raw mode at startup
  useEffect(() => {
    if (settings.viewMode !== 'raw') {
      updateSettings({ viewMode: 'raw' });
    }
  }, []);

  // Immediate sync when syncScroll is toggled on
  useEffect(() => {
    if (settings.syncScroll && settings.viewMode === 'split') {
      showToast("Sync Scroll: ON");
    } else if (!settings.syncScroll && settings.viewMode === 'split') {
      showToast("Sync Scroll: OFF");
    }
  }, [settings.syncScroll]);

  const handlePreviewClick = useCallback((line: number) => {
    // Manual click-to-sync always works
    setScrollToLine(line);
    setScrollPercentage(null);
  }, []);

  const activeScrollPane = useRef<'editor' | 'preview' | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const handleEditorScroll = useCallback((info: { percentage: number, topLine: number }) => {
    if (settings.syncScroll && activeScrollPane.current !== 'preview') {
      activeScrollPane.current = 'editor';
      setScrollInfo(info);
      
      if (scrollTimeoutRef.current !== null) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        activeScrollPane.current = null;
      }, 150);
    }
  }, [settings.syncScroll]);

  const handlePreviewScroll = useCallback((info: { percentage: number, topLine: number }) => {
    if (settings.syncScroll && activeScrollPane.current !== 'editor') {
      activeScrollPane.current = 'preview';
      setScrollToLine(info.topLine);
      setScrollPercentage(info.percentage);
      
      if (scrollTimeoutRef.current !== null) window.clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = window.setTimeout(() => {
        activeScrollPane.current = null;
      }, 150);
    }
  }, [settings.syncScroll]);

  const handleEditorClick = useCallback((line: number) => {
    // Manual click-to-sync always works
    setScrollInfo({ percentage: 0, topLine: line });
  }, []);

  const [showFindReplace, setShowFindReplace] = useState(false);
  const [wordCount, setWordCount] = useState<{words: number, chars: number, charsNoSpaces: number, lines: number} | null>(null);

  const calculateWordCount = (text: string) => {
    if (!text) {
      setWordCount({ words: 0, chars: 0, charsNoSpaces: 0, lines: 0 });
      return;
    }
    // Better word count for complex scripts
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const lines = text.split('\n').length;
    setWordCount({ words, chars, charsNoSpaces, lines });
  };

  useEffect(() => {
    const theme = settings.theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply custom accent color
    document.documentElement.style.setProperty('--accent-color', settings.userCustomColor);
    
    // Apply background image if custom_image theme is active
    if (theme === ThemeType.CUSTOM_IMAGE && settings.customBgImage) {
      document.body.style.backgroundImage = `url(${settings.customBgImage})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
    }

    // Apply custom background color if custom_color theme is active
    if (theme === ThemeType.CUSTOM_COLOR) {
      document.documentElement.style.setProperty('--bg-primary', settings.userBackgroundColor);
    }
  }, [settings.theme, settings.userCustomColor, settings.customBgImage, settings.userBackgroundColor]);

  useEffect(() => {
    if (!activeNote) return;
    const timer = window.setTimeout(() => {
      setDebouncedContent(activeNote.content);
    }, 300);
    return () => window.clearTimeout(timer);
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
      calculateWordCount(activeNote.content);
      setIsWordCountModalOpen(true);
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
        showToast("Note Saved");
      }
      
      if (e.ctrlKey && e.key === 'x') {
        const handleEmacsSave = (se: KeyboardEvent) => {
          if (se.key === 's') {
            se.preventDefault();
            handleSave();
            showToast("Note Saved");
            window.removeEventListener('keydown', handleEmacsSave);
          }
        };
        window.addEventListener('keydown', handleEmacsSave);
        window.setTimeout(() => window.removeEventListener('keydown', handleEmacsSave), 1000);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleSave]);

  const handleToolbarAction = (action: ToolbarAction) => {
    if (!editorRef.current) return;

    switch (action) {
      case 'bold':
        editorRef.current.wrapSelection('**', '**', 'bold text');
        break;
      case 'italic':
        editorRef.current.wrapSelection('*', '*', 'italic text');
        break;
      case 'strikethrough':
        editorRef.current.wrapSelection('~~', '~~', 'strikethrough text');
        break;
      case 'underline':
        editorRef.current.wrapSelection('<ins>', '</ins>', 'underlined text');
        break;
      case 'h1':
        editorRef.current.insertAtCursor('# ');
        break;
      case 'h2':
        editorRef.current.insertAtCursor('## ');
        break;
      case 'h3':
        editorRef.current.insertAtCursor('### ');
        break;
      case 'quote':
        editorRef.current.insertAtCursor('> ');
        break;
      case 'formula':
        editorRef.current.wrapSelection('$$', '$$', 'f(x) = ...');
        break;
      case 'csv-table':
        const csv = window.prompt('Paste CSV data here (comma separated):');
        if (csv) {
          const lines = csv.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          if (lines.length > 0) {
            const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
            const header = rows[0];
            const body = rows.slice(1);
            let mdTable = `| ${header.join(' | ')} |\n`;
            mdTable += `| ${header.map(() => '---').join(' | ')} |\n`;
            body.forEach(row => {
              mdTable += `| ${row.join(' | ')} |\n`;
            });
            editorRef.current.insertAtCursor(mdTable);
          }
        }
        break;
      case 'csv-chart':
        const chartCsv = window.prompt('Paste CSV data here (label,value):');
        if (chartCsv) {
          editorRef.current.insertAtCursor(`\n\`\`\`chart\n${chartCsv}\n\`\`\`\n`);
        }
        break;
      case 'code':
        editorRef.current.wrapSelection('`', '`', 'code');
        break;
      case 'code-block':
        editorRef.current.wrapSelection('\n```\n', '\n```\n', 'code block');
        break;
      case 'link':
        editorRef.current.wrapSelection('[', '](url)', 'link text');
        break;
      case 'image':
        editorRef.current.wrapSelection('![', '](url)', 'image alt');
        break;
      case 'list-ul':
        editorRef.current.insertAtCursor('- ');
        break;
      case 'list-ol':
        editorRef.current.insertAtCursor('1. ');
        break;
      case 'todo':
        editorRef.current.insertAtCursor('- [ ] ');
        break;
      case 'hr':
        editorRef.current.insertAtCursor('\n---\n');
        break;
      case 'indent':
        editorRef.current.insertAtCursor('    ');
        break;
      case 'brackets':
        editorRef.current.wrapSelection('[', ']');
        break;
      case 'parens':
        editorRef.current.wrapSelection('(', ')');
        break;
    }
    editorRef.current.focus();
  };

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
    <div className="flex h-[100dvh] w-full bg-[var(--bg-secondary)] overflow-hidden font-sans text-[var(--text-primary)] transition-colors duration-200 relative">
      {settings.theme === ThemeType.AMOLED && <MatrixRain />}
      <Toast 
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
      
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
          onBulkDownload={handleBulkDownload}
          onCreateDailyNote={handleCreateDailyNote}
        />
      </div>
      
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <TopBar 
          title={activeNote?.title || 'Crystal Render'}
          isUnsaved={activeNoteId ? unsavedNotes.has(activeNoteId) : false}
          onSave={() => { handleSave(); showToast("Note Saved"); }}
          onCountWords={handleManualWordCount}
          wordCountResult={wordCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleFindReplace={() => setShowFindReplace(!showFindReplace)}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {activeNote && (settings.viewMode === 'raw' || settings.viewMode === 'split') && (
          <FormattingToolbar onAction={handleToolbarAction} />
        )}

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
                  <MemoizedEditor 
                    ref={editorRef}
                    key={activeNote.id}
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
                    <MemoizedEditor 
                      ref={editorRef}
                      key={activeNote.id}
                      content={activeNote.content} 
                      onChange={handleUpdateContent} 
                      onScroll={handleEditorScroll}
                      onClickLine={handleEditorClick}
                      autoCommentNextLine={settings.autoCommentNextLine}
                      syntaxHighlightRaw={settings.syntaxHighlightRaw}
                      scrollToLine={scrollToLine}
                      percentage={scrollPercentage}
                    />
                  </div>
                  <div className="w-full h-1/2 md:w-1/2 md:h-full order-1 md:order-2 bg-[var(--bg-secondary)]">
                    <VirtualizedPreview 
                      content={debouncedContent} 
                      topLine={scrollInfo.topLine} 
                      percentage={scrollInfo.percentage}
                      onChunkClick={handlePreviewClick}
                      onScroll={handlePreviewScroll}
                    />
                  </div>
                </>
              )}

              {settings.viewMode === 'preview' && (
                <div className="w-full h-full bg-[var(--bg-secondary)]">
                  <VirtualizedPreview 
                    content={debouncedContent} 
                    percentage={scrollInfo.percentage}
                    onScroll={handlePreviewScroll}
                  />
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
      
      {/* <WordCountModal
        isOpen={isWordCountModalOpen}
        onClose={() => setIsWordCountModalOpen(false)}
        stats={wordCount}
      /> */}
    </div>
  );
}
