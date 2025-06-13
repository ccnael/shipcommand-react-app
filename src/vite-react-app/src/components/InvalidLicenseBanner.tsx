
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const InvalidLicenseBanner: React.FC = () => {
  return (
    <Alert 
      className="fixed top-0 left-0 w-full bg-gradient-to-r from-red-50 to-red-100 border-red-200 border-t-0 z-[100] px-4 py-4 shadow-md"
    >
      <div className="container mx-auto flex items-start gap-4">
        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertTitle className="text-red-800 font-semibold text-lg mb-1.5">Invalid License</AlertTitle>
          <AlertDescription className="text-sm text-red-700 leading-relaxed">
            <p dangerouslySetInnerHTML={{ 
              __html: "Oops! It looks like your license has expired.<br/>Don't worry, renewing it is quick and easy! Please contact our customer support team at <a href=\"mailto:sales@saloraerp.com\" class=\"text-red-800 font-medium underline hover:text-red-900 transition-colors\">sales@saloraerp.com</a> to renew your license and keep your experience seamless and uninterrupted." 
            }} />
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default InvalidLicenseBanner;
