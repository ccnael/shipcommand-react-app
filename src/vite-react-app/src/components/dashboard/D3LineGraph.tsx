
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

interface LineDataPoint {
  date: string;
  value: number;
}

interface D3LineGraphProps {
  data: LineDataPoint[];
  isLoading: boolean;
  dateRange?: DateRange;
  title?: string;
}

const D3LineGraph: React.FC<D3LineGraphProps> = ({ 
  data, 
  isLoading, 
  dateRange,
  title = "Sample Line Graph (TBD)" 
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (isLoading || !chartRef.current || !data || data.length === 0) return;
    
    // Clear any previous chart
    d3.select(chartRef.current).selectAll('*').remove();
    
    const renderChart = () => {
      if (!chartRef.current) return;
      
      // Chart dimensions
      const margin = { top: 20, right: 30, bottom: 40, left: 50 };
      const width = chartRef.current.clientWidth - margin.left - margin.right;
      const height = 320 - margin.top - margin.bottom;
      
      // Parse dates
      const parseDate = d3.timeParse("%Y-%m-%d");
      const formattedData = data.map(d => ({
        date: parseDate(d.date) || new Date(), // Fallback to current date if parsing fails
        value: d.value
      }));
      
      // Sort data by date
      formattedData.sort((a, b) => a.date.getTime() - b.date.getTime());
      
      // Create scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(formattedData, d => d.date) as [Date, Date])
        .range([0, width]);
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(formattedData, d => d.value) || 10])
        .range([height, 0])
        .nice();
      
      // Create SVG
      const svg = d3.select(chartRef.current)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Add grid lines
      svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(
          d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat(() => '')
        )
        .attr('stroke-opacity', 0.1);
      
      svg.append('g')
        .attr('class', 'grid')
        .call(
          d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat(() => '')
        )
        .attr('stroke-opacity', 0.1);
      
      // Define line generator with proper type annotation
      const line = d3.line<{date: Date, value: number}>()
        .x(d => xScale(d.date))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
      
      // Add line path
      const path = svg.append('path')
        .datum(formattedData)
        .attr('fill', 'none')
        .attr('stroke', '#8b5cf6')
        .attr('stroke-width', 2.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('d', line);
      
      // Animate the line
      const pathLength = path.node()?.getTotalLength() || 0;
      path
        .attr('stroke-dasharray', pathLength)
        .attr('stroke-dashoffset', pathLength)
        .transition()
        .duration(1500)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
      
      // Add circles for data points
      const circles = svg.selectAll('.data-point')
        .data(formattedData)
        .enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('cx', d => xScale(d.date))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', '#8b5cf6')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .style('opacity', 0)
        .transition()
        .delay((_, i) => i * 150)
        .duration(500)
        .style('opacity', 1);
      
      // Create tooltip
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
      
      // Add tooltip interactions with proper type annotation
      svg.selectAll<SVGCircleElement, {date: Date, value: number}>('.data-point')
        .on('mouseover', function(event: MouseEvent, d: {date: Date, value: number}) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 6)
            .attr('stroke-width', 2);
          
          const dateFormatter = d3.timeFormat("%b %d, %Y");
          tooltip
            .style('opacity', 1)
            .html(`
              <div style="font-weight: bold; margin-bottom: 5px;">Point Details</div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Date:</span>
                <span style="font-weight: 600">${dateFormatter(d.date)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                <span>Value:</span>
                <span style="font-weight: 600">${d.value.toFixed(1)}</span>
              </div>
            `)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 28) + 'px');
          
          // Show toast notification on hover
          toast({
            title: "Data Point",
            description: `Date: ${dateFormatter(d.date)} - Value: ${d.value.toFixed(1)}`,
            duration: 3000,
          });
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4)
            .attr('stroke-width', 1.5);
          
          tooltip.style('opacity', 0);
        });
      
      // Add X axis
      svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .ticks(5)
          .tickFormat(d3.timeFormat("%b %d")))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        // .attr('transform', 'rotate(-45)');
      
      // Add Y axis
      svg.append('g')
        .call(d3.axisLeft(yScale));
      
      // Add axis labels
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${-margin.left + 15},${height/2}) rotate(-90)`)
        .style('font-size', '12px')
        .style('fill', '#64748b')
        .text('Activity');
      
      svg.append('text')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${width/2},${height + margin.bottom - 5})`)
        .style('font-size', '12px')
        .style('fill', '#64748b')
        .text('Date');
      
      // Add area beneath the line
      svg.append('path')
        .datum(formattedData)
        .attr('fill', 'url(#line-gradient)')
        .attr('opacity', 0.3)
        .attr('d', d3.area<{date: Date, value: number}>()
          .x(d => xScale(d.date))
          .y0(height)
          .y1(d => yScale(d.value))
          .curve(d3.curveMonotoneX)
        );
      
      // Add gradient for area
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'line-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 0)
        .attr('y2', height);
      
      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#8b5cf6');
      
      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#ffffff');
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
  
  // Date range display
  const dateRangeText = dateRange?.from && dateRange?.to
    ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
    : "All time";
  
  return (
    <Card className="border-none shadow-none">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <span className="text-xs text-muted-foreground">{dateRangeText}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="h-[180px] w-full" />
      </CardContent>
    </Card>
  );
};

export default D3LineGraph;
