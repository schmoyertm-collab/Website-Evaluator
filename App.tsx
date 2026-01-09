
import React, { useState } from 'react';
import { evaluateWebsite, analyzeIndustryGaps, findLocalCompetitors } from './services/geminiService';
import { EvaluationResult, EvaluationStatus } from './types';
import ResultsDashboard from './components/ResultsDashboard';

const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<EvaluationStatus>(EvaluationStatus.IDLE);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isAnalyzingIndustry, setIsAnalyzingIndustry] = useState(false);
  const [isAnalyzingLocal, setIsAnalyzingLocal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let sanitizedUrl = url.trim();
    if (!/^https?:\/\//i.test(sanitizedUrl)) {
      sanitizedUrl = `https://${sanitizedUrl}`;
    }

    setStatus(EvaluationStatus.LOADING);
    setError(null);
    setResult(null);

    try {
      const evaluation = await evaluateWebsite(sanitizedUrl);
      setResult(evaluation);
      setStatus(EvaluationStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during evaluation.");
      setStatus(EvaluationStatus.ERROR);
    }
  };

  const handleAnalyzeIndustry = async () => {
    if (!result || !result.url) return;
    setIsAnalyzingIndustry(true);
    try {
      const analysis = await analyzeIndustryGaps(result.url);
      setResult({
        ...result,
        competitiveAnalysis: {
          ...result.competitiveAnalysis,
          ...analysis
        }
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAnalyzingIndustry(false);
    }
  };

  const handleFindLocal = async (location: string) => {
    if (!result || !result.industry) return;
    setIsAnalyzingLocal(true);
    try {
      const localComps = await findLocalCompetitors(result.industry, location);
      setResult({
        ...result,
        competitiveAnalysis: {
          ...result.competitiveAnalysis,
          summary: result.competitiveAnalysis?.summary || `Local scan for ${result.industry} in ${location}.`,
          identifiedCompetitors: result.competitiveAnalysis?.identifiedCompetitors || [],
          gaps: result.competitiveAnalysis?.gaps || [],
          localCompetitors: localComps
        }
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAnalyzingLocal(false);
    }
  };

  const handleReset = () => {
    setStatus(EvaluationStatus.IDLE);
    setResult(null);
    setError(null);
    setUrl('');
    setIsAnalyzingIndustry(false);
    setIsAnalyzingLocal(false);
  };

  const loadingMessages = [
    "Analyzing core web vitals...",
    "Scanning SEO structure...",
    "Evaluating UX heuristics...",
    "Calculating conversion friction...",
    "Identifying industry context...",
    "Synthesizing results..."
  ];

  const [msgIndex, setMsgIndex] = React.useState(0);
  React.useEffect(() => {
    if (status === EvaluationStatus.LOADING) {
      const interval = setInterval(() => {
        setMsgIndex(prev => (prev + 1) % loadingMessages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
      {/* Navbar Style Header */}
      <nav className="flex items-center justify-between mb-12 py-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <i className="fa-solid fa-shield-halved text-white text-xl"></i>
          </div>
          <span className="text-2xl font-black text-slate-900 tracking-tighter">Audit<span className="text-blue-600">AI</span></span>
        </div>
        
        {status === EvaluationStatus.SUCCESS && (
          <button 
            onClick={handleReset}
            className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-plus-circle"></i> New Audit
          </button>
        )}
      </nav>

      {/* Main Container */}
      <main className="transition-all duration-700">
        {status === EvaluationStatus.IDLE && (
          <div className="text-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
              Professional Grade <span className="text-blue-600">Website Audits</span> & Opportunity Detection.
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12">
              Deep analysis for performance, SEO, and UX. Find local competitors you can outperform.
            </p>
          </div>
        )}

        {/* URL Input Form */}
        {(status === EvaluationStatus.IDLE || status === EvaluationStatus.LOADING || status === EvaluationStatus.ERROR) && (
          <div className={`max-w-2xl mx-auto mb-16 transition-all duration-500`}>
            <form onSubmit={handleSubmit} className="relative group">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter business website (e.g., example.com)"
                disabled={status === EvaluationStatus.LOADING}
                className="w-full bg-white border-2 border-slate-200 rounded-[2.5rem] px-8 py-6 text-lg shadow-2xl focus:outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-100 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed pr-40"
              />
              <button
                type="submit"
                disabled={status === EvaluationStatus.LOADING || !url}
                className="absolute right-3 top-3 bottom-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 rounded-[2rem] font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
              >
                {status === EvaluationStatus.LOADING ? (
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                )}
                {status === EvaluationStatus.LOADING ? 'Analyzing' : 'Audit Now'}
              </button>
            </form>
            
            {status === EvaluationStatus.LOADING && (
              <div className="mt-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <p className="text-blue-600 font-bold tracking-[0.2em] text-[10px] uppercase bg-blue-50 px-4 py-2 rounded-full mb-6">
                  {loadingMessages[msgIndex]}
                </p>
                <div className="w-full max-w-md bg-slate-100 h-1 rounded-full overflow-hidden relative">
                  <div className="bg-blue-600 h-full w-1/3 absolute animate-shimmer"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {status === EvaluationStatus.ERROR && (
          <div className="max-w-3xl mx-auto mb-12 p-8 bg-rose-50 border border-rose-100 rounded-3xl flex gap-6 items-center shadow-sm">
            <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-white"></i>
            </div>
            <div>
              <h3 className="font-bold text-rose-900 text-lg">Audit Interrupted</h3>
              <p className="text-rose-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Success View */}
        {status === EvaluationStatus.SUCCESS && result && (
          <ResultsDashboard 
            result={result} 
            onAnalyzeIndustry={handleAnalyzeIndustry}
            onFindLocal={handleFindLocal}
            isAnalyzingIndustry={isAnalyzingIndustry}
            isAnalyzingLocal={isAnalyzingLocal}
          />
        )}

        {/* Landing Content Info (Initial State) */}
        {status === EvaluationStatus.IDLE && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            {[
              { icon: 'fa-gauge-high', color: 'text-emerald-500', bg: 'bg-emerald-50', title: 'Deep Performance', text: 'Analyze Core Web Vitals for elite speed and visual stability.' },
              { icon: 'fa-location-dot', color: 'text-orange-500', bg: 'bg-orange-50', title: 'Local Advantage', text: 'Scan your city for competitors with poor mobile and SEO health.' },
              { icon: 'fa-magnifying-glass-chart', color: 'text-purple-500', bg: 'bg-purple-50', title: 'Gap Detection', text: 'Identify specific market opportunities where competition is weak.' }
            ].map((item, i) => (
              <div key={i} className="group p-8 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${item.icon}`}></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-24 text-center border-t border-slate-100 pt-12">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
          Powered by Gemini 3 Intelligence & Local Market Heuristics
        </p>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { left: -40%; width: 30%; }
          50% { left: 40%; width: 60%; }
          100% { left: 110%; width: 30%; }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default App;
