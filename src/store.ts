import { v4 as uuidv4 } from 'uuid';
import { Theme } from './lib/themes';

export interface AppSettings {
  liveWordCount: boolean;
  autoCommentNextLine: boolean;
  syntaxHighlightRaw: boolean;
  syntaxHighlightRendered: boolean;
  viewMode: 'raw' | 'split' | 'preview' | 'live';
}

const defaultSettings: AppSettings = {
  liveWordCount: false,
  autoCommentNextLine: false,
  syntaxHighlightRaw: false,
  syntaxHighlightRendered: true,
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

export const loadNotes = (): Note[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load notes', e);
    return [];
  }
};

export const saveNotes = (notes: Note[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
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
