import React, { useState } from 'react';
import { X, Search } from 'lucide-react';

interface FindReplaceProps {
  content: string;
  onChange: (content: string) => void;
  onClose: () => void;
}

export const FindReplace: React.FC<FindReplaceProps> = ({ content, onChange, onClose }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [useRegex, setUseRegex] = useState(false);

  const handleReplace = () => {
    if (!findText) return;
    try {
      // 'm' flag makes ^ and $ match start/end of line, not just string
      // 'g' is needed for replaceAll, but for single replace we might not want it?
      // Actually, String.prototype.replace only replaces first occurrence if no 'g' flag is present in regex.
      // But if findText is string, it replaces first.
      const flags = useRegex ? 'm' : ''; 
      const search = useRegex ? new RegExp(findText, flags) : findText;
      const newContent = content.replace(search, replaceText);
      onChange(newContent);
    } catch (e) {
      alert('Invalid Regex');
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    try {
      // 'g' for global, 'm' for multiline anchors
      const flags = useRegex ? 'gm' : 'g';
      const search = useRegex ? new RegExp(findText, flags) : new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const newContent = content.replace(search, replaceText);
      onChange(newContent);
    } catch (e) {
      alert('Invalid Regex');
    }
  };

  return (
    <div className="absolute top-16 right-4 bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-lg shadow-xl z-50 flex flex-col gap-3 w-80">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <Search size={16} /> Find & Replace
        </span>
        <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <X size={16}/>
        </button>
      </div>
      <textarea 
        className="border border-[var(--border-color)] p-2 rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] resize-y min-h-[40px]" 
        placeholder="Find..." 
        value={findText} 
        onChange={e => setFindText(e.target.value)} 
      />
      <textarea 
        className="border border-[var(--border-color)] p-2 rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] resize-y min-h-[40px]" 
        placeholder="Replace..." 
        value={replaceText} 
        onChange={e => setReplaceText(e.target.value)} 
      />
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <label className="flex items-center gap-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={useRegex} 
            onChange={e => setUseRegex(e.target.checked)} 
            className="rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
          /> 
          Regex (Multiline)
        </label>
      </div>
      <div className="flex gap-2 mt-1">
        <button onClick={handleReplace} className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-3 py-1.5 rounded text-sm flex-1 transition-colors">
          Replace
        </button>
        <button onClick={handleReplaceAll} className="bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-[var(--accent-text)] px-3 py-1.5 rounded text-sm flex-1 transition-colors">
          Replace All
        </button>
      </div>
    </div>
  );
};
