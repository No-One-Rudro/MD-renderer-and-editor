import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { VirtualizedPreview } from './components/Preview/VirtualizedPreview';
import { BufferedPreview } from './components/Preview/BufferedPreview';
import { LivePreview } from './components/Preview/LivePreview';
import { SettingsModal } from './components/SettingsModal';
import { FindReplace } from './components/FindReplace';
import { TopBar } from './components/Toolbar/TopBar';
import { Note, loadNotes, saveNotes, createNote, loadTheme } from './store';
import { format } from 'date-fns';
import { useSettings } from './context/SettingsContext';
import clsx from 'clsx';
import welcomeNote from './assets/welcome-note.md?raw';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [scrollInfo, setScrollInfo] = useState<{ percentage: number, topLine: number }>({ percentage: 0, topLine: 0 });
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const [debouncedContent, setDebouncedContent] = useState<string>('');
  
  // Initialize theme
  useEffect(() => {
    const savedTheme = loadTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const { settings, updateSettings } = useSettings();

  const handlePreviewClick = (line: number) => {
    setScrollToLine(line);
  };

  // New state for menu and features
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [wordCount, setWordCount] = useState<{words: number, chars: number} | null>(null);

  useEffect(() => {
    const loadedNotes = loadNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
    } else {
      const newNote = createNote();
      newNote.title = 'Welcome Note';
      newNote.content = welcomeNote;
      setNotes([newNote]);
      setActiveNoteId(newNote.id);
    }
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes);
    }
  }, [notes]);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  // Debounce content for preview to prevent flickering/reloads
  useEffect(() => {
    if (!activeNote) return;
    const timer = setTimeout(() => {
      setDebouncedContent(activeNote.content);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeNote?.content]);

  // Immediate update when switching notes
  useEffect(() => {
    if (activeNote) {
      setDebouncedContent(activeNote.content);
    }
  }, [activeNoteId]);

  // Live word count logic
  useEffect(() => {
    if (settings.liveWordCount && activeNote) {
      calculateWordCount(activeNote.content);
    } else if (!settings.liveWordCount) {
      setWordCount(null);
    }
  }, [activeNote?.content, settings.liveWordCount]);

  const calculateWordCount = (text: string) => {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const chars = text.length;
    setWordCount({ words, chars });
  };

  const handleManualWordCount = () => {
    if (activeNote) {
      calculateWordCount(activeNote.content);
      // Auto-hide after 3 seconds if not live
      if (!settings.liveWordCount) {
        setTimeout(() => setWordCount(null), 3000);
      }
    }
  };

  const handleCreateNote = () => {
    const newNote = createNote();
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    if (activeNoteId === id) {
      setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    }
  };

  const handleRenameNote = (id: string, newTitle: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, title: newTitle, updatedAt: Date.now() } : note
      )
    );
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Filter for text/markdown files
    const validFiles = Array.from(files).filter(f => 
      f.name.endsWith('.md') || f.name.endsWith('.txt') || f.name.endsWith('.markdown') || f.name.endsWith('.tex') || f.type.startsWith('text/') || f.name.includes('.') === false
    );

    if (validFiles.length === 0) {
      alert("No valid text or markdown files found.");
      event.target.value = '';
      return;
    }

    // Process files sequentially to add them one by one to the sidebar
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.onerror = reject;
          reader.readAsText(file);
        });

        const newNote = createNote();
        newNote.title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        newNote.content = content;

        // Update state incrementally
        setNotes((prev) => [newNote, ...prev]);
        
        // If it's the first file imported, set it as active
        if (i === 0) {
          setActiveNoteId(newNote.id);
        }
        
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }
    
    setIsSidebarOpen(false);
    // Reset input
    event.target.value = '';
  };

  const handleDownloadNote = (note: Note) => {
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title || 'Untitled Note'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCreateDailyNote = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const existingDaily = notes.find(n => n.title === today);
    
    if (existingDaily) {
      setActiveNoteId(existingDaily.id);
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: today,
        content: `# Daily Note: ${today}\n\n## Tasks\n- [ ] \n\n## Notes\n`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotes(updatedNotes);
      setActiveNoteId(newNote.id);
    }
  };

  const handleUpdateContent = (content: string) => {
    if (!activeNoteId) return;
    
    // Extract title from first heading or use 'Untitled'
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Note';

    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNoteId
          ? { ...note, content, title, updatedAt: Date.now() }
          : note
      )
    );
  };

  // Command Palette state
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');

  // Global shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Ctrl+P for Command Palette
      if ((e.ctrlKey && e.key === 'k') || (e.ctrlKey && e.key === 'p')) {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      
      // Ctrl+X Ctrl+S (Emacs save)
      if (e.ctrlKey && e.key === 'x') {
        const handleSave = (se: KeyboardEvent) => {
          if (se.key === 's') {
            se.preventDefault();
            // Show a temporary "Saved" indicator or toast
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] animate-bounce';
            toast.innerText = 'Note Saved (Auto-save is active)';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
            window.removeEventListener('keydown', handleSave);
          }
        };
        window.addEventListener('keydown', handleSave);
        setTimeout(() => window.removeEventListener('keydown', handleSave), 1000);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

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

  const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(commandQuery.toLowerCase()));

  return (
    <div className="flex h-screen w-full bg-[var(--bg-secondary)] overflow-hidden font-sans text-[var(--text-primary)] transition-colors duration-200">
      {/* Command Palette */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={() => setIsCommandPaletteOpen(false)}>
          <div className="bg-[var(--bg-primary)] w-full max-w-xl rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-[var(--border-color)]">
              <input 
                autoFocus
                type="text" 
                placeholder="Type a command or note name..."
                className="w-full bg-transparent text-lg focus:outline-none"
                value={commandQuery}
                onChange={e => setCommandQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setIsCommandPaletteOpen(false);
                  if (e.key === 'Enter' && filteredCommands.length > 0) {
                    filteredCommands[0].action();
                    setIsCommandPaletteOpen(false);
                    setCommandQuery('');
                  }
                }}
              />
            </div>
            <div className="max-h-[40vh] overflow-y-auto p-2">
              {filteredCommands.map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    cmd.action();
                    setIsCommandPaletteOpen(false);
                    setCommandQuery('');
                  }}
                  className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between group"
                >
                  <span>{cmd.name}</span>
                  <span className="text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100">Enter to run</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setIsSidebarOpen(false);
          }}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onRenameNote={handleRenameNote}
          onImportFile={handleImportFile}
          onDownloadNote={handleDownloadNote}
          onCreateDailyNote={handleCreateDailyNote}
        />
      </div>
      
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <TopBar 
          title={activeNote?.title || 'Markdown & LaTeX Studio'}
          onCountWords={handleManualWordCount}
          wordCountResult={wordCount}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleFindReplace={() => setShowFindReplace(!showFindReplace)}
          onToggleSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Find and Replace Overlay */}
        {showFindReplace && activeNote && (
          <FindReplace 
            content={activeNote.content} 
            onChange={handleUpdateContent} 
            onClose={() => setShowFindReplace(false)} 
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden flex-col md:flex-row relative">
          {activeNote ? (
            <>
              {/* Mode 1: Raw - Full Editor */}
              {settings.viewMode === 'raw' && (
                <div className="w-full h-full">
                  <Editor 
                    content={activeNote.content} 
                    onChange={handleUpdateContent} 
                    onScroll={setScrollInfo}
                    autoCommentNextLine={settings.autoCommentNextLine}
                    syntaxHighlightRaw={settings.syntaxHighlightRaw}
                  />
                </div>
              )}

              {/* Mode 2: Split - Editor + Virtualized Preview */}
              {settings.viewMode === 'split' && (
                <>
                  <div className="w-full h-1/2 md:w-1/2 md:h-full order-2 md:order-1 border-t md:border-t-0 md:border-r border-[var(--border-color)]">
                    <Editor 
                      content={activeNote.content} 
                      onChange={handleUpdateContent} 
                      onScroll={setScrollInfo}
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
                    />
                  </div>
                </>
              )}

              {/* Mode 3: Simple Preview - Buffered Full Preview */}
              {settings.viewMode === 'preview' && (
                <div className="w-full h-full bg-[var(--bg-secondary)]">
                  <BufferedPreview content={debouncedContent} />
                </div>
              )}

              {/* Mode 4: Live - Obsidian-like */}
              {settings.viewMode === 'live' && (
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
