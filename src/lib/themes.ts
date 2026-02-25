export type Theme = 'light' | 'dark' | 'dracula' | 'sepia';

export interface ThemeColors {
  name: string;
  value: Theme;
}

export const themes: ThemeColors[] = [
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
  { name: 'Dracula', value: 'dracula' },
  { name: 'Sepia', value: 'sepia' },
];
