
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

interface PlaceholderChartProps {
  isLoading: boolean;
  title?: string;
}

const PlaceholderChart: React.FC<PlaceholderChartProps> = ({ 
  isLoading, 
  title = "TBD" 
}) => {
  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            {/* <HoverCard>
              <HoverCardTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">TBD</h4>
                  <p className="text-sm text-muted-foreground">
                    lorem ipsum lorem ipsum lorem ipsum
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[180px] w-full flex flex-col items-center justify-center bg-muted/10 rounded-lg border border-dashed border-muted">
          <p className="text-sm text-muted-foreground">TBD</p>
          <p className="text-xs text-muted-foreground/70 mt-2">
            lorem ipsum lorem ipsum lorem ipsum
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaceholderChart;
