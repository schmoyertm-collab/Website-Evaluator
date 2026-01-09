
export type Priority = 'Quick Win' | 'Strategic Improvement' | 'Long-Term Enhancement';

export interface Recommendation {
  action: string;
  priority: Priority;
  rationale: string;
  impact: 'High' | 'Medium' | 'Low';
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface CompetitorGap {
  subject: string;
  competitorWeakness: string;
  ourAdvantage: string;
}

export interface LocalCompetitor {
  name: string;
  url: string;
  score: number;
  description: string;
}

export interface CompetitiveAnalysis {
  summary: string;
  identifiedCompetitors: string[];
  gaps: CompetitorGap[];
  localCompetitors?: LocalCompetitor[];
}

export interface CategoryResult {
  name: string;
  score: number;
  weight: number;
  findings: string[];
  recommendations: Recommendation[];
}

export interface EvaluationResult {
  url: string;
  overallScore: number;
  humanSummary: string;
  categories: CategoryResult[];
  rawJson: string;
  sources: GroundingSource[];
  competitiveAnalysis?: CompetitiveAnalysis;
  industry?: string;
}

export enum EvaluationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
