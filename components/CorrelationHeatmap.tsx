import React from 'react';
import { CorrelationNode } from '../types';

interface CorrelationHeatmapProps {
  data: CorrelationNode[];
  columns: string[];
}

export const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ data, columns }) => {
  const getColor = (value: number) => {
    // -1 (red) to 0 (gray) to 1 (blue)
    const opacity = Math.abs(value);
    if (value > 0) return `rgba(99, 102, 241, ${opacity})`; // Indigo
    return `rgba(244, 63, 94, ${opacity})`; // Rose
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full divide-y divide-slate-700">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-800/50">
                Variables
              </th>
              {columns.map(col => (
                <th key={col} className="px-3 py-2 text-left text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-800/50">
                  <div className="w-16 truncate" title={col}>{col}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {columns.map(rowCol => (
              <tr key={rowCol}>
                <td className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800/30 whitespace-nowrap">
                  <div className="w-24 truncate" title={rowCol}>{rowCol}</div>
                </td>
                {columns.map(colCol => {
                  const node = data.find(n => n.x === rowCol && n.y === colCol);
                  const val = node ? node.value : 0;
                  return (
                    <td 
                      key={`${rowCol}-${colCol}`} 
                      className="px-1 py-1 text-center"
                      title={`${rowCol} vs ${colCol}: ${val.toFixed(2)}`}
                    >
                      <div 
                        className="w-full h-8 flex items-center justify-center rounded text-[10px] text-white font-medium transition-transform hover:scale-110"
                        style={{ backgroundColor: getColor(val) }}
                      >
                        {val.toFixed(1)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};