import React from 'react';
import { AppSettings } from '../../store';

interface SettingsEditorProps {
  settings: AppSettings;
  onSettingChange: (key: keyof AppSettings, value: boolean) => void;
}

export const SettingsEditor: React.FC<SettingsEditorProps> = ({ settings, onSettingChange }) => {
  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
        <div>
          <div className="font-medium text-[var(--text-primary)]">Live Word Count</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Calculate words and characters as you type. (Not recommended for low-end devices)</div>
        </div>
        <input 
          type="checkbox" 
          checked={settings.liveWordCount} 
          onChange={(e) => onSettingChange('liveWordCount', e.target.checked)}
          className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)] border-[var(--border-color)]"
        />
      </label>

      <label className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
        <div>
          <div className="font-medium text-[var(--text-primary)]">Auto-comment Next Line</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Automatically insert comment prefix on new lines (Vim style).</div>
        </div>
        <input 
          type="checkbox" 
          checked={settings.autoCommentNextLine} 
          onChange={(e) => onSettingChange('autoCommentNextLine', e.target.checked)}
          className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)] border-[var(--border-color)]"
        />
      </label>

      <label className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
        <div>
          <div className="font-medium text-[var(--text-primary)]">Sync Scroll</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Synchronize scrolling between editor and preview in Split View.</div>
        </div>
        <input 
          type="checkbox" 
          checked={settings.syncScroll} 
          onChange={(e) => onSettingChange('syncScroll', e.target.checked)}
          className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)] border-[var(--border-color)]"
        />
      </label>

      <label className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
        <div>
          <div className="font-medium text-[var(--text-primary)]">Syntax Highlight Raw</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Enable syntax highlighting in the raw markdown editor.</div>
        </div>
        <input 
          type="checkbox" 
          checked={settings.syntaxHighlightRaw} 
          onChange={(e) => onSettingChange('syntaxHighlightRaw', e.target.checked)}
          className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)] border-[var(--border-color)]"
        />
      </label>

      <label className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
        <div>
          <div className="font-medium text-[var(--text-primary)]">Syntax Highlight Rendered</div>
          <div className="text-xs text-[var(--text-tertiary)] mt-1">Enable syntax highlighting for code blocks in the preview.</div>
        </div>
        <input 
          type="checkbox" 
          checked={settings.syntaxHighlightRendered} 
          onChange={(e) => onSettingChange('syntaxHighlightRendered', e.target.checked)}
          className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)] border-[var(--border-color)]"
        />
      </label>
    </div>
  );
};
