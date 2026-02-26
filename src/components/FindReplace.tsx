import React, { useState } from 'react';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';

interface FindReplaceProps {
  content: string;
  onChange: (content: string) => void;
  onClose: () => void;
}

export const FindReplace: React.FC<FindReplaceProps> = ({ content, onChange, onClose }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [useRegex, setUseRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);

  const handleReplace = () => {
    if (!findText) return;
    try {
      let flags = matchCase ? 'm' : 'im';
      let search: RegExp | string = findText;

      if (useRegex) {
        search = new RegExp(findText, flags);
      } else {
        // Escape special chars for literal search, but we need RegExp to use flags
        const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        search = new RegExp(escaped, flags);
      }

      const newContent = content.replace(search, replaceText);
      onChange(newContent);
    } catch (e) {
      alert('Invalid Regex');
    }
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    try {
      let flags = matchCase ? 'gm' : 'igm';
      let search: RegExp;

      if (useRegex) {
        search = new RegExp(findText, flags);
      } else {
        const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        search = new RegExp(escaped, flags);
      }

      const newContent = content.replace(search, replaceText);
      onChange(newContent);
    } catch (e) {
      alert('Invalid Regex');
    }
  };

  return (
    <div className="absolute top-16 right-4 bg-[var(--bg-primary)] border border-[var(--border-color)] p-4 rounded-lg shadow-xl z-50 flex flex-col gap-3 w-80 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 mb-1">
        <span className="text-sm font-semibold flex items-center gap-2 text-[var(--text-primary)]">
          <Search size={16} /> Find & Replace
        </span>
        <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors p-1 hover:bg-[var(--bg-secondary)] rounded">
          <X size={16}/>
        </button>
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <input 
            className="w-full border border-[var(--border-color)] p-2 rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all placeholder-[var(--text-tertiary)]" 
            placeholder="Find..." 
            value={findText} 
            onChange={e => setFindText(e.target.value)} 
          />
        </div>
        <div className="relative">
          <input 
            className="w-full border border-[var(--border-color)] p-2 rounded text-sm bg-[var(--bg-secondary)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all placeholder-[var(--text-tertiary)]" 
            placeholder="Replace..." 
            value={replaceText} 
            onChange={e => setReplaceText(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          <input 
            type="checkbox" 
            checked={useRegex} 
            onChange={e => setUseRegex(e.target.checked)} 
            className="rounded border-[var(--border-color)] text-[var(--accent-color)] focus:ring-[var(--accent-color)] bg-[var(--bg-secondary)]"
          /> 
          Regex
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer hover:text-[var(--text-primary)] transition-colors">
          <input 
            type="checkbox" 
            checked={matchCase} 
            onChange={e => setMatchCase(e.target.checked)} 
            className="rounded border-[var(--border-color)] text-[var(--accent-color)] focus:ring-[var(--accent-color)] bg-[var(--bg-secondary)]"
          /> 
          Match Case
        </label>
      </div>

      <div className="flex gap-2 mt-1">
        <button 
          onClick={handleReplace} 
          className="bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-3 py-2 rounded text-xs font-medium flex-1 transition-colors border border-[var(--border-color)]"
        >
          Replace One
        </button>
        <button 
          onClick={handleReplaceAll} 
          className="bg-[var(--accent-color)] hover:opacity-90 text-white px-3 py-2 rounded text-xs font-medium flex-1 transition-all shadow-sm"
        >
          Replace All
        </button>
      </div>
    </div>
  );
};
