import { get, set, del, keys } from 'idb-keyval';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

export const db = {
  async getNote(id: string): Promise<Note | undefined> {
    return get(id);
  },
  async saveNote(note: Note): Promise<void> {
    return set(note.id, note);
  },
  async deleteNote(id: string): Promise<void> {
    return del(id);
  },
  async getAllNotes(): Promise<Note[]> {
    const allKeys = await keys();
    const notes: Note[] = [];
    for (const key of allKeys) {
      if (typeof key === 'string') {
        const note = await get<Note>(key);
        if (note) notes.push(note);
      }
    }
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  },
};
