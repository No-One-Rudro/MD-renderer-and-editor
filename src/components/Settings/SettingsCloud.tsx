import React from 'react';

export const SettingsCloud: React.FC = () => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        Offload heavy LaTeX and Markdown rendering to Google Colab. This saves CPU and RAM on your local device while providing high-performance rendering.
      </p>
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
  );
};
