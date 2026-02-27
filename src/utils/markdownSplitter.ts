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
  
  let currentType: Chunk['type'] = 'text';

  const flush = (newStartLine: number) => {
    if (currentLines.length > 0) {
      chunks.push({
        content: currentLines.join('\n'),
        startLine: startLine,
        endLine: startLine + currentLines.length - 1,
        type: currentType
      });
      currentLines = [];
    }
    startLine = newStartLine;
  };

  let inCodeBlock = false;
  let inMathBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 1. Code Blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        currentLines.push(line);
        flush(i + 1);
        inCodeBlock = false;
        currentType = 'text';
        continue;
      } else {
        flush(i);
        inCodeBlock = true;
        currentType = 'code';
        currentLines.push(line);
        continue;
      }
    }
    if (inCodeBlock) {
      currentLines.push(line);
      continue;
    }

    // 2. Math Blocks ($$)
    if (trimmed === '$$' || (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2)) {
      if (inMathBlock) {
        currentLines.push(line);
        flush(i + 1);
        inMathBlock = false;
        currentType = 'text';
        continue;
      } else {
        flush(i);
        
        if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 2) {
           currentType = 'math';
           currentLines.push(line);
           flush(i + 1);
           currentType = 'text';
           continue;
        }

        inMathBlock = true;
        currentType = 'math';
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
      flush(i);
      currentType = 'header';
      currentLines.push(line);
      flush(i + 1);
      currentType = 'text';
      continue;
    }

    // 4. Lists
    const isListLine = trimmed.match(/^(\s*[-*+]|\s*\d+\.)\s/);
    if (isListLine) {
      if (currentType !== 'list') {
        flush(i);
        currentType = 'list';
      }
      currentLines.push(line);
      continue;
    } else if (currentType === 'list') {
      if (trimmed === '') {
        currentLines.push(line);
        continue;
      }
      if (!line.startsWith('  ') && !line.startsWith('\t')) {
        flush(i);
        currentType = 'text';
        // Fall through
      } else {
        currentLines.push(line);
        continue;
      }
    }

    // 5. Tables
    if (trimmed.startsWith('|')) {
      if (currentType !== 'table') {
        flush(i);
        currentType = 'table';
      }
      currentLines.push(line);
      continue;
    } else if (currentType === 'table') {
      if (!trimmed.startsWith('|')) {
        flush(i);
        currentType = 'text';
        // Fall through
      } else {
        currentLines.push(line);
        continue;
      }
    }

    // 6. Paragraph Breaks (Empty Lines) or too long text chunks
    if (currentType === 'text') {
      if (trimmed === '') {
        flush(i);
        currentLines.push(line);
        continue;
      }
      // Smaller chunks for better granularity (5 lines instead of 10)
      if (currentLines.length >= 5) {
        flush(i);
      }
    }

    // Default: Accumulate text
    if (currentType !== 'text') {
        flush(i);
        currentType = 'text';
    }
    currentLines.push(line);
  }

  flush(lines.length);

  return chunks;
};
