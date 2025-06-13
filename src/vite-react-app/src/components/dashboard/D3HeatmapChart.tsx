
import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

interface D3HeatmapChartProps {
  data: { day: string; hour: string; value: number }[];
  isLoading: boolean;
  dateRange?: DateRange;
}

const D3HeatmapChart: React.FC<D3HeatmapChartProps> = ({ data, isLoading, dateRange }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isLoading || !chartRef.current || !data || data.length === 0) return;
    
    // Clear any previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    const renderChart = () => {
      if (!chartRef.current) return;
      
      // Chart dimensions
      const margin = { top: 20, right: 20, bottom: 35, left: 40 };
      const width = chartRef.current.clientWidth - margin.left - margin.right;
      const height = 320 - margin.top - margin.bottom;
      
      // Create unique lists of days and hours
      const days = Array.from(new Set(data.map(d => d.day)));
      const hours = Array.from(new Set(data.map(d => d.hour)));
      
      // X and Y scales
      const xScale = d3.scaleBand()
        .domain(hours)
        .range([0, width])
        .padding(0.05);
      
      const yScale = d3.scaleBand()
        .domain(days)
        .range([0, height])
        .padding(0.05);
      
      // Color scale
      const colorScale = d3.scaleSequential(d3.interpolatePurples)
        .domain([0, d3.max(data, d => d.value) || 10]);
      
      // Create SVG
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Create enhanced tooltip
      const tooltip = d3.select(chartRef.current)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background', 'rgba(255, 255, 255, 0.95)')
        .style('border', '1px solid #ddd')
        .style('border-radius', '4px')
        .style('padding', '10px')
        .style('pointer-events', 'none')
        .style('box-shadow', '0 4px 8px rgba(0,0,0,0.15)')
        .style('z-index', '1000')
        .style('font-size', '12px')
        .style('transition', 'opacity 0.2s');
      
      // Create heatmap cells
      svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.hour) || 0)
        .attr('y', d => yScale(d.day) || 0)
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .style('fill', d => colorScale(d.value))
        .style('rx', 3)
        .style('ry', 3)
        .style('stroke-width', 1)
        .style('stroke', 'white')
        .style('cursor', 'pointer')
        .on('mouseover', function(event: MouseEvent, d: { day: string; hour: string; value: number }) {
          const intensity = d.value < 3 ? 'Low' : d.value < 7 ? 'Medium' : 'High';
          const color = d.value < 3 ? '#10b981' : d.value < 7 ? '#f59e0b' : '#ef4444';
          
          // Enhance cell appearance on hover
          d3.select(this)
            .style('stroke', '#000')
            .style('stroke-width', 2)
            .style('opacity', 0.8);
          
          // Enhanced tooltip with styled content
          tooltip
            .style('opacity', 1)
            .html(`
              <div style="font-weight: bold; margin-bottom: 5px;">Activity Details</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Day:</span>
                <span style="font-weight: 600">${d.day}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Time:</span>
                <span style="font-weight: 600">${d.hour}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Value:</span>
                <span style="font-weight: 600">${d.value.toFixed(1)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 5px; padding-top: 5px; border-top: 1px solid #eee">
                <span>Intensity:</span>
                <span style="color: ${color}; font-weight: 600">${intensity}</span>
              </div>
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px');
          
          // Show toast notification on hover
          toast({
            title: `${d.day} at ${d.hour}`,
            description: `Activity value: ${d.value.toFixed(1)}`,
            duration: 3000,
          });
        })
        .on('mouseout', function() {
          // Restore cell appearance
          d3.select(this)
            .style('stroke', 'white')
            .style('stroke-width', 1)
            .style('opacity', 1);
          
          // Hide tooltip
          tooltip.style('opacity', 0);
        });
      
      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        // .attr('transform', 'rotate(-45)');
      
      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(yScale));
      
      // Add legend
      const legendWidth = 20;
      const legendHeight = height;
      const legendScale = d3.scaleSequential(d3.interpolatePurples)
        .domain([0, d3.max(data, d => d.value) || 10]);
      
      const legend = svg.append('g')
        .attr('transform', `translate(${width + 10}, 0)`);
      
      const legendGradient = legend.append('defs')
        .append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '100%')
        .attr('x2', '0%')
        .attr('y2', '0%');
      
      // Add color stops to gradient
      const stops = 10;
      for (let i = 0; i <= stops; i++) {
        const offset = i / stops;
        const value = i * ((d3.max(data, d => d.value) || 10) / stops);
        legendGradient.append('stop')
          .attr('offset', `${offset * 100}%`)
          .attr('stop-color', legendScale(value));
      }
      
      // Draw legend rectangle using gradient
      legend.append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)');
      
      // Add legend axis - Fixed by providing the required parameter
      const legendAxis = d3.axisRight(d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) || 10])
        .range([legendHeight, 0]))
        .ticks(5);
      
      legend.append('g')
        .attr('transform', `translate(${legendWidth},0)`)
        .call(legendAxis);
    };
    
    // Initial render
    renderChart();
    
    // Handle window resize
    const handleResize = () => {
      if (chartRef.current) {
        d3.select(chartRef.current).selectAll('*').remove();
        renderChart();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, isLoading, toast]);
  
  // If loading, show skeleton
  if (isLoading) {
    return (
      <Card className="border-none shadow-none">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">D3 Sample Heatmap (TBD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[180px] flex items-center justify-center">
            <Skeleton className="w-full h-full rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Date range display
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
    : "All time";
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">D3 Sample Heatmap (TBD)</CardTitle>
          <span className="text-xs text-muted-foreground">{dateRangeText}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[180px] w-full" />
      </CardContent>
    </Card>
  );
};

export default D3HeatmapChart;
