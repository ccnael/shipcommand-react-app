
import React from "react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, Check, AlertTriangle, X } from "lucide-react";
import { suiteletUrl } from "@/lib/constants";

interface ProcessingResultsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  results: {
    success: string[];
    failed: string[];
  };
  fulfillmentIds?: string[];
}

const ProcessingResults: React.FC<ProcessingResultsProps> = ({
  open,
  onOpenChange,
  results,
  fulfillmentIds = [],
}) => {
  // Don't show this dialog when it's not open, when there are no results, or when there are fulfillmentIds
  if (!open || (results.success.length === 0 && results.failed.length === 0) || fulfillmentIds.length > 0) {
    return null;
  }

  const hasSuccess = results.success.length > 0;
  const hasFailures = results.failed.length > 0;
  const icon = hasFailures ? <AlertTriangle className="h-4 w-4" /> : <Check className="h-4 w-4 text-green-600" />;
  
  const alertStyle = hasFailures
    ? "border-destructive/50 text-destructive dark:border-destructive" 
    : "bg-green-50 border-green-200 text-green-800";
  
  const buttonStyle = hasFailures 
    ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    : "bg-green-600 text-white hover:bg-green-700"; 
  
  const handleViewResults = () => {
    window.open(`${suiteletUrl}&mode=viewResult&ids=${fulfillmentIds.join(',')}`, '_blank');
  };

  return (
    <Alert 
      className={`fixed top-4 left-1/2 -translate-x-1/2 max-w-md animate-fade-in shadow-lg border ${alertStyle} z-[60]`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1 h-6 w-6 rounded-full p-0"
        onClick={() => onOpenChange(false)}
      >
        <X className="h-4 w-4" />
      </Button>

      <AlertTitle className="flex items-center gap-2">
        {icon}
        {hasFailures ? "Processing Complete with Errors" : "Fulfillment Complete"}
      </AlertTitle>
      <AlertDescription className="mt-2">
        {hasSuccess && (
          <div className="mb-2 text-sm">
            {results.success.length === 1 
              ? "Successfully processed 1 order" 
              : `Successfully processed ${results.success.length} orders`}
          </div>
        )}
        
        {hasFailures && (
          <div className="mb-2 text-sm">
            {results.failed.length === 1
              ? "Failed to process 1 order"
              : `Failed to process ${results.failed.length} orders`}
          </div>
        )}
        
        <div className="flex justify-end items-center mt-3">
          <Button 
            size="sm" 
            className={`${buttonStyle}`}
            onClick={handleViewResults}
            disabled={fulfillmentIds.length === 0}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View Results
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ProcessingResults;
