import { useState, useEffect } from 'react';
import { Note, loadNotes, saveNotes, createNote } from '../store';
import { format } from 'date-fns';
import welcomeNote from '../assets/welcome-note.md?raw';
import JSZip from 'jszip';

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
    
    setNotes((prev) =>
      prev.map((note) => {
        if (note.id === activeNoteId) {
          const newTitle = titleMatch ? titleMatch[1].trim() : note.title;
          return { ...note, content, title: newTitle, updatedAt: Date.now() };
        }
        return note;
      })
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
    window.setTimeout(() => toast.remove(), 2000);
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>, onComplete?: () => void) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.onerror = reject;
          reader.readAsText(file);
        });

        // Basic binary check: if content contains null bytes, it's probably binary
        if (content.includes('\0')) {
          console.warn(`Skipping binary file: ${file.name}`);
          continue;
        }

        const newNote = createNote();
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        newNote.title = file.name;
        
        // If it's a known code extension, wrap it in a code block
        const codeExtensions = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'sql', 'sh', 'yaml', 'yml', 'xml', 'json', 'css', 'html'];
        if (codeExtensions.includes(extension)) {
          newNote.content = `\`\`\`${extension}\n${content}\n\`\`\``;
        } else {
          newNote.content = content;
        }

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

  const handleBulkDownload = async (ids: string[]) => {
    const zip = new JSZip();
    const selectedNotes = notes.filter(n => ids.includes(n.id));
    
    selectedNotes.forEach(note => {
      zip.file(`${note.title || 'Untitled'}.md`, note.content);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes_export_${format(new Date(), 'yyyyMMdd_HHmmss')}.zip`;
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
    handleDownloadNote,
    handleBulkDownload
  };
}
