import React from 'react';
import { WifiOff } from 'lucide-react';

export const SettingsGeneral: React.FC = () => {
  return (
    <div className="space-y-4">
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
