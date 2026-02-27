import React, { useState } from 'react';
import ThemesView from './ThemesView';
import InterfaceColorView from './InterfaceColorView';
import { useSettings } from '../../context/SettingsContext';
import { ThemeType, ThemeColors } from './types';
import { Palette, Image as ImageIcon } from 'lucide-react';

export const SettingsThemes: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [view, setView] = useState<'main' | 'themes' | 'interface'>('main');

  const themeColors: ThemeColors = {
    bg: 'var(--bg-primary)',
    text: 'var(--text-primary)',
    accent: 'var(--accent-color)',
    border: 'var(--border-color)',
    button: 'bg-[var(--bg-secondary)]',
    iconColor: 'var(--text-primary)',
    iconClass: 'text-[var(--text-primary)]'
  };

  const handleBgImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateSettings({ 
          customBgImage: base64String,
          bgHistory: [base64String, ...(settings.bgHistory || []).slice(0, 9)]
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (view === 'themes') {
    return (
      <ThemesView
        onBack={() => setView('main')}
        theme={settings.theme}
        setTheme={(t) => updateSettings({ theme: t })}
        userBackgroundColor={settings.userBackgroundColor}
        setUserBackgroundColor={(c) => updateSettings({ userBackgroundColor: c })}
        customBgImage={settings.customBgImage}
        onSetCustomBg={(bg) => updateSettings({ customBgImage: bg })}
        onBgImageUpload={handleBgImageUpload}
        bgHistory={settings.bgHistory}
        onRemoveBgHistoryItem={(index) => {
          const newHistory = [...(settings.bgHistory || [])];
          newHistory.splice(index, 1);
          updateSettings({ bgHistory: newHistory });
        }}
        t={themeColors}
      />
    );
  }

  if (view === 'interface') {
    return (
      <InterfaceColorView
        onBack={() => setView('main')}
        userCustomColor={settings.userCustomColor}
        setUserCustomColor={(c) => updateSettings({ userCustomColor: c })}
        t={themeColors}
      />
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => setView('themes')}
        className="w-full p-4 flex items-center justify-between bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] transition-all group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg text-[var(--accent-color)]">
            <ImageIcon size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-[var(--text-primary)]">Background & Themes</div>
            <div className="text-xs text-[var(--text-tertiary)]">Change wallpaper, OLED mode, or custom colors</div>
          </div>
        </div>
        <div className="text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform">→</div>
      </button>

      <button
        onClick={() => setView('interface')}
        className="w-full p-4 flex items-center justify-between bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)] transition-all group"
      >
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-[var(--accent-color)]/10 rounded-lg text-[var(--accent-color)]">
            <Palette size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-[var(--text-primary)]">Interface Accent</div>
            <div className="text-xs text-[var(--text-tertiary)]">Customize the global highlight color</div>
          </div>
        </div>
        <div className="text-[var(--text-tertiary)] group-hover:translate-x-1 transition-transform">→</div>
      </button>
    </div>
  );
};
