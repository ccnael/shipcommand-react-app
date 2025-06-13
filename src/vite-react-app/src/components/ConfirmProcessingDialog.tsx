
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader } from "lucide-react";

interface ConfirmProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  orderCount: number;
  isProcessing: boolean;
  isMainline: boolean;
}

const ConfirmProcessingDialog: React.FC<ConfirmProcessingDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  orderCount,
  isProcessing,
  isMainline
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Selection</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to fulfill {orderCount}{" "}
            {isMainline
              ? `order${orderCount !== 1 ? "s" : ""}`
              : `item${orderCount !== 1 ? "s" : ""}`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmProcessingDialog;
