import { useState, useEffect } from 'react';
import { Note, loadNotes, saveNotes, createNote } from '../store';
import { format } from 'date-fns';
import welcomeNote from '../assets/welcome-note.md?raw';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [unsavedNotes, setUnsavedNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initNotes = async () => {
      const loadedNotes = await loadNotes();
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
    };
    initNotes();
  }, []);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  const handleCreateNote = () => {
    const newNote = createNote();
    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    const updatedNotes = notes.filter((n) => n.id !== id);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    if (activeNoteId === id) {
      setActiveNoteId(updatedNotes.length > 0 ? updatedNotes[0].id : null);
    }
  };

  const handleRenameNote = (id: string, newTitle: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, title: newTitle, updatedAt: Date.now() } : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
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
    
    const titleMatch = content.match(/^#\s+(.*)/m);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Note';

    setNotes((prev) =>
      prev.map((note) =>
        note.id === activeNoteId
          ? { ...note, content, title, updatedAt: Date.now() }
          : note
      )
    );
    
    setUnsavedNotes(prev => new Set(prev).add(activeNoteId));
  };

  const handleSave = () => {
    saveNotes(notes);
    setUnsavedNotes(new Set());
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-[100] animate-bounce';
    toast.innerText = 'Note Saved Successfully';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>, onComplete?: () => void) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter(f => 
      f.name.endsWith('.md') || f.name.endsWith('.txt') || f.name.endsWith('.markdown') || f.name.endsWith('.tex') || f.type.startsWith('text/') || f.name.includes('.') === false
    );

    if (validFiles.length === 0) {
      alert("No valid text or markdown files found.");
      event.target.value = '';
      return;
    }

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
        newNote.title = file.name.replace(/\.[^/.]+$/, "");
        newNote.content = content;

        setNotes((prev) => {
          const updated = [newNote, ...prev];
          saveNotes(updated);
          return updated;
        });
        
        if (i === 0) {
          setActiveNoteId(newNote.id);
        }
        
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }
    
    if (onComplete) onComplete();
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

  return {
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
  };
}
