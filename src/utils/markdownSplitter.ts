export interface Chunk {
  content: string;
  startLine: number;
  endLine: number;
}

export const splitMarkdownIntoChunks = (markdown: string): Chunk[] => {
  const lines = markdown.split('\n');
  const chunks: Chunk[] = [];
  let currentChunkLines: string[] = [];
  let currentChunkStartLine = 0;
  
  let inCodeBlock = false;
  let inMathBlock = false;
  // Track list/blockquote context to avoid splitting inside them if possible
  let inList = false;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    // Toggle code block status
    if (trimmedLine.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }
    
    // Toggle math block status
    if (trimmedLine === '$$' || (trimmedLine.startsWith('$$') && trimmedLine.endsWith('$$') && trimmedLine.length > 2)) {
       if (trimmedLine === '$$') inMathBlock = !inMathBlock;
    }

    // Check list/blockquote context (simple heuristic)
    // If line starts with -, *, +, or 1., it's a list item.
    // If line starts with >, it's a blockquote.
    // If line is empty, we are likely out of list/blockquote (unless indented, but let's keep it simple)
    if (!inCodeBlock && !inMathBlock) {
      if (trimmedLine.match(/^(\s*[-*+]|\s*\d+\.)\s/)) inList = true;
      else if (trimmedLine.startsWith('>')) inBlockquote = true;
      else if (trimmedLine === '') {
        inList = false;
        inBlockquote = false;
      }
    }

    // Check for split condition BEFORE adding the line (for headers)
    const isHeader = !inCodeBlock && !inMathBlock && trimmedLine.startsWith('#');
    // Increase min chunk size to 50 to reduce fragmentation
    const isChunkLargeEnough = currentChunkLines.length > 50; 
    
    // Safe to split?
    const isSafeSplitPoint = !inCodeBlock && !inMathBlock && !inList && !inBlockquote;

    if (isHeader && isChunkLargeEnough && isSafeSplitPoint) {
      chunks.push({
        content: currentChunkLines.join('\n'),
        startLine: currentChunkStartLine,
        endLine: i - 1
      });
      currentChunkLines = [];
      currentChunkStartLine = i;
    }

    currentChunkLines.push(line);

    // Check for split condition AFTER adding the line (for paragraph breaks)
    const isParagraphBreak = !inCodeBlock && !inMathBlock && trimmedLine === '';
    
    if (isParagraphBreak && isChunkLargeEnough && isSafeSplitPoint) {
      chunks.push({
        content: currentChunkLines.join('\n'),
        startLine: currentChunkStartLine,
        endLine: i
      });
      currentChunkLines = [];
      currentChunkStartLine = i + 1;
    }
  }

  if (currentChunkLines.length > 0) {
    chunks.push({
      content: currentChunkLines.join('\n'),
      startLine: currentChunkStartLine,
      endLine: lines.length - 1
    });
  }

  return chunks;
};
