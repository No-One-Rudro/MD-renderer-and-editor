import { v4 as uuidv4 } from 'uuid';
import { Theme } from './lib/themes';
import { get, set } from 'idb-keyval';

export interface AppSettings {
  liveWordCount: boolean;
  autoCommentNextLine: boolean;
  syntaxHighlightRaw: boolean;
  syntaxHighlightRendered: boolean;
  syncScroll: boolean;
  viewMode: 'raw' | 'split' | 'preview' | 'lightning' | 'live';
}

const defaultSettings: AppSettings = {
  liveWordCount: false,
  autoCommentNextLine: false,
  syntaxHighlightRaw: false,
  syntaxHighlightRendered: true,
  syncScroll: false,
  viewMode: 'raw',
};

const SETTINGS_KEY = 'markdown_studio_settings';

export const loadSettings = (): AppSettings => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch (e) {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
};

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'markdown_studio_notes';
const THEME_KEY = 'markdown_studio_theme';

export const loadNotes = async (): Promise<Note[]> => {
  try {
    const data = await get(STORAGE_KEY);
    if (data) return data;
    
    // Fallback to localStorage for migration
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
      const parsed = JSON.parse(localData);
      await set(STORAGE_KEY, parsed);
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load notes', e);
    return [];
  }
};

export const saveNotes = async (notes: Note[]): Promise<void> => {
  try {
    await set(STORAGE_KEY, notes);
    // Also save to localStorage as a backup if it's small enough, or just remove it
    // localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
};

export const loadTheme = (): Theme => {
  try {
    return (localStorage.getItem(THEME_KEY) as Theme) || 'light';
  } catch (e) {
    return 'light';
  }
};

export const saveTheme = (theme: Theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
};

export const createNote = (): Note => {
  const now = Date.now();
  return {
    id: uuidv4(),
    title: 'Untitled Note',
    content: '',
    createdAt: now,
    updatedAt: now,
  };
};
