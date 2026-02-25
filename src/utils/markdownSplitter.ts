export interface Chunk {
  content: string;
  startLine: number;
  endLine: number;
  type: 'text' | 'code' | 'math' | 'list' | 'table' | 'header';
}

export const splitMarkdownIntoChunks = (markdown: string): Chunk[] => {
  const lines = markdown.split('\n');
  const chunks: Chunk[] = [];
  let currentLines: string[] = [];
  let startLine = 0;
  
  // State flags
  let inCodeBlock = false;
  let inMathBlock = false;
  let inList = false;
  let inTable = false;

  const flush = (type: Chunk['type'], endLineOffset: number = 0) => {
    if (currentLines.length === 0) return;
    chunks.push({
      content: currentLines.join('\n'),
      startLine: startLine,
      endLine: startLine + currentLines.length - 1
    });
    currentLines = [];
    startLine = startLine + currentLines.length + endLineOffset; // This logic is slightly wrong, need to track absolute line index
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 1. Code Blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        currentLines.push(line);
        chunks.push({
          content: currentLines.join('\n'),
          startLine: startLine,
          endLine: i,
          type: 'code'
        });
        currentLines = [];
        startLine = i + 1;
        inCodeBlock = false;
        continue;
      } else {
        // Start of code block
        // If we were accumulating text, flush it first
        if (currentLines.length > 0) {
          chunks.push({
            content: currentLines.join('\n'),
            startLine: startLine,
            endLine: i - 1,
            type: 'text'
          });
          currentLines = [];
          startLine = i;
        }
        inCodeBlock = true;
        currentLines.push(line);
        continue;
      }
    }
    if (inCodeBlock) {
      currentLines.push(line);
      continue;
    }

    // 2. Math Blocks ($$)
    // Check for explicit block math markers
    if (trimmed === '$$' || (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2)) {
      if (inMathBlock) {
        // End of math block
        currentLines.push(line);
        chunks.push({
          content: currentLines.join('\n'),
          startLine: startLine,
          endLine: i,
          type: 'math'
        });
        currentLines = [];
        startLine = i + 1;
        inMathBlock = false;
        continue;
      } else {
        // Start of math block
        // Flush previous text
        if (currentLines.length > 0) {
          chunks.push({
            content: currentLines.join('\n'),
            startLine: startLine,
            endLine: i - 1,
            type: 'text'
          });
          currentLines = [];
          startLine = i;
        }
        
        // If it's a single line block math like $$ x=y $$
        if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) {
           chunks.push({
            content: line,
            startLine: i,
            endLine: i,
            type: 'math'
          });
          startLine = i + 1;
          continue;
        }

        inMathBlock = true;
        currentLines.push(line);
        continue;
      }
    }
    if (inMathBlock) {
      currentLines.push(line);
      continue;
    }

    // 3. Headers
    if (trimmed.startsWith('#')) {
      // Flush previous text
      if (currentLines.length > 0) {
        chunks.push({
          content: currentLines.join('\n'),
          startLine: startLine,
          endLine: i - 1,
          type: 'text'
        });
        currentLines = [];
        startLine = i;
      }
      
      // Headers are their own chunk usually
      chunks.push({
        content: line,
        startLine: i,
        endLine: i,
        type: 'header'
      });
      startLine = i + 1;
      continue;
    }

    // 4. Lists
    // Simple heuristic: starts with *, -, +, or 1.
    const isListLine = trimmed.match(/^(\s*[-*+]|\s*\d+\.)\s/);
    if (isListLine) {
      if (!inList) {
        // Start of list
         if (currentLines.length > 0) {
          chunks.push({
            content: currentLines.join('\n'),
            startLine: startLine,
            endLine: i - 1,
            type: 'text'
          });
          currentLines = [];
          startLine = i;
        }
        inList = true;
      }
      currentLines.push(line);
      continue;
    } else if (inList) {
      // If we are in a list, but this line is NOT a list item
      // It might be a continuation of the list item (indented) or end of list
      // If empty line, usually end of list or spacer. 
      // If not indented and not empty, end of list.
      if (trimmed === '') {
        currentLines.push(line); // Keep empty lines in list chunk for now
        continue;
      }
      if (!line.startsWith('  ') && !line.startsWith('\t')) {
        // End of list
        chunks.push({
          content: currentLines.join('\n'),
          startLine: startLine,
          endLine: i - 1,
          type: 'list'
        });
        currentLines = [];
        startLine = i;
        inList = false;
        // Fall through to process this line as normal text
      } else {
        // Continuation
        currentLines.push(line);
        continue;
      }
    }

    // 5. Tables
    // Starts with |
    if (trimmed.startsWith('|')) {
      if (!inTable) {
         if (currentLines.length > 0) {
          chunks.push({
            content: currentLines.join('\n'),
            startLine: startLine,
            endLine: i - 1,
            type: 'text'
          });
          currentLines = [];
          startLine = i;
        }
        inTable = true;
      }
      currentLines.push(line);
      continue;
    } else if (inTable) {
      if (!trimmed.startsWith('|')) {
        chunks.push({
          content: currentLines.join('\n'),
          startLine: startLine,
          endLine: i - 1,
          type: 'table'
        });
        currentLines = [];
        startLine = i;
        inTable = false;
        // Fall through
      } else {
        currentLines.push(line);
        continue;
      }
    }

    // 6. Paragraph Breaks (Empty Lines)
    if (trimmed === '') {
      if (currentLines.length > 0) {
        chunks.push({
          content: currentLines.join('\n'),
          startLine: startLine,
          endLine: i - 1,
          type: 'text'
        });
        currentLines = [];
        startLine = i;
      }
      // We skip empty lines in chunks? Or add them as spacers?
      // Better to include them in the *next* chunk or *previous*?
      // Let's just skip creating a chunk for purely empty lines, but advance startLine
      startLine = i + 1;
      continue;
    }

    // Default: Accumulate text
    currentLines.push(line);
  }

  // Flush remaining
  if (currentLines.length > 0) {
    chunks.push({
      content: currentLines.join('\n'),
      startLine: startLine,
      endLine: lines.length - 1,
      type: inList ? 'list' : inTable ? 'table' : 'text'
    });
  }

  return chunks;
};
