import { VerdictType } from './types';

export const VERDICT_COLORS = {
  [VerdictType.REAL]: 'bg-green-100 text-green-800 border-green-200',
  [VerdictType.SUSPICIOUS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [VerdictType.FAKE]: 'bg-red-100 text-red-800 border-red-200',
  [VerdictType.UNVERIFIED]: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const DEFAULT_TOPICS = [
  "Technology",
  "Politics",
  "Health",
  "Science",
  "Economy"
];

export const MOCK_NEWS_IMAGE = "https://picsum.photos/400/225";

export const SYSTEM_INSTRUCTION_VERIFIER = `
You are TruthLens, an expert fact-checking AI agent. 
Your goal is to verify claims, articles, and images. 
1. Use Google Search to cross-reference claims with reputable sources.
2. For text, analyze specific claims.
3. For images, analyze for signs of manipulation (lighting inconsistencies, artifacts) and context.
4. Always provide a verdict: REAL, SUSPICIOUS, or FAKE.
5. Provide a confidence score (0-100).
6. List evidence bullet points.
`;

export const SYSTEM_INSTRUCTION_FEED = `
You are a News Aggregator and Credibility Analyst.
Fetch the latest news for the requested topics.
For each article:
1. Summarize the headline and key facts.
2. Assess the credibility of the source and the likelihood of it being misinformation.
3. Assign a 'verdict' (REAL/SUSPICIOUS) based on source reputation.
Return the result as a strict JSON array.
`;
