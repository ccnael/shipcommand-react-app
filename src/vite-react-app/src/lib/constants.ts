
// Constants for the application
import { mockupData } from './mockData';
import { 
  getSuiteletUrl, 
  getDownloadPDFBooleanValue,
  getPDFOnlyBooleanValue,
  getItemsPerPageValue,
  getIsValidLicenseValue,
  getIsPickPackShipEnabled
} from './helpers';

// Export the parsed data from hidden inputs with fallback to mockup data
export const suiteletUrl = getSuiteletUrl();
export const downloadPDF = getDownloadPDFBooleanValue();
export const pdfOnly = getPDFOnlyBooleanValue();
export const isProd = !document.domain.match(/-sb|tstdrv/g);
export const itemsPerPage = getItemsPerPageValue();
export const isValidLicense = getIsValidLicenseValue();
export const isPickPackShipEnabled = getIsPickPackShipEnabled();

// Re-export mockupData for usage elsewhere
export { mockupData };
