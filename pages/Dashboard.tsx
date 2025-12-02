import React, { useState, useRef, useEffect } from 'react';
import { Upload, RefreshCw, BrainCircuit, Download, Plus, Save, Trash2, PlayCircle, FileText, ArrowRight, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Dataset, AnalysisResult, ChartType, ChartConfig, SavedReport, CorrelationNode } from '../types';
import { parseCSV, parseExcel, analyzeDataset, getCorrelationMatrix } from '../services/dataService';
import { generateAIInsights } from '../services/geminiService';
import { ChartGenerator } from '../components/ChartGenerator';
import { CorrelationHeatmap } from '../components/CorrelationHeatmap';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6', '#f59e0b'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AnalysisResult | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationNode[]>([]);
  const [recentReports, setRecentReports] = useState<SavedReport[]>([]);
  
  // Charts Workspace
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  
  // Chart Creator State
  const [selectedX, setSelectedX] = useState<string>('');
  const [selectedY, setSelectedY] = useState<string>('count');
  const [chartType, setChartType] = useState<ChartType>(ChartType.BAR);
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Load recent reports on mount
  useEffect(() => {
    const saved = localStorage.getItem('dig_reports');
    if (saved) {
      const parsed = JSON.parse(saved) as SavedReport[];
      // Sort by date desc and take top 3
      setRecentReports(parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3));
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setDataset(null);
    setInsights(null);
    setCharts([]);

    try {
      let data: any[] = [];
      if (file.name.endsWith('.csv')) {
        data = await parseCSV(file);
      } else if (file.name.match(/\.xlsx?$/)) {
        data = await parseExcel(file);
      } else {
        alert("Unsupported file type");
        setLoading(false);
        return;
      }

      data = data.filter(row => Object.values(row).some(v => v !== null && v !== ''));
      
      const stats = analyzeDataset(data);
      const newDataset: Dataset = {
        name: file.name,
        rows: data,
        columns: stats.map(s => s.name),
        stats: stats,
        uploadDate: new Date().toISOString()
      };

      setDataset(newDataset);
      
      // Defaults
      const catCol = stats.find(s => s.type === 'categorical')?.name || stats[0]?.name;
      const numCol = stats.find(s => s.type === 'numeric')?.name || 'count';
      setSelectedX(catCol);
      setSelectedY('count');

      // Correlations
      const numCols = stats.filter(s => s.type === 'numeric').map(s => s.name);
      if (numCols.length > 1) {
        setCorrelationData(getCorrelationMatrix(data, numCols));
      }

      // Add default charts automatically
      const initialCharts: ChartConfig[] = [
        {
          id: 'default-1',
          type: ChartType.BAR,
          xColumn: catCol,
          yColumn: 'count',
          color: COLORS[0],
          title: `Distribution of ${catCol}`
        }
      ];
      if (numCol !== 'count' && numCols.length > 0) {
        initialCharts.push({
          id: 'default-2',
          type: ChartType.SCATTER,
          xColumn: numCols[0],
          yColumn: numCols[1] || numCols[0],
          color: COLORS[1],
          title: `${numCols[0]} vs ${numCols[1] || numCols[0]}`
        });
      }
      setCharts(initialCharts);

      // AI Analysis
      runAIAnalysis(newDataset);

    } catch (err) {
      console.error(err);
      alert("Error parsing file");
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async (ds: Dataset) => {
    setAnalyzing(true);
    try {
      const result = await generateAIInsights(ds.name, ds.stats, ds.rows);
      setInsights(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const addChart = () => {
    if (!dataset) return;
    const newChart: ChartConfig = {
      id: Date.now().toString(),
      type: chartType,
      xColumn: selectedX,
      yColumn: selectedY,
      color: COLORS[charts.length % COLORS.length],
      title: `${selectedY === 'count' ? 'Count' : selectedY} by ${selectedX}`
    };
    setCharts([...charts, newChart]);
  };

  const removeChart = (id: string) => {
    setCharts(charts.filter(c => c.id !== id));
  };

  const saveReport = () => {
    if (!dataset || !insights) return;
    const report: SavedReport = {
      id: Date.now().toString(),
      name: `Analysis of ${dataset.name}`,
      date: new Date().toISOString(),
      datasetName: dataset.name,
      insights,
      chartConfigs: charts
    };
    
    const saved = JSON.parse(localStorage.getItem('dig_reports') || '[]');
    localStorage.setItem('dig_reports', JSON.stringify([report, ...saved]));
    alert('Report saved successfully!');
    // Update local state to show it immediately if they go back
    const updated = [report, ...saved].sort((a: SavedReport, b: SavedReport) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentReports(updated.slice(0, 3));
    navigate('/reports');
  };

  const exportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, {
      backgroundColor: '#0f172a',
      scale: 2 
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Report_${dataset?.name}.pdf`);
  };

  const numericCols = dataset?.stats.filter(s => s.type === 'numeric') || [];
  const categoricalCols = dataset?.stats.filter(s => s.type !== 'numeric') || [];

  // ----------------------------------------------------------------------
  // VIEW: NO DATASET LOADED (HOME DASHBOARD)
  // ----------------------------------------------------------------------
  if (!dataset) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name} 👋</h1>
          <p className="text-slate-400">Here's what's happening with your data today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-dashed border-2 border-indigo-500/30 bg-indigo-900/10 hover:bg-indigo-900/20 transition-all cursor-pointer group relative overflow-hidden animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex flex-col items-center justify-center py-12 relative z-10">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-600/30 group-hover:scale-110 transition-transform duration-300">
                  {loading ? <RefreshCw className="animate-spin text-white" size={32} /> : <Upload className="text-white" size={32} />}
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Start New Analysis</h3>
                <p className="text-slate-400 mb-8 text-center max-w-sm">
                  Upload your CSV or Excel file to automatically generate insights, charts, and reports.
                </p>
                <input 
                  type="file" 
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileUpload}
                  className="hidden" 
                  id="file-upload" 
                />
                <label 
                  htmlFor="file-upload" 
                  className="bg-white text-indigo-900 hover:bg-indigo-50 px-8 py-3 rounded-xl cursor-pointer transition-colors font-bold text-lg shadow-lg"
                >
                  Browse Files
                </label>
              </div>
            </Card>

            {/* Video Tutorial */}
            <div className="animate-slide-up animate-delay-200">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <PlayCircle className="text-indigo-400" /> 
                Video Tutorial: Getting Started
              </h3>
              <div className="aspect-video rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-black relative group">
                {/* Simulated Video Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                   <div className="text-center">
                     <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4 mx-auto group-hover:bg-indigo-600 transition-colors cursor-pointer">
                        <PlayCircle size={32} className="text-white" />
                     </div>
                     <p className="text-slate-400 font-medium">Watch: How to visualize data in 2 minutes</p>
                   </div>
                </div>
                {/* If you had a real video, you would embed iframe here */}
                {/* <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Tutorial" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe> */}
              </div>
            </div>
          </div>

          {/* Sidebar Area: Recent Reports */}
          <div className="lg:col-span-1 space-y-6 animate-slide-up animate-delay-100">
             <Card title="Recent Saved Reports" className="h-full">
               {recentReports.length > 0 ? (
                 <div className="space-y-4">
                   {recentReports.map(report => (
                     <div key={report.id} className="p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-indigo-500/50 transition-colors group">
                       <div className="flex justify-between items-start mb-2">
                         <div className="bg-indigo-500/10 p-1.5 rounded text-indigo-400">
                           <FileText size={16} />
                         </div>
                         <span className="text-xs text-slate-500">{new Date(report.date).toLocaleDateString()}</span>
                       </div>
                       <h4 className="font-semibold text-slate-200 mb-1 line-clamp-1">{report.name}</h4>
                       <p className="text-xs text-slate-400 mb-3">{report.datasetName}</p>
                       <Link to="/reports">
                         <Button size="sm" variant="secondary" fullWidth className="text-xs">
                           View Report <ArrowRight size={12} className="ml-1" />
                         </Button>
                       </Link>
                     </div>
                   ))}
                   <Link to="/reports" className="block text-center text-sm text-indigo-400 hover:text-indigo-300 mt-4">
                     View All Reports
                   </Link>
                 </div>
               ) : (
                 <div className="text-center py-8 text-slate-500">
                   <Clock size={32} className="mx-auto mb-3 opacity-30" />
                   <p>No reports saved yet.</p>
                   <p className="text-xs mt-1">Your analysis history will appear here.</p>
                 </div>
               )}
             </Card>

             <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-none">
               <div className="flex items-center gap-3 mb-3">
                 <div className="bg-white/10 p-2 rounded-lg">
                   <BrainCircuit size={20} className="text-white" />
                 </div>
                 <h3 className="font-bold text-white">Pro Tip</h3>
               </div>
               <p className="text-sm text-indigo-100 leading-relaxed opacity-90">
                 Did you know? You can select multiple columns in the Chart Builder to compare trends across different categories instantly.
               </p>
             </Card>
          </div>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: DATASET ANALYZED
  // ----------------------------------------------------------------------
  return (
    <div className="space-y-8 animate-fade-in" ref={dashboardRef}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <button onClick={() => setDataset(null)} className="text-sm text-indigo-400 hover:text-indigo-300 mb-2 flex items-center gap-1">
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">{dataset.name}</h1>
          <p className="text-slate-400">Analysis & Visualization Workspace</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveReport} variant="secondary">
            <Save size={18} className="mr-2" /> Save Report
          </Button>
          <Button onClick={exportPDF} variant="primary">
            <Download size={18} className="mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        <Card className="bg-gradient-to-br from-indigo-900/30 to-slate-800/30 border-indigo-500/20">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Total Rows</div>
          <div className="text-2xl font-bold text-white">{dataset.rows.length.toLocaleString()}</div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/30 to-slate-800/30 border-purple-500/20">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Columns</div>
          <div className="text-2xl font-bold text-white">{dataset.columns.length}</div>
        </Card>
        <Card className="bg-gradient-to-br from-pink-900/30 to-slate-800/30 border-pink-500/20">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Numeric</div>
          <div className="text-2xl font-bold text-white">{numericCols.length}</div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-800/30 border-emerald-500/20">
          <div className="text-slate-400 text-xs font-medium uppercase mb-1">Categorical</div>
          <div className="text-2xl font-bold text-white">{categoricalCols.length}</div>
        </Card>
      </div>

      <Card 
        title="AI Executive Summary" 
        className="border-indigo-500/30 shadow-lg shadow-indigo-900/10 animate-slide-up animate-delay-100"
        action={analyzing && <span className="flex items-center text-xs text-indigo-400"><BrainCircuit size={14} className="mr-1 animate-pulse" /> Generating Insights...</span>}
      >
        {insights ? (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <p className="text-slate-200 leading-relaxed text-sm">
                {insights.executiveSummary}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-emerald-400 font-semibold mb-3 text-sm uppercase tracking-wide">Key Findings</h4>
                <ul className="space-y-2">
                  {insights.keyFindings.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-blue-400 font-semibold mb-3 text-sm uppercase tracking-wide">Suggested Actions</h4>
                <ul className="space-y-2">
                  {insights.suggestedActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
            <div className="h-32 flex flex-col items-center justify-center text-slate-500 gap-2">
              <BrainCircuit size={24} className={analyzing ? "animate-pulse" : ""} />
              <p>{analyzing ? "AI is analyzing your data..." : "Analysis ready."}</p>
            </div>
        )}
      </Card>

      {/* Chart Creator */}
      <Card title="Chart Builder" className="overflow-visible animate-slide-up animate-delay-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Chart Type</label>
            <select 
              value={chartType}
              onChange={(e) => setChartType(e.target.value as ChartType)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value={ChartType.BAR}>Bar Chart</option>
              <option value={ChartType.LINE}>Line Chart</option>
              <option value={ChartType.AREA}>Area Chart</option>
              <option value={ChartType.PIE}>Pie Chart</option>
              <option value={ChartType.SCATTER}>Scatter Plot</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">X Axis</label>
            <select 
              value={selectedX} 
              onChange={(e) => setSelectedX(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {dataset.columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Y Axis</label>
            <select 
              value={selectedY} 
              onChange={(e) => setSelectedY(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="count">Count (Frequency)</option>
              {numericCols.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <Button onClick={addChart} className="w-full">
            <Plus size={16} className="mr-2" /> Add Chart
          </Button>
        </div>
      </Card>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up animate-delay-300">
        {charts.map((chart) => (
          <Card key={chart.id} className="relative group hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-center mb-4 pl-2">
                <h3 className="font-semibold text-slate-200">{chart.title}</h3>
                <button 
                  onClick={() => removeChart(chart.id)}
                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <ChartGenerator 
                data={dataset.rows}
                xColumn={chart.xColumn}
                yColumn={chart.yColumn}
                type={chart.type}
                color={chart.color}
              />
          </Card>
        ))}
      </div>

      {/* Correlation Matrix */}
      {correlationData.length > 0 && (
        <Card title="Correlation Heatmap" className="animate-slide-up">
          <CorrelationHeatmap 
            data={correlationData} 
            columns={numericCols.map(c => c.name)} 
          />
        </Card>
      )}

      {/* Data Preview */}
      <Card title="Data Preview (First 10 Rows)" className="overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-slate-700 bg-slate-800/50">
                <tr>
                  {dataset.columns.map(col => (
                    <th key={col} className="px-4 py-3 font-medium text-slate-400">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dataset.rows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    {dataset.columns.map(col => (
                      <td key={`${idx}-${col}`} className="px-4 py-3 text-slate-300">
                        {String(row[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
};