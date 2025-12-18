import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extracts text from a PDF file entirely in the browser so we can avoid uploading large binaries.
 */
export async function extractTextFromPdf(file) {
  const data = await file.arrayBuffer();
  // pdfjs returns a loading task; await its .promise to access the full document
  const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
  let combinedText = '';

  for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
    const page = await pdfDocument.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => ('str' in item ? item.str : '')).join(' ');
    combinedText += `${pageText}\n`;
  }

  return combinedText.trim();
}
