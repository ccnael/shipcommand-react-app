
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, X } from "lucide-react";
import { suiteletUrl } from "@/lib/constants";

interface FulfillmentBannerProps {
  fulfillmentIds: string[];
  onClose: () => void;
}

const FulfillmentBanner: React.FC<FulfillmentBannerProps> = ({
  fulfillmentIds,
  onClose,
}) => {
  const handleViewResults = () => {
    const idsParam = fulfillmentIds.join(',');
    window.open(`${suiteletUrl}&mode=viewResult&ids=${idsParam}`, '_blank');
  };

  if (fulfillmentIds.length === 0) {
    return null;
  }

  return (
    <Alert 
      className="fixed top-4 right-4 max-w-md shadow-lg border z-[60] bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700 pr-10"
    >
      <Button
        size="sm"
        variant="ghost"
        className="absolute right-2 top-2 h-8 w-8 p-0 rounded-full"
        onClick={onClose}
      >
        <X className="h-4 w-4 text-gray-500 dark:text-gray-300" />
        <span className="sr-only">Close</span>
      </Button>

      <AlertTitle className="flex items-center gap-2">
        <Check className="h-4 w-4 text-green-500 dark:text-green-300" />
        Fulfillment Complete
      </AlertTitle>

      <AlertDescription className="mt-2 text-foreground">
        <div className="mb-2 text-sm">
          Successfully fulfilled {fulfillmentIds.length} order{fulfillmentIds.length !== 1 ? 's' : ''}
        </div>
        
        <div className="flex justify-end items-center mt-3">
          <Button 
            size="sm" 
            variant="default" 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleViewResults}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Results
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default FulfillmentBanner;
