
import React, { useState, useEffect } from 'react';
import { analyzeMedia } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const AnalysisSection: React.FC = () => {
  const [media, setMedia] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState('Perform a thorough audit analysis of this document. Check for calculation errors, tax compliance issues, and key financial summaries in Bengali.');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const MAX_FILE_SIZE_MB = 20;

  // Simulate progress steps for better UX
  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setProgress(10);
      setStatusMessage('Reading document data...');
      
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 40) {
            setStatusMessage('Uploading to AI Engine...');
            return prev + 2;
          }
          if (prev < 75) {
            setStatusMessage('Senior CA Advisor is scanning for compliance...');
            return prev + 1;
          }
          if (prev < 95) {
            setStatusMessage('Generating final audit report...');
            return prev + 0.5;
          }
          return prev;
        });
      }, 200);
    } else {
      setProgress(0);
      setStatusMessage('');
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setResult(null);
    
    if (file) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`ফাইলটি অনেক বড়! দয়া করে ${MAX_FILE_SIZE_MB}MB এর নিচের ফাইল আপলোড করুন।`);
        e.target.value = '';
        return;
      }

      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadstart = () => {
        setIsAnalyzing(true); // Temporarily show loading during read
        setProgress(5);
        setStatusMessage('Reading file from disk...');
      };
      reader.onload = () => {
        setMedia(reader.result as string);
        setIsAnalyzing(false);
        setProgress(0);
        setStatusMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!media) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    
    try {
      const output = await analyzeMedia(media, prompt, mimeType);
      setResult(output || "No analysis generated.");
      setProgress(100);
      setStatusMessage('Analysis complete!');
    } catch (err: any) {
      console.error(err);
      setError("Audit failed. The file might be corrupted or the AI service is currently overloaded. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <span className="text-3xl">🔍</span> Document Smart Audit
          </h2>
          <p className="text-slate-500 text-sm">
            Upload images of Balance Sheets, Profit & Loss statements, or Bank Audit logs. Gemini 3 Pro will identify discrepancies and compliance risks.
          </p>

          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group relative ${
            error ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-blue-400'
          }`}>
            <input 
              type="file" 
              onChange={handleFileUpload} 
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*,video/*"
              disabled={isAnalyzing}
            />
            {media ? (
              <div className="space-y-4">
                {mimeType.startsWith('image') ? (
                  <img src={media} alt="Upload" className="max-h-48 mx-auto rounded-lg shadow-sm border border-white" />
                ) : (
                  <div className="h-48 flex items-center justify-center bg-slate-100 rounded-lg text-slate-400">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <p className="text-xs font-bold text-blue-600">File attached! Click or drag to replace.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl group-hover:scale-110 transition-transform">📂</div>
                <p className="text-sm font-bold text-slate-700">Drop files or click to upload</p>
                <p className="text-xs text-slate-400">Supports JPG, PNG, WEBP, and MP4 (up to {MAX_FILE_SIZE_MB}MB)</p>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Audit Focus Instructions</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isAnalyzing}
              className="w-full p-4 border rounded-2xl h-24 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50 resize-y"
            />
          </div>

          <div className="space-y-4">
            <button
              onClick={startAnalysis}
              disabled={!media || isAnalyzing}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-3 ${
                !media || isAnalyzing ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                "Start Financial Analysis"
              )}
            </button>

            {isAnalyzing && (
              <div className="space-y-2 animate-in fade-in duration-500">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                  <span>{statusMessage}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Audit Report (Bengali)</h3>
          {result && (
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase">Analysis Successful</span>
              <button 
                onClick={() => { window.print(); }}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                PDF
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 p-6 overflow-y-auto prose prose-slate max-w-none">
          {isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-100 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">📋</div>
              </div>
              <div className="space-y-2">
                <p className="font-extrabold text-slate-800 text-lg">Senior CA Advisor is Working</p>
                <p className="text-sm text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                  We are identifying tax discrepancies and cross-referencing GST compliance rules.
                </p>
              </div>
            </div>
          ) : result ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ReactMarkdown 
                components={{
                  table: ({node, ...props}) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-slate-300 border border-slate-300 rounded-lg" {...props} /></div>,
                  thead: ({node, ...props}) => <thead className="bg-slate-100" {...props} />,
                  th: ({node, ...props}) => <th className="px-4 py-2 text-left font-bold border text-xs" {...props} />,
                  td: ({node, ...props}) => <td className="px-4 py-2 border text-xs" {...props} />,
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20">
              <div className="text-6xl opacity-20 mb-4">📝</div>
              <p>Detailed audit report will appear here after analysis.</p>
            </div>
          )}
        </div>
        
        {!isAnalyzing && result && (
          <div className="p-4 bg-green-50 border-t border-green-100 flex items-center justify-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Audit Completed Successfully</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisSection;
