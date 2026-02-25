import React, { useState, useEffect } from 'react';
import { X, Cloud, Monitor, WifiOff, HardDrive, Palette, Settings as SettingsIcon } from 'lucide-react';
import { Theme, themes } from '../lib/themes';
import { loadTheme, saveTheme, AppSettings } from '../store';
import { useSettings } from '../context/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'cloud' | 'themes' | 'plugins'>('general');
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

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] p-4 space-y-1 transition-colors duration-200">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'general' ? 'bg-[var(--bg-tertiary)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Monitor size={16} />
              <span>General</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'editor' ? 'bg-[var(--bg-tertiary)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <SettingsIcon size={16} />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'cloud' ? 'bg-[var(--bg-tertiary)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Cloud size={16} />
              <span>Cloud Colab</span>
            </button>
            <button
              onClick={() => setActiveTab('themes')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'themes' ? 'bg-[var(--bg-tertiary)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Palette size={16} />
              <span>Themes</span>
            </button>
            <button
              onClick={() => setActiveTab('plugins')}
              className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'plugins' ? 'bg-[var(--bg-tertiary)] text-[var(--accent-color)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <HardDrive size={16} />
              <span>Plugins</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-primary)] transition-colors duration-200">
            {activeTab === 'general' && (
              <div className="space-y-6">
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
            )}

            {activeTab === 'editor' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">Editor Settings</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Configure editing behavior and features.</p>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer transition-colors">
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">Live Word Count</div>
                      <div className="text-xs text-[var(--text-tertiary)] mt-1">Calculate words and characters as you type. (Not recommended for low-end devices)</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={settings.liveWordCount} 
                      onChange={(e) => handleSettingChange('liveWordCount', e.target.checked)}
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
                      onChange={(e) => handleSettingChange('autoCommentNextLine', e.target.checked)}
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
                      onChange={(e) => handleSettingChange('syntaxHighlightRaw', e.target.checked)}
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
                      onChange={(e) => handleSettingChange('syntaxHighlightRendered', e.target.checked)}
                      className="w-4 h-4 text-[var(--accent-color)] rounded focus:ring-[var(--accent-color)] border-[var(--border-color)]"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'cloud' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">Cloud Colab Processing</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    Offload heavy LaTeX and Markdown rendering to Google Colab. This saves CPU and RAM on your local device while providing high-performance rendering.
                  </p>
                </div>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg p-4">
                  <button className="w-full py-2.5 px-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg shadow-sm text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors flex items-center justify-center space-x-2">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
                    <span>Sign in with Google</span>
                  </button>
                  <div className="mt-4 text-xs text-[var(--text-tertiary)] text-center">
                    Connect your account to run the processing script in your Colab environment.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'themes' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">Appearance</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Select a theme for the application.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value)}
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
              </div>
            )}

            {activeTab === 'plugins' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-[var(--text-primary)]">Plugins</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Extend functionality with plugins.</p>
                </div>
                <div className="text-sm text-[var(--text-tertiary)] italic">
                  Plugin marketplace coming soon...
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
