import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../store';
import { format } from 'date-fns';
import { FileText, Plus, Trash2, MoreVertical, Download, Edit2, Upload, FileDown, FolderInput, Search, Calendar, CheckSquare, X } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  unsavedNotes: Set<string>;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
  onRenameNote: (id: string, newTitle: string) => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadNote: (note: Note) => void;
  onBulkDownload: (ids: string[]) => void;
  onCreateDailyNote: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  unsavedNotes,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
  onRenameNote,
  onImportFile,
  onDownloadNote,
  onBulkDownload,
  onCreateDailyNote,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRename = (note: Note) => {
    const newTitle = window.prompt('Enter new title:', note.title);
    if (newTitle !== null && newTitle.trim() !== '') {
      onRenameNote(note.id, newTitle.trim());
    }
    setOpenMenuId(null);
  };

  const handleConvert = (format: string) => {
    alert(`Converting to ${format} requires cloud connection. This feature is not available offline.`);
    setOpenMenuId(null);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedNoteIds(new Set());
  };

  const toggleNoteSelection = (id: string) => {
    const newSelected = new Set(selectedNoteIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNoteIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedNoteIds.size} notes?`)) {
      selectedNoteIds.forEach(id => onDeleteNote(id));
      setIsSelectionMode(false);
      setSelectedNoteIds(new Set());
    }
  };

  const handleBulkDownload = () => {
    onBulkDownload(Array.from(selectedNoteIds));
    setIsSelectionMode(false);
    setSelectedNoteIds(new Set());
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col h-full overflow-hidden transition-colors duration-200">
      <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-primary)] transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Notes</h2>
          <div className="flex items-center space-x-1">
            <input
              type="file"
              accept=".md,.txt,.tex,.js,.ts,.jsx,.tsx,.html,.css,.json,.py,.java,.c,.cpp,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.sql,.sh,.yaml,.yml,.xml"
              ref={fileInputRef}
              onChange={onImportFile}
              className="hidden"
              multiple
            />
            <input
              type="file"
              // @ts-ignore
              webkitdirectory=""
              directory=""
              ref={folderInputRef}
              onChange={onImportFile}
              className="hidden"
              multiple
            />
            
            {isSelectionMode ? (
              <>
                <button
                  onClick={handleBulkDownload}
                  disabled={selectedNoteIds.size === 0}
                  className={`p-1.5 rounded-md transition-colors ${selectedNoteIds.size > 0 ? 'text-[var(--accent-color)] hover:bg-[var(--bg-secondary)]' : 'text-[var(--text-tertiary)] cursor-not-allowed'}`}
                  title="Download Selected"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={selectedNoteIds.size === 0}
                  className={`p-1.5 rounded-md transition-colors ${selectedNoteIds.size > 0 ? 'text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20' : 'text-[var(--text-tertiary)] cursor-not-allowed'}`}
                  title="Delete Selected"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={toggleSelectionMode}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                  title="Cancel Selection"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleSelectionMode}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                  title="Select Notes"
                >
                  <CheckSquare size={18} />
                </button>
                <button
                  onClick={onCreateDailyNote}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--accent-color)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                  title="Daily Note"
                >
                  <Calendar size={18} />
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                  title="Import Folder"
                >
                  <FolderInput size={18} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                  title="Import Files"
                >
                  <Upload size={18} />
                </button>
                <button
                  onClick={onCreateNote}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
                  title="New Note"
                >
                  <Plus size={18} />
                </button>
              </>
            )}
          </div>
        </div>
        
        {!isSelectionMode && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mb-4 flex items-center justify-center space-x-2 py-2 px-4 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium shadow-sm"
          >
            <Upload size={16} />
            <span>Import Files</span>
          </button>
        )}
        
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input 
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredNotes.length === 0 ? (
          <div className="text-center p-8 text-sm text-[var(--text-tertiary)] flex flex-col items-center space-y-4">
            <p>{searchQuery ? 'No matching notes found.' : 'No notes yet.'}</p>
            {!searchQuery && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 py-2 px-4 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <Upload size={16} />
                <span>Import your first note</span>
              </button>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => {
                if (isSelectionMode) {
                  toggleNoteSelection(note.id);
                } else {
                  onSelectNote(note.id);
                }
              }}
              className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                activeNoteId === note.id && !isSelectionMode
                  ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                  : 'hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
              } ${isSelectionMode && selectedNoteIds.has(note.id) ? 'bg-[var(--bg-tertiary)] ring-1 ring-[var(--accent-color)]' : ''}`}
            >
              <div className="flex items-center space-x-3 overflow-hidden pr-6 w-full">
                {isSelectionMode ? (
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${selectedNoteIds.has(note.id) ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-[var(--text-tertiary)]'}`}>
                    {selectedNoteIds.has(note.id) && <CheckSquare size={12} className="text-white" />}
                  </div>
                ) : (
                  <FileText size={16} className={activeNoteId === note.id ? 'text-[var(--accent-color)] shrink-0' : 'text-[var(--text-tertiary)] shrink-0'} />
                )}
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-medium truncate">
                    {note.title || 'Untitled Note'}
                    {unsavedNotes.has(note.id) && <span className="text-[var(--accent-color)] ml-1">*</span>}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] truncate">
                    {format(note.updatedAt, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              
              {!isSelectionMode && (
                <div className="absolute right-2 flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === note.id ? null : note.id);
                    }}
                    className={`p-1.5 rounded-md transition-all ${
                      openMenuId === note.id 
                        ? 'opacity-100 bg-[var(--bg-tertiary)] text-[var(--text-primary)]' 
                        : 'opacity-20 group-hover:opacity-100 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
                    }`}
                    title="More Options"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenuId === note.id && (
                    <div 
                      className="absolute right-0 top-8 w-48 bg-[var(--bg-primary)] rounded-lg shadow-lg border border-[var(--border-color)] py-1 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleRename(note)}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center space-x-2"
                      >
                        <Edit2 size={14} />
                        <span>Rename</span>
                      </button>
                      <button
                        onClick={() => {
                          onDownloadNote(note);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center space-x-2"
                      >
                        <Download size={14} />
                        <span>Download (.md)</span>
                      </button>
                      <button
                        onClick={() => handleConvert('ODT')}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center space-x-2"
                      >
                        <FileDown size={14} />
                        <span>Convert to ODT</span>
                      </button>
                      <button
                        onClick={() => handleConvert('DOCX')}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] flex items-center space-x-2"
                      >
                        <FileDown size={14} />
                        <span>Convert to DOCX</span>
                      </button>
                      <div className="h-px bg-[var(--border-color)] my-1"></div>
                      <button
                        onClick={() => {
                          onDeleteNote(note.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
