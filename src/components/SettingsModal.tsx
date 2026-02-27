import React, { useState, useEffect } from 'react';
import { X, Cloud, Monitor, HardDrive, Palette, Settings as SettingsIcon } from 'lucide-react';
import { Theme } from '../lib/themes';
import { loadTheme, saveTheme, AppSettings } from '../store';
import { useSettings } from '../context/SettingsContext';
import { Accordion } from './Accordion';
import { SettingsGeneral } from './Settings/SettingsGeneral';
import { SettingsEditor } from './Settings/SettingsEditor';
import { SettingsCloud } from './Settings/SettingsCloud';
import { SettingsThemes } from './Settings/SettingsThemes';
import { SettingsPlugins } from './Settings/SettingsPlugins';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    if (isOpen) {
      setCurrentTheme(loadTheme());
    }
  }, [isOpen]);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    saveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleSettingChange = (key: keyof AppSettings, value: boolean) => {
    updateSettings({ [key]: value });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-colors duration-200">
      <div className="bg-[var(--bg-primary)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden transition-colors duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] transition-colors duration-200">
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Settings</h2>
          <button onClick={onClose} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-primary)] transition-colors duration-200">
          <Accordion title="General" icon={<Monitor size={18} />} defaultOpen={true}>
            <SettingsGeneral />
          </Accordion>

          <Accordion title="Editor" icon={<SettingsIcon size={18} />}>
            <SettingsEditor settings={settings} onSettingChange={handleSettingChange} />
          </Accordion>

          <Accordion title="Cloud Colab" icon={<Cloud size={18} />}>
            <SettingsCloud />
          </Accordion>

          <Accordion title="Themes" icon={<Palette size={18} />}>
            <SettingsThemes currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          </Accordion>

          <Accordion title="Plugins" icon={<HardDrive size={18} />}>
            <SettingsPlugins />
          </Accordion>
        </div>
      </div>
    </div>
  );
};
