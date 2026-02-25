export enum ThemeType {
  AMOLED = 'AMOLED',
  DARK = 'DARK',
  WHITE = 'WHITE',
  SYSTEM = 'SYSTEM',
  CUSTOM_COLOR = 'CUSTOM_COLOR',
  CUSTOM_IMAGE = 'CUSTOM_IMAGE'
}

export interface CustomFont {
  id: string;
  name: string;
  format: string;
}

export type EngineVersion = string;

export interface ExtendedSlot {
  id: string;
  type: 'file' | 'folder';
  files: File[];
  pathDisplay: string;
  customPath?: string;
}

export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  size?: number;
  children: TreeNode[];
  matchesSearch?: boolean;
}

export interface PaperSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

export interface Engine {
  id: string;
  label: string;
  name: string;
  desc: string;
  code: string;
}
