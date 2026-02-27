import React from 'react';
import { Theme, themes } from '../../lib/themes';

interface SettingsThemesProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const SettingsThemes: React.FC<SettingsThemesProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {themes.map((theme) => (
        <button
          key={theme.value}
          onClick={() => onThemeChange(theme.value)}
          className={`relative p-4 border rounded-lg text-left transition-all ${
            currentTheme === theme.value
              ? 'border-[var(--accent-color)] ring-2 ring-[var(--accent-color)]/20 bg-[var(--bg-tertiary)]'
              : 'border-[var(--border-color)] hover:border-[var(--text-tertiary)]'
          }`}
        >
          <span className="font-medium text-[var(--text-primary)]">{theme.name}</span>
          {currentTheme === theme.value && (
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--accent-color)]"></div>
          )}
        </button>
      ))}
    </div>
  );
};
