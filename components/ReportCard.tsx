
import React from 'react';
import { WasteReport, WasteSeverity } from '../types';
import { Calendar, MapPin, AlertCircle, CheckCircle, Package } from 'lucide-react';

const severityColors: Record<WasteSeverity, string> = {
  [WasteSeverity.LOW]: 'bg-blue-100 text-blue-700',
  [WasteSeverity.MEDIUM]: 'bg-yellow-100 text-yellow-700',
  [WasteSeverity.HIGH]: 'bg-orange-100 text-orange-700',
  [WasteSeverity.CRITICAL]: 'bg-red-100 text-red-700',
};

const ReportCard: React.FC<{ report: WasteReport }> = ({ report }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6">
      {report.imageUrl && (
        <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
          <img src={report.imageUrl} alt="Waste" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${severityColors[report.analysis?.severity || WasteSeverity.LOW]}`}>
              {report.analysis?.severity || 'PENDING'}
            </span>
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(report.timestamp).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Report ID: {report.id.slice(-6).toUpperCase()}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            {report.analysis?.type.replace('_', ' ') || 'New Complaint'}
          </h3>
          <p className="text-slate-600 text-sm mt-1">{report.userDescription}</p>
        </div>

        {report.analysis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Est. Volume</p>
                <p className="text-sm text-slate-700 font-medium">{report.analysis.estimatedVolume}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Recommended Action</p>
                <p className="text-sm text-slate-700 font-medium">{report.analysis.actionRequired}</p>
              </div>
            </div>
          </div>
        )}

        {report.location && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            Coordinates: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportCard;
