
import { suiteletUrl, isProd, pdfOnly } from "@/lib/constants";

// Helper function to determine print type based on shipping method
export function getPrintType(shipMethod: string) {
  let printType;
  if (shipMethod.includes('fedex')) {
    printType = 'fedexshippinglabel';
  } else if (shipMethod.includes('ups')) {
    printType = 'upsshippinglabel';
  } else if (shipMethod.includes('usps')) {
    printType = 'uspsshippinglabel';
  }
  return printType;
}

// Helper function to generate label URL
export function generateLabelUrl(id: string, fflId: string, printType: string) {
  return `https://${document.domain}/app/accounting/print/hotprint.nl?regular=T&sethotprinter=T&id=${id}&label=UPS%20Shipping%20Labels&printtype=${printType}&trantype=itemship&auxtrans=${fflId}`;
}

// Helper function to fetch label data
export async function fetchLabelData(url: string) {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error("Error fetching label data:", error);
    return null;
  }
}

// Function to handle label printing
export async function handleLabelPrinting(orderId: string, orderNumber: string, fflId: string, shipMethod: string) {
  if (!pdfOnly && shipMethod && isProd) {
    const printType = getPrintType(shipMethod);
    if (printType) {
      const labelUrl = generateLabelUrl(orderId, fflId, printType);
      console.log(`Sending first request to label URL: ${labelUrl}`);
      
      // First request
      await fetchLabelData(labelUrl);
      
      // Second request - this one provides the needed response
      console.log(`Sending second request to label URL: ${labelUrl}`);
      let labelData = await fetchLabelData(labelUrl);
      console.log("Response from second label request:", labelData);

      if (shipMethod.includes('ups')) {
        labelData = labelData.replace(/\^POI/g, '')
      }
      labelData = labelData.replace('^XA', '^XA^PR5,5,5') // Printing speed
      
      // Execute the additional fetch request to generate the ZPL file
      if (labelData) {
        console.log(`Generating ZPL file for order ID: ${orderId}, fflId: ${fflId}`);
        try {
          const response = await fetch(`${suiteletUrl}?mode=generateZPLFile&id=${orderId}&tranId=${orderNumber}&printType=${printType}`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json'
            },
            body: labelData
          });
          
          const result = await response.text();
          console.log("ZPL file generation response:", result);
        } catch (error) {
          console.error("Error generating ZPL file:", error);
        }
      }
    }
  }
}
