import React from 'react';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const SettingsGeneral: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="space-y-6">
      <label className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
        <div>
          <div className="font-medium text-[var(--text-primary)] flex items-center space-x-2">
            <AlertCircle size={18} className="text-[var(--text-secondary)]" />
            <span>Detect Unsaved Changes</span>
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Show a warning indicator when the current note has unsaved changes.</div>
        </div>
        <input 
          type="checkbox" 
          checked={settings.detectUnsaved} 
          onChange={(e) => updateSettings({ detectUnsaved: e.target.checked })}
          className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)] border-[var(--border-color)]"
        />
      </label>

      <div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] flex items-center space-x-2">
          <WifiOff size={18} className="text-[var(--text-secondary)]" />
          <span>Offline Mode</span>
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          This app is a Progressive Web App (PWA) and works fully offline. You can install it on your device and use it without an internet connection. Your notes are saved locally in your browser.
        </p>
      </div>
    </div>
  );
};
