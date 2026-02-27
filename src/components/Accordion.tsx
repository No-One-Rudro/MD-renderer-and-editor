import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ title, icon, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-[var(--border-color)] rounded-lg overflow-hidden mb-4 transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon && <span className="text-[var(--text-secondary)]">{icon}</span>}
          <span className="font-medium text-[var(--text-primary)]">{title}</span>
        </div>
        <span className="text-[var(--text-secondary)]">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </span>
      </button>
      {isOpen && (
        <div className="p-4 bg-[var(--bg-primary)] border-t border-[var(--border-color)] transition-colors">
          {children}
        </div>
      )}
    </div>
  );
};
