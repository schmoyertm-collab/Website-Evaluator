
import React, { useState } from 'react';
import { EvaluationResult, CategoryResult, Priority, LocalCompetitor } from '../types';
import RecommendationCard from './RecommendationCard';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

interface Props {
  result: EvaluationResult;
  isAnalyzingIndustry: boolean;
  isAnalyzingLocal: boolean;
  onAnalyzeIndustry: () => void;
  onFindLocal: (location: string) => void;
}

const ResultsDashboard: React.FC<Props> = ({ result, isAnalyzingIndustry, isAnalyzingLocal, onAnalyzeIndustry, onFindLocal }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'competition' | 'sources' | 'json'>('overview');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [locationInput, setLocationInput] = useState('');

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  const chartData = result.categories.map(c => ({
    name: c.name,
    score: c.score,
    weight: c.weight
  }));

  const allRecommendations = result.categories.flatMap(c => c.recommendations);
  const filteredRecommendations = filterPriority === 'All' 
    ? allRecommendations 
    : allRecommendations.filter(r => r.priority === filterPriority);

  const hasCompetition = !!result.competitiveAnalysis;
  const hasLocal = !!result.competitiveAnalysis?.localCompetitors && result.competitiveAnalysis.localCompetitors.length > 0;

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      onFindLocal(locationInput.trim());
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Summary Header */}
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl -z-0"></div>
        <div className="relative w-48 h-48 flex-shrink-0 z-10">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[{ value: result.overallScore }, { value: 100 - result.overallScore }]}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={80}
                paddingAngle={0}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill="#3b82f6" stroke="none" />
                <Cell fill="#f1f5f9" stroke="none" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-slate-800 tracking-tighter">{result.overallScore}</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Audit Score</span>
          </div>
        </div>
        <div className="flex-1 z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
              Analysis Complete
            </span>
            <span className="text-sm text-slate-400 font-medium truncate max-w-[200px]">
              {result.url}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
              {result.industry}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4 leading-tight">Expert Audit Summary</h2>
          <p className="text-slate-600 leading-relaxed text-lg italic bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mb-6">
            "{result.humanSummary}"
          </p>

          <div className="flex flex-wrap gap-4">
            {!hasCompetition && !isAnalyzingIndustry && (
              <button 
                onClick={onAnalyzeIndustry}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 transition-all hover:scale-[1.02] active:scale-95"
              >
                <i className="fa-solid fa-chess-knight"></i>
                Market Gap Scan
              </button>
            )}

            {isAnalyzingIndustry && (
              <div className="flex items-center gap-3 text-orange-600 font-bold text-sm animate-pulse">
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                Scanning market gaps...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl w-fit overflow-x-auto max-w-full">
          {(['overview', 'recommendations', 'competition', 'sources', 'json'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap transition-all ${
                activeTab === tab ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'competition' ? 'Competition' : tab}
            </button>
          ))}
        </div>
        
        {activeTab === 'recommendations' && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mr-2">Filter Priority:</span>
            {(['All', 'Quick Win', 'Strategic Improvement', 'Long-Term Enhancement'] as const).map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                  filterPriority === p ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <i className="fa-solid fa-chart-line text-sm"></i>
                </div>
                Performance Metrics
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="score" radius={[0, 6, 6, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <i className="fa-solid fa-bolt-lightning text-sm"></i>
                </div>
                Key Audit Findings
              </h3>
              <div className="space-y-6">
                {result.categories.map((cat, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{cat.name}</h4>
                    </div>
                    <div className="space-y-2 pl-3.5 border-l border-slate-100">
                      {cat.findings.map((finding, fIdx) => (
                        <p key={fIdx} className="text-sm text-slate-600 flex items-start gap-3 py-1">
                          <i className="fa-solid fa-check text-[10px] text-emerald-500 mt-1"></i>
                          {finding}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecommendations.map((rec, idx) => (
              <RecommendationCard key={idx} recommendation={rec} />
            ))}
          </div>
        )}

        {activeTab === 'competition' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Local Search Tool */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl text-white">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-black mb-2 flex items-center gap-3">
                    <i className="fa-solid fa-location-crosshairs text-blue-400"></i>
                    Local Opportunity Scanner
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Enter a city or zip code to find competitors in the <strong>{result.industry}</strong> industry with weak online presences.
                  </p>
                </div>
                <form onSubmit={handleLocalSearch} className="flex-1 w-full max-w-md relative">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="City, State or Zip Code"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 pr-32"
                  />
                  <button
                    type="submit"
                    disabled={isAnalyzingLocal || !locationInput.trim()}
                    className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white px-6 rounded-xl font-bold transition-all flex items-center gap-2"
                  >
                    {isAnalyzingLocal ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
                    Scan
                  </button>
                </form>
              </div>

              {hasLocal && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.competitiveAnalysis?.localCompetitors?.map((comp, idx) => (
                    <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:bg-slate-700/50 transition-all border-l-4" style={{ borderColor: comp.score < 50 ? '#ef4444' : comp.score < 80 ? '#f59e0b' : '#10b981' }}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-slate-100 truncate flex-1 pr-2">{comp.name}</h4>
                        <div className="text-center">
                          <span className={`text-xl font-black ${comp.score < 50 ? 'text-rose-400' : comp.score < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {comp.score}
                          </span>
                          <p className="text-[8px] uppercase font-black text-slate-500 leading-none">Score</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                        {comp.description}
                      </p>
                      <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1">
                        Visit Site <i className="fa-solid fa-arrow-up-right-from-square text-[8px]"></i>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasCompetition ? (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Market Gap Insights</h3>
                    <p className="text-slate-500 max-w-2xl">{result.competitiveAnalysis?.summary}</p>
                  </div>
                  <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border border-orange-100">
                    High Growth
                  </div>
                </div>

                <div className="mb-8">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Under-Performing Competitors</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.competitiveAnalysis?.identifiedCompetitors.map((name, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-700">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.competitiveAnalysis?.gaps.map((gap, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-orange-200 transition-all flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-widest text-orange-500">{gap.subject}</span>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                          <span className="text-[10px] font-bold uppercase text-rose-500 tracking-wider">Competitor Weakness</span>
                          <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed">{gap.competitorWeakness}</p>
                        </div>
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                          <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Strategic Advantage</span>
                          <p className="text-sm text-slate-700 font-medium mt-1 leading-relaxed">{gap.ourAdvantage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              !isAnalyzingIndustry && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-center">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 text-3xl mb-6">
                    <i className="fa-solid fa-chess-knight"></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Widen Your Competitive Analysis</h3>
                  <p className="text-slate-500 max-w-md mx-auto mb-8">
                    Let AI identify industry competitors that you can outperform to capture market share.
                  </p>
                  <button 
                    onClick={onAnalyzeIndustry}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center gap-3"
                  >
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Run Industry Gap Analysis
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                <i className="fa-solid fa-link text-sm"></i>
              </div>
              Research & Evidence Sources
            </h3>
            {result.sources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-50 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                        {source.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate">{source.uri}</span>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square text-slate-300 group-hover:text-blue-500 text-xs ml-4"></i>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 italic">No external grounding sources identified.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'json' && (
          <div className="bg-slate-900 p-8 rounded-3xl overflow-hidden shadow-2xl">
            <pre className="text-emerald-400 font-mono text-xs overflow-x-auto p-6 bg-slate-800/50 rounded-2xl border border-slate-800 scrollbar-thin scrollbar-thumb-slate-700">
              {JSON.stringify(JSON.parse(result.rawJson), null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDashboard;
