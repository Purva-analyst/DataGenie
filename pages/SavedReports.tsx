import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Calendar, Trash2, Eye } from 'lucide-react';
import { SavedReport } from '../types';

export const SavedReports: React.FC = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('dig_reports');
    if (saved) {
      setReports(JSON.parse(saved));
    }
  }, []);

  const deleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem('dig_reports', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Saved Reports</h1>
        <div className="text-slate-400">{reports.length} Reports Found</div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-slate-500">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No reports saved yet.</p>
            <p className="text-sm">Generate an analysis and save it to see it here.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="group hover:border-indigo-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-900/30 p-2 rounded-lg text-indigo-400">
                  <FileText size={24} />
                </div>
                <button 
                  onClick={() => deleteReport(report.id)}
                  className="text-slate-500 hover:text-red-400 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <h3 className="font-bold text-white text-lg mb-2 truncate">{report.name}</h3>
              <p className="text-slate-400 text-sm mb-4">Dataset: {report.datasetName}</p>
              
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                <Calendar size={12} />
                {new Date(report.date).toLocaleDateString()}
              </div>

              <div className="space-y-2 mb-4">
                 <p className="text-xs text-slate-400 line-clamp-3 bg-slate-900 p-2 rounded">
                   {report.insights.executiveSummary}
                 </p>
              </div>

              <Button fullWidth variant="secondary" className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-transparent">
                <Eye size={16} className="mr-2" /> View Details
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};