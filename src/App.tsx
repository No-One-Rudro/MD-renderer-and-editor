import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Editor } from './components/Editor';
import { Preview } from './components/Preview';
import { Note, loadNotes, saveNotes, createNote } from './store';
import { SplitSquareHorizontal, Eye, Edit3 } from 'lucide-react';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');

  useEffect(() => {
    const loadedNotes = loadNotes();
    setNotes(loadedNotes);
    if (loadedNotes.length > 0) {
      setActiveNoteId(loadedNotes[0].id);
    } else {
      const newNote = createNote();
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

  const handleCreateNote = () => {
    const newNote = createNote();
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    if (activeNoteId === id) {
      setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
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

  return (
    <div className="flex h-screen w-full bg-zinc-100 overflow-hidden font-sans text-zinc-900">
      <Sidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={handleCreateNote}
        onDeleteNote={handleDeleteNote}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Toolbar */}
        <div className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-semibold text-zinc-800">
              {activeNote?.title || 'Markdown & LaTeX Studio'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            <button
              onClick={() => setViewMode('edit')}
              className={`p-1.5 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors ${
                viewMode === 'edit' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Edit Only"
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors ${
                viewMode === 'split' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Split View"
            >
              <SplitSquareHorizontal size={16} />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`p-1.5 rounded-md flex items-center space-x-1 text-sm font-medium transition-colors ${
                viewMode === 'preview' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-900'
              }`}
              title="Preview Only"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {activeNote ? (
            <>
              {(viewMode === 'edit' || viewMode === 'split') && (
                <div className={`h-full ${viewMode === 'split' ? 'w-1/2 border-r border-zinc-200' : 'w-full'}`}>
                  <Editor content={activeNote.content} onChange={handleUpdateContent} />
                </div>
              )}
              {(viewMode === 'preview' || viewMode === 'split') && (
                <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <Preview content={activeNote.content} />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-zinc-400">
              Select or create a note to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
