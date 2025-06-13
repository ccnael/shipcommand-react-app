
import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Loader } from "lucide-react";

interface CycleTimeChartProps {
  data: { name: string; hours: number }[];
  isLoading: boolean;
}

const CycleTimeChart: React.FC<CycleTimeChartProps> = ({ data, isLoading }) => {
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2" style={{ marginBottom: 50 }}>
        <CardTitle className="text-sm">Order Fulfillment Cycle Time (TBD)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[180px]">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={data} 
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted/30 [&_.recharts-cartesian-grid-vertical_line]:stroke-transparent"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#3b82f6" stroke="transparent" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CycleTimeChart;
