
import React from 'react';
import { Recommendation } from '../types';

interface Props {
  recommendation: Recommendation;
}

const RecommendationCard: React.FC<Props> = ({ recommendation }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Quick Win': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Strategic Improvement': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Long-Term Enhancement': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High': return 'text-rose-600 font-bold';
      case 'Medium': return 'text-orange-500 font-semibold';
      case 'Low': return 'text-slate-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-4 mb-2">
        <h4 className="font-semibold text-slate-800 flex-1">{recommendation.action}</h4>
        <span className={`text-xs px-2.5 py-1 rounded-full border ${getPriorityColor(recommendation.priority)}`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
        {recommendation.rationale}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Impact:</span>
        <span className={`text-xs uppercase tracking-wider ${getImpactColor(recommendation.impact)}`}>
          {recommendation.impact}
        </span>
      </div>
    </div>
  );
};

export default RecommendationCard;
