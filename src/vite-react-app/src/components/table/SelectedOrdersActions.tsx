
import React from "react";
import { Loader } from "lucide-react";

interface SelectedOrdersActionsProps {
  selectedCount: number;
  onSubmit: () => void;
  isProcessing: boolean;
  isDisabled?: boolean;
  isMainline?: boolean;
}

const SelectedOrdersActions: React.FC<SelectedOrdersActionsProps> = ({
  selectedCount,
  onSubmit,
  isProcessing,
  isDisabled = false,
  isMainline = false
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-muted/20 border-t px-4 py-2 text-sm flex items-center justify-between animate-slide-in z-10">
      <span className="font-medium">
        {selectedCount}{" "}
        {isMainline
          ? `order${selectedCount !== 1 ? "s" : ""}`
          : `item${selectedCount !== 1 ? "s" : ""}`}{" "}
        selected
      </span>
      <div className="flex items-center gap-2">
        {isProcessing ? (
          <span className="text-muted-foreground text-xs">
            Processing selected orders...
          </span>
        ) : isDisabled ? (
          <span className="text-muted-foreground text-xs">
            Action disabled due to invalid license
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            Use the Submit button above to process orders
          </span>
        )}
      </div>
    </div>
  );
};

export default SelectedOrdersActions;
