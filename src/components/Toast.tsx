import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose, duration = 2000 }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = window.setTimeout(() => {
        onClose();
      }, duration);
      return () => window.clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <div className={clsx(
      "fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[100]",
      "bg-[var(--bg-tertiary)] text-[var(--text-primary)] px-4 py-2 rounded-full shadow-lg border border-[var(--border-color)]",
      "text-sm font-medium animate-fade-in-up transition-all duration-300",
      "flex items-center space-x-2"
    )}>
      <span>{message}</span>
    </div>,
    document.body
  );
};
