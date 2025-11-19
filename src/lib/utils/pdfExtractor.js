/**
 * PDF Text Extraction Utility using pdf.js
 * Extracts text content from PDF files in the browser
 */

/**
 * Extract text from a PDF file with proper formatting
 * @param {File} file - The PDF file object
 * @returns {Promise<string>} - The extracted text content with preserved structure
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker path for pdf.js
    if (typeof window !== 'undefined') {
      const version = pdfjsLib.version || '5.4.394';
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from each page with preserved structure
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Group text items by their Y position (lines)
      const linesMap = new Map();
      
      textContent.items.forEach((item) => {
        if (!item.str || item.str.trim() === '') return;
        
        // Get Y position (bottom of text item)
        const y = item.transform ? Math.round(item.transform[5] * 100) / 100 : 0;
        const x = item.transform ? Math.round(item.transform[4] * 100) / 100 : 0;
        
        // Group by Y position (items on the same line have similar Y values)
        // Use a key that groups items within 3 pixels of each other
        const yKey = Math.round(y / 3) * 3;
        
        if (!linesMap.has(yKey)) {
          linesMap.set(yKey, []);
        }
        
        linesMap.get(yKey).push({ text: item.str, x: x });
      });
      
      // Sort lines by Y position (top to bottom, so reverse)
      const sortedLines = Array.from(linesMap.entries())
        .sort((a, b) => b[0] - a[0]) // Higher Y = higher on page = first
        .map(([y, items]) => {
          // Sort items in line by X position (left to right)
          items.sort((a, b) => a.x - b.x);
          // Join items in the line with spaces
          return items.map(item => item.text).join(' ');
        });
      
      // Join lines with newline characters
      let pageText = sortedLines.join('\n');
      
      // Clean up: remove excessive spaces but preserve line breaks
      pageText = pageText
        .replace(/[ \t]+/g, ' ') // Multiple spaces/tabs to single space
        .replace(/\n{3,}/g, '\n\n') // More than 2 newlines to 2
        .trim();
      
      fullText += pageText + '\n\n';
    }
    
    // Final cleanup
    fullText = fullText
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim();
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

/**
 * Get page count from PDF
 * @param {File} file - The PDF file object
 * @returns {Promise<number>} - Number of pages
 */
export const getPDFPageCount = async (file) => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    if (typeof window !== 'undefined') {
      const version = pdfjsLib.version || '5.4.394';
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    return pdf.numPages;
  } catch (error) {
    console.error('Error getting PDF page count:', error);
    throw new Error(`Failed to get PDF page count: ${error.message}`);
  }
};
