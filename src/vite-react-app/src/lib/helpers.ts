
// Helper functions for fetching and parsing data

// API endpoint - get from hidden input or fallback to example URL
export const getSuiteletUrl = (): string => {
  const suiteletUrlInput = document.getElementById('suiteletUrl') as HTMLInputElement;
  return suiteletUrlInput?.value ? `https://${document.domain}${decodeURIComponent(suiteletUrlInput.value)}` : "https://api.example.com/endpoint";
};

export const getDownloadPDFBooleanValue = () => {
  const downloadPDFValue = document.getElementById('downloadPDF') as HTMLInputElement;
  try {
    return JSON.parse(downloadPDFValue.value);
  } catch (e) {
    console.error("Error parsing downloadPDF:", e);
  }
  return false;
}

export const getPDFOnlyBooleanValue = () => {
  const pdfOnlyValue = document.getElementById('pdfOnly') as HTMLInputElement;
  try {
    return JSON.parse(pdfOnlyValue.value);
  } catch (e) {
    console.error("Error parsing pdfOnly:", e);
  }
  return false;
}

export const getItemsPerPageValue = () => {
  const itemsPerPage = document.getElementById('itemsPerPage') as HTMLInputElement;
  try {
    return JSON.parse(itemsPerPage.value);
  } catch (e) {
    console.error("Error parsing pdfOnly:", e);
  }
  return 10;
}

export const getIsValidLicenseValue = () => {
  const isValidLicense = document.getElementById('isValidLicense') as HTMLInputElement;
  try {
    return JSON.parse(isValidLicense.value);
  } catch (e) {
    console.error("Error parsing isValidLicense:", e);
  }
  return true;
}

export const getIsPickPackShipEnabled = () => {
  const isPickPackShipEnabled = document.getElementById('isPickPackShipEnabled') as HTMLInputElement;
  try {
    return JSON.parse(isPickPackShipEnabled.value);
  } catch (e) {
    console.error("Error parsing isPickPackShipEnabled:", e);
  }
  return true;
}