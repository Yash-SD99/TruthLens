
export enum VerdictType {
  REAL = 'REAL',
  SUSPICIOUS = 'SUSPICIOUS',
  FAKE = 'FAKE',
  UNVERIFIED = 'UNVERIFIED'
}

export interface AgentAnalysis {
  sourceScore: number; // 0-100
  sourceNotes: string; // "Reuters is a Tier 1 wire service..."
  contentScore: number; // 0-100 (100 = neutral/objective, 0 = sensational/biased)
  contentNotes: string; // "Headline uses emotionally charged language..."
  evidence: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  imageUrl?: string;
  publishedAt: string;
  
  // Final Verdict
  verdict: VerdictType;
  confidenceScore: number; // 0-100
  
  // Explainability (Agent Outputs)
  agentAnalysis: AgentAnalysis;
  topics: string[];
}

export interface VerificationResult {
  verdict: VerdictType;
  confidence: number;
  summary: string;
  evidence: string[];
  sources: { title: string; uri: string }[];
  analysisType: 'TEXT' | 'IMAGE';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  preferences: {
    topics: string[];
    strictMode: boolean;
  };
  history: VerificationResult[];
}

export type PageView = 'FEED' | 'VERIFY' | 'EDUCATION' | 'PROFILE';
