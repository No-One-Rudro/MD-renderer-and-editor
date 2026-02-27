import { RefObject } from 'react';

export function useEditorKeybindings(
  onChange: (content: string) => void,
  autoCommentNextLine: boolean,
  textareaRef: RefObject<HTMLTextAreaElement | null>
) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLDivElement>) => {
    const target = e.target as HTMLTextAreaElement;
    
    if (target.selectionStart === undefined || target.value === undefined) return;

    const { selectionStart, value } = target;

    if (e.ctrlKey) {
      switch (e.key) {
        case 'a':
          e.preventDefault();
          const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
          target.setSelectionRange(lineStart, lineStart);
          break;
        case 'e':
          e.preventDefault();
          let lineEnd = value.indexOf('\n', selectionStart);
          if (lineEnd === -1) lineEnd = value.length;
          target.setSelectionRange(lineEnd, lineEnd);
          break;
        case 'k':
          e.preventDefault();
          let nextLine = value.indexOf('\n', selectionStart);
          if (nextLine === -1) nextLine = value.length;
          if (nextLine === selectionStart && nextLine < value.length) nextLine++;
          const killedText = value.substring(selectionStart, nextLine);
          const newValueKilled = value.substring(0, selectionStart) + value.substring(nextLine);
          onChange(newValueKilled);
          navigator.clipboard.writeText(killedText).catch(() => {});
          break;
        case 'f':
          e.preventDefault();
          target.setSelectionRange(selectionStart + 1, selectionStart + 1);
          break;
        case 'b':
          e.preventDefault();
          target.setSelectionRange(Math.max(0, selectionStart - 1), Math.max(0, selectionStart - 1));
          break;
        case 'd':
          e.preventDefault();
          const newValueD = value.substring(0, selectionStart) + value.substring(selectionStart + 1);
          onChange(newValueD);
          window.setTimeout(() => {
            target.setSelectionRange(selectionStart, selectionStart);
          }, 0);
          break;
        case 'h':
          e.preventDefault();
          if (selectionStart > 0) {
            const newValueH = value.substring(0, selectionStart - 1) + value.substring(selectionStart);
            onChange(newValueH);
            window.setTimeout(() => {
              target.setSelectionRange(selectionStart - 1, selectionStart - 1);
            }, 0);
          }
          break;
      }
    }

    if (e.altKey) {
      switch (e.key) {
        case 'f':
          e.preventDefault();
          const nextWord = value.indexOf(' ', selectionStart + 1);
          const nextLine = value.indexOf('\n', selectionStart + 1);
          const targetPos = Math.min(
            nextWord === -1 ? value.length : nextWord + 1,
            nextLine === -1 ? value.length : nextLine + 1
          );
          target.setSelectionRange(targetPos, targetPos);
          break;
        case 'b':
          e.preventDefault();
          const prevWord = value.lastIndexOf(' ', selectionStart - 2);
          const prevLine = value.lastIndexOf('\n', selectionStart - 2);
          const targetPosB = Math.max(
            prevWord === -1 ? 0 : prevWord + 1,
            prevLine === -1 ? 0 : prevLine + 1
          );
          target.setSelectionRange(targetPosB, targetPosB);
          break;
      }
    }

    if (autoCommentNextLine && e.key === 'Enter') {
      const textBeforeCursor = value.substring(0, selectionStart);
      const linesBeforeCursor = textBeforeCursor.split('\n');
      const currentLine = linesBeforeCursor[linesBeforeCursor.length - 1];
      
      const match = currentLine.match(/^(\s*(?:>|-|\*|\d+\.)\s+)/);
      
      if (match) {
        e.preventDefault();
        const prefix = match[1];
        
        if (currentLine === prefix.trimEnd() || currentLine === prefix) {
          const newValue = value.substring(0, selectionStart - prefix.length) + '\n' + value.substring(selectionStart);
          onChange(newValue);
          window.setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = selectionStart - prefix.length + 1;
              textareaRef.current.selectionEnd = selectionStart - prefix.length + 1;
            } else {
              target.selectionStart = selectionStart - prefix.length + 1;
              target.selectionEnd = selectionStart - prefix.length + 1;
            }
          }, 0);
        } else {
          const newValue = value.substring(0, selectionStart) + '\n' + prefix + value.substring(selectionStart);
          onChange(newValue);
          window.setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = selectionStart + 1 + prefix.length;
              textareaRef.current.selectionEnd = selectionStart + 1 + prefix.length;
            } else {
              target.selectionStart = selectionStart + 1 + prefix.length;
              target.selectionEnd = selectionStart + 1 + prefix.length;
            }
          }, 0);
        }
      }
    }
  };

  return { handleKeyDown };
}
