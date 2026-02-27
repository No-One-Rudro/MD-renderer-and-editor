export enum ThemeType {
  AMOLED = 'amoled',
  DARK = 'dark',
  WHITE = 'white',
  SYSTEM = 'system',
  DRACULA = 'dracula',
  SEPIA = 'sepia',
  CUSTOM_COLOR = 'custom_color',
  CUSTOM_IMAGE = 'custom_image'
}

export interface ThemeColors {
  bg: string;
  text: string;
  accent: string;
  border: string;
  button: string;
  iconColor: string;
  iconClass: string;
}
