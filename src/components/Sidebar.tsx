import React from 'react';
import { Note } from '../store';
import { format } from 'date-fns';
import { FileText, Plus, Trash2 } from 'lucide-react';

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
  onDeleteNote: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}) => {
  return (
    <div className="w-64 bg-zinc-50 border-r border-zinc-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-white">
        <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">Notes</h2>
        <button
          onClick={onCreateNote}
          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
          title="New Note"
        >
          <Plus size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {notes.length === 0 ? (
          <div className="text-center p-4 text-sm text-zinc-500">
            No notes yet. Create one to get started!
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                activeNoteId === note.id
                  ? 'bg-indigo-50 text-indigo-900'
                  : 'hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <FileText size={16} className={activeNoteId === note.id ? 'text-indigo-500' : 'text-zinc-400'} />
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{note.title || 'Untitled Note'}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {format(note.updatedAt, 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                title="Delete Note"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
