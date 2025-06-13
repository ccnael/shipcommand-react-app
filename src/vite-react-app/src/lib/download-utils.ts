
import { suiteletUrl } from "@/lib/constants";

/**
 * Opens a new window to preview PDFs for the given fulfillment IDs
 */
export function printPreviewPDF(ids: string[]) {
  if (ids.length === 0) return;
  window.open(`${suiteletUrl}&mode=printPreviewPDF&ids=${ids.join(',')}`);
}

/**
 * Opens a new window to download ZPL files for the given fulfillment IDs
 */
export function downloadZPLFile(ids: string[]) {
  if (ids.length === 0) return;
  window.open(`${suiteletUrl}&mode=downloadZPLFile&ids=${ids.join(',')}`);
}

/**
 * Opens a new window to download PDF files for the given fulfillment IDs
 */
export function downloadPDFFile(ids: string[]) {
  if (ids.length === 0) return;
  window.open(`${suiteletUrl}&mode=downloadPDFFile&ids=${ids.join(',')}`);
}
