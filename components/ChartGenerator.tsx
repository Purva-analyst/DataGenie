import React, { useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { ColumnStats, DataRow, ChartType } from '../types';

interface ChartGeneratorProps {
  data: DataRow[];
  xColumn: string;
  yColumn: string; // If 'count', we aggregate
  type: ChartType;
  color?: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6'];

export const ChartGenerator: React.FC<ChartGeneratorProps> = ({ data, xColumn, yColumn, type, color = '#6366f1' }) => {
  
  const processedData = useMemo(() => {
    // If we want a simple count of X categories
    if (yColumn === 'count') {
      const counts: Record<string, number> = {};
      data.forEach(row => {
        const val = String(row[xColumn]);
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 20); // Top 20 to avoid overcrowding
    }

    // Otherwise, plot X vs Y
    // For Bar/Line/Area, we usually want unique X. If duplicates exist, we should aggregate.
    // Simplifying: Just take first 50 rows for Scatter, or aggregate for others.
    
    // Simple aggregation (Average Y for each X)
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    
    data.forEach(row => {
      const xVal = String(row[xColumn]);
      const yVal = Number(row[yColumn]);
      if (!isNaN(yVal)) {
        sums[xVal] = (sums[xVal] || 0) + yVal;
        counts[xVal] = (counts[xVal] || 0) + 1;
      }
    });

    return Object.keys(sums).map(key => ({
      name: key,
      value: sums[key] / counts[key]
    })).slice(0, 30); // Limit
    
  }, [data, xColumn, yColumn]);

  const renderChart = () => {
    switch (type) {
      case ChartType.BAR:
        return (
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case ChartType.LINE:
        return (
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            />
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={{r: 4, fill: color}} activeDot={{ r: 8 }} />
          </LineChart>
        );
      case ChartType.AREA:
        return (
          <AreaChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
            />
            <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.3} />
          </AreaChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
          </PieChart>
        );
      case ChartType.SCATTER:
         // Scatter needs raw data usually, processedData is aggregated. 
         // Let's use raw data for scatter
         const scatterData = data.slice(0, 100).map(row => ({
           x: Number(row[xColumn]) || 0,
           y: Number(row[yColumn]) || 0
         }));
         return (
          <ScatterChart>
             <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
             <XAxis type="number" dataKey="x" name={xColumn} stroke="#94a3b8" />
             <YAxis type="number" dataKey="y" name={yColumn} stroke="#94a3b8" />
             <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }} />
             <Scatter name="Data" data={scatterData} fill={color} />
          </ScatterChart>
         )
      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      {renderChart() || <div />}
    </ResponsiveContainer>
  );
};