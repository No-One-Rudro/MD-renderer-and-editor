import { ThemeType } from '../components/Settings/types';

export type Theme = ThemeType;

export interface ThemeColors {
  name: string;
  value: Theme;
}

export const themes: ThemeColors[] = [
  { name: 'OLED Black', value: ThemeType.AMOLED },
  { name: 'Dark', value: ThemeType.DARK },
  { name: 'Light', value: ThemeType.WHITE },
  { name: 'Dracula', value: ThemeType.DRACULA },
  { name: 'Sepia', value: ThemeType.SEPIA },
  { name: 'System', value: ThemeType.SYSTEM },
  { name: 'Custom Color', value: ThemeType.CUSTOM_COLOR },
  { name: 'Custom Image', value: ThemeType.CUSTOM_IMAGE },
];
