import React, { useState, useEffect } from 'react';

interface Command {
  name: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, commands }) => {
  const [commandQuery, setCommandQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCommandQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCommands = commands.filter(c => c.name.toLowerCase().includes(commandQuery.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[var(--bg-primary)] w-full max-w-xl rounded-xl shadow-2xl border border-[var(--border-color)] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--border-color)]">
          <input 
            autoFocus
            type="text" 
            placeholder="Type a command or note name..."
            className="w-full bg-transparent text-lg focus:outline-none text-[var(--text-primary)]"
            value={commandQuery}
            onChange={e => setCommandQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && filteredCommands.length > 0) {
                filteredCommands[0].action();
                onClose();
              }
            }}
          />
        </div>
        <div className="max-h-[40vh] overflow-y-auto p-2">
          {filteredCommands.map((cmd, i) => (
            <button
              key={i}
              onClick={() => {
                cmd.action();
                onClose();
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors flex items-center justify-between group text-[var(--text-primary)]"
            >
              <span>{cmd.name}</span>
              <span className="text-xs text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100">Enter to run</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
