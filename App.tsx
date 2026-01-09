import React, { useState, useEffect } from 'react';
import { WasteReport, WasteSeverity, WasteType } from './types';
import WasteForm from './components/WasteForm';
import ReportCard from './components/ReportCard';
import { analyzeWaste } from './services/geminiService';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { ShieldCheck, ListFilter, Map as MapIcon, Info, Trash2, Cloud, Check, RefreshCw, AlertTriangle, Database, ArrowUpRight } from 'lucide-react';

const App: React.FC = () => {
  const [reports, setReports] = useState<WasteReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'stats'>('feed');

  useEffect(() => {
    if (isSupabaseConfigured) {
      fetchReports();
    } else {
      setIsLoading(false);
      setErrorMsg("Database keys missing. Update your environment variables.");
    }
  }, []);

  const fetchReports = async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      if (data) setReports(data as WasteReport[]);
    } catch (e: any) {
      console.error("Failed to fetch reports:", e);
      setErrorMsg(e.message || "Could not sync with the database.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewReport = async (reportData: Partial<WasteReport>, file?: File) => {
    if (!isSupabaseConfigured) {
      alert("Database configuration missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      let b64 = '';
      if (file) {
        b64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      const analysis = await analyzeWaste(b64 || undefined, reportData.userDescription);

      const newReport: WasteReport = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        imageUrl: b64 || undefined,
        userDescription: reportData.userDescription || '',
        location: reportData.location,
        analysis: analysis,
        status: 'REPORTED'
      };

      const { error } = await supabase.from('reports').insert([newReport]);
      if (error) throw error;

      setReports(prev => [newReport, ...prev]);
    } catch (error: any) {
      console.error("Report failed:", error);
      alert(`Submission error: ${error.message || "Check your database table schema."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = {
    total: reports.length,
    critical: reports.filter(r => r.analysis?.severity === WasteSeverity.CRITICAL || r.analysis?.severity === WasteSeverity.HIGH).length,
    today: reports.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pb-24">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-200/50 transform -rotate-3">C</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              CleanCity<span className="text-emerald-600">AI</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {isSupabaseConfigured ? (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                <Cloud className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Live Sync</span>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100/50">
                <Database className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold uppercase tracking-wider">Configure DB</span>
              </div>
            )}
            <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-2">Smart Sanitation</h2>
                <p className="text-emerald-50/80 text-sm leading-relaxed mb-8">AI-driven prioritization for a cleaner, safer urban environment. Every report helps optimize municipal routes.</p>
                
                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/20">
                  <div className="space-y-1">
                    <p className="text-3xl font-black">{stats.total}</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-widest">Total</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black text-amber-300">{stats.critical}</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-widest">Critical</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-black">{stats.today}</p>
                    <p className="text-[10px] uppercase font-bold text-emerald-200 tracking-widest">Today</p>
                  </div>
                </div>
              </div>
            </div>

            <WasteForm onReport={handleNewReport} isSubmitting={isSubmitting} />

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-500">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Municipal Database</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Your project is connected to <span className="text-emerald-600 font-medium">fjgpcrczvfbdbgadygsr</span>. 
                  Ensure the <code className="bg-slate-50 px-1 rounded font-mono uppercase tracking-tighter">reports</code> table is active.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-2">
              <nav className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button 
                  onClick={() => setActiveTab('feed')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Live Feed
                </button>
                <button 
                  onClick={() => setActiveTab('stats')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'stats' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Insights
                </button>
              </nav>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={fetchReports} 
                  disabled={!isSupabaseConfigured || isLoading}
                  className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {activeTab === 'feed' ? (
              <div className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-48 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-pulse" />
                    ))}
                  </div>
                ) : errorMsg ? (
                  <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-slate-100 flex flex-col items-center">
                    <div className="p-4 bg-red-50 text-red-500 rounded-full mb-4">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-slate-900 font-bold">Sync Error</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-[300px]">{errorMsg}</p>
                    <button 
                      onClick={fetchReports}
                      className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-full transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : reports.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-16 text-center border-2 border-dashed border-slate-200">
                    <div className="p-5 bg-slate-50 w-fit mx-auto rounded-full mb-6 text-slate-300">
                      <ListFilter className="w-10 h-10" />
                    </div>
                    <h3 className="text-slate-900 font-bold text-lg">No active reports</h3>
                    <p className="text-slate-500 text-sm mt-2 max-w-[240px] mx-auto leading-relaxed">
                      {isSupabaseConfigured 
                        ? "The streets are looking clean. Use the form to submit a new observation." 
                        : "Connect your Supabase project to visualize real-time reporting activity."}
                    </p>
                  </div>
                ) : (
                  reports.map(report => (
                    <ReportCard key={report.id} report={report} />
                  ))
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-200 h-[600px] flex flex-col items-center justify-center shadow-sm">
                 <div className="p-6 bg-emerald-50 rounded-full mb-6">
                  <MapIcon className="w-14 h-14 text-emerald-600" />
                </div>
                <h3 className="text-slate-900 font-bold text-xl">Urban Heatmaps</h3>
                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                  Visualizing waste density across your city. This panel uses geolocation data to help sanitation crews optimize their daily routes.
                </p>
                <div className="mt-8 flex gap-3">
                  <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2">
                    Coming Soon <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {!isSupabaseConfigured && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-3rem)] max-w-md">
          <div className="bg-amber-900 text-white rounded-2xl p-5 shadow-2xl flex items-center gap-4 border border-amber-700">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-bold">Missing Supabase API Key</p>
              <p className="opacity-80 text-xs">Set <code className="bg-white/10 px-1 rounded">SUPABASE_ANON_KEY</code> to enable data persistence.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;