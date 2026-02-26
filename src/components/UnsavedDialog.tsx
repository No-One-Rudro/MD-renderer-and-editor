import React from 'react';
import { AlertTriangle, Save, Trash2, X } from 'lucide-react';

interface UnsavedDialogProps {
  isOpen: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const UnsavedDialog: React.FC<UnsavedDialogProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-[var(--bg-primary)] rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-[var(--border-color)]">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Unsaved Changes</h2>
          </div>
          
          <p className="text-[var(--text-secondary)] mb-6">
            You have unsaved changes in the current note. Do you want to save them before proceeding?
          </p>
          
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-center"
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            
            <button
              onClick={onDiscard}
              className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center"
            >
              <Trash2 size={18} className="mr-2" />
              Discard
            </button>
            
            <button
              onClick={onSave}
              className="px-4 py-2 rounded-lg bg-[var(--accent-color)] text-white hover:opacity-90 transition-colors flex items-center justify-center shadow-sm"
            >
              <Save size={18} className="mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
