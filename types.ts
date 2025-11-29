export enum VerdictType {
  REAL = 'REAL',
  SUSPICIOUS = 'SUSPICIOUS',
  FAKE = 'FAKE',
  UNVERIFIED = 'UNVERIFIED'
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  imageUrl?: string;
  publishedAt: string;
  verdict: VerdictType;
  confidenceScore: number; // 0-100
  reasoning: string;
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

export interface GeminiConfig {
  apiKey: string;
}

// Navigation state
export type PageView = 'FEED' | 'VERIFY' | 'EDUCATION' | 'PROFILE';
