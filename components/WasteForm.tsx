
import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, Trash2, Loader2 } from 'lucide-react';
import { WasteReport } from '../types';

interface WasteFormProps {
  onReport: (report: Partial<WasteReport>, file?: File) => Promise<void>;
  isSubmitting: boolean;
}

const WasteForm: React.FC<WasteFormProps> = ({ onReport, isSubmitting }) => {
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_DESC_LENGTH = 500;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        alert("Could not get location. Please enable location permissions.");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic sanitization
    const cleanDescription = description.trim().substring(0, MAX_DESC_LENGTH);

    if (!cleanDescription && !selectedFile) {
      alert("Please provide at least a photo or a description.");
      return;
    }

    await onReport({
      userDescription: cleanDescription,
      location: location ? { ...location } : undefined,
    }, selectedFile || undefined);

    // Reset form
    setDescription('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setLocation(null);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100 transition-all">
      <div className="space-y-6">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-emerald-600" />
            Report Waste Concern
          </h2>
          <p className="text-sm text-slate-500 mt-1">Submit details for AI-powered priority routing.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Upload Photo</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative cursor-pointer border-2 border-dashed rounded-xl p-6 transition-all group
              ${previewUrl ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50'}
            `}
          >
            {previewUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-inner bg-slate-100">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-white text-sm font-medium">Click to change</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                <div className="p-3 rounded-full bg-emerald-100 text-emerald-600 group-hover:scale-110 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Capture or upload photo</p>
                  <p className="text-xs text-slate-400 mt-1">Max 10MB (JPG/PNG)</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-700">Details</label>
            <span className={`text-[10px] ${description.length >= MAX_DESC_LENGTH ? 'text-red-500' : 'text-slate-400'}`}>
              {description.length}/{MAX_DESC_LENGTH}
            </span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={MAX_DESC_LENGTH}
            placeholder="Describe the issue (type of waste, accessibility, etc.)"
            className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none shadow-inner"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={handleGetLocation}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full sm:w-auto border
              ${location 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}
            `}
          >
            {isGettingLocation ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {location ? 'Location Captured' : 'Tag Location'}
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all w-full shadow-lg shadow-emerald-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Report Waste
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default WasteForm;
