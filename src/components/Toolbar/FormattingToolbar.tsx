import React from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Quote, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Code, 
  Terminal, 
  Hash, 
  Minus, 
  Link as LinkIcon, 
  Image as ImageIcon,
  Indent,
  Brackets,
  Parentheses
} from 'lucide-react';

export type ToolbarAction = 
  | 'bold' 
  | 'italic' 
  | 'underline' 
  | 'strikethrough' 
  | 'quote' 
  | 'list-ul' 
  | 'list-ol' 
  | 'todo' 
  | 'code' 
  | 'code-block' 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'hr' 
  | 'link' 
  | 'image'
  | 'indent'
  | 'brackets'
  | 'parens'
  | 'formula'
  | 'csv-table'
  | 'csv-chart';

interface FormattingToolbarProps {
  onAction: (action: ToolbarAction) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onAction }) => {
  const tools: { icon: React.ReactNode; action: ToolbarAction; label: string }[] = [
    { icon: <Bold size={16} />, action: 'bold', label: 'Bold' },
    { icon: <Italic size={16} />, action: 'italic', label: 'Italic' },
    { icon: <Strikethrough size={16} />, action: 'strikethrough', label: 'Strikethrough' },
    { icon: <Underline size={16} />, action: 'underline', label: 'Underline' },
    { icon: <div className="font-bold text-xs">H1</div>, action: 'h1', label: 'Heading 1' },
    { icon: <div className="font-bold text-xs">H2</div>, action: 'h2', label: 'Heading 2' },
    { icon: <div className="font-bold text-xs">H3</div>, action: 'h3', label: 'Heading 3' },
    { icon: <Quote size={16} />, action: 'quote', label: 'Quote' },
    { icon: <div className="font-serif italic text-xs">f(x)</div>, action: 'formula', label: 'Insert Formula (LaTeX)' },
    { icon: <div className="font-mono text-xs">CSV</div>, action: 'csv-table', label: 'Import CSV as Table' },
    { icon: <div className="font-mono text-xs">Chart</div>, action: 'csv-chart', label: 'Import CSV as Chart' },
    { icon: <Code size={16} />, action: 'code', label: 'Inline Code' },
    { icon: <Terminal size={16} />, action: 'code-block', label: 'Code Block' },
    { icon: <LinkIcon size={16} />, action: 'link', label: 'Link' },
    { icon: <ImageIcon size={16} />, action: 'image', label: 'Image' },
    { icon: <List size={16} />, action: 'list-ul', label: 'Bulleted List' },
    { icon: <ListOrdered size={16} />, action: 'list-ol', label: 'Numbered List' },
    { icon: <CheckSquare size={16} />, action: 'todo', label: 'Checkbox' },
    { icon: <Minus size={16} />, action: 'hr', label: 'Horizontal Rule' },
    { icon: <Indent size={16} />, action: 'indent', label: 'Indent' },
    { icon: <div className="font-mono text-xs">()</div>, action: 'parens', label: 'Parentheses' },
    { icon: <div className="font-mono text-xs">[]</div>, action: 'brackets', label: 'Brackets' },
  ];

  return (
    <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar p-1 bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
      {tools.map((tool, index) => (
        <button
          key={index}
          onClick={() => onAction(tool.action)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] rounded-md transition-colors flex-shrink-0"
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};
