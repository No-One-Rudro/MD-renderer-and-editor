import React from 'react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export const Editor: React.FC<EditorProps> = ({ content, onChange }) => {
  return (
    <div className="flex-1 h-full flex flex-col bg-white">
      <textarea
        className="flex-1 w-full h-full p-8 resize-none focus:outline-none font-mono text-sm text-zinc-800 leading-relaxed"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start typing your Markdown or LaTeX here..."
        spellCheck={false}
      />
    </div>
  );
};
