
import { GoogleGenAI } from "@google/genai";
import { VerificationResult, VerdictType, NewsArticle } from "../types";
import { 
  SYSTEM_INSTRUCTION_VERIFIER, 
  SYSTEM_INSTRUCTION_IMAGE_ANALYST,
  AGENT_COLLECTOR_PROMPT,
  AGENT_PIPELINE_INSTRUCTION
} from "../constants";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey });
  }

  private parseJSON(text: string | undefined): any {
    if (!text) return null;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error. Raw text:", text, e);
      return null;
    }
  }

  /**
   * THE 4-AGENT NEWS PIPELINE
   * Orchestrates the fetching and multi-stage analysis of news.
   */
  async generateNewsFeed(topics: string[]): Promise<NewsArticle[]> {
    if (!this.ai) throw new Error("API Key missing");

    try {
      // ---------------------------------------------------------
      // AGENT 1: NEWS COLLECTOR
      // Fetches raw data from the "real world" via Google Search
      // ---------------------------------------------------------
      const topicStr = topics.join(", ");
      const collectorResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
          ${AGENT_COLLECTOR_PROMPT}
          TOPICS: ${topicStr}
          
          TASK: Search for the latest news on these topics. Return a raw JSON list of items found.
          Schema: [{ "title": "string", "url": "string", "source": "string", "snippet": "string", "publishedAt": "string (YYYY-MM-DD)" }]
          
          CRITICAL: Return ONLY valid JSON array.
        `,
        config: {
          tools: [{ googleSearch: {} }],
          // NOTE: responseMimeType cannot be used with tools. We rely on the prompt and manual parsing.
        }
      });
      
      let rawArticles = this.parseJSON(collectorResponse.text);
      
      if (!Array.isArray(rawArticles) || rawArticles.length === 0) {
        console.warn("Agent 1 found no articles. Retrying or returning empty.");
        // Optional: Implement retry logic here
        return [];
      }

      // Limit to top 6 to prevent context window overflow during analysis
      const batchToAnalyze = rawArticles.slice(0, 6);

      // ---------------------------------------------------------
      // AGENTS 2, 3, 4: ANALYST PIPELINE (Batch Processing)
      // We pass the raw data to the Analyst Agents for processing.
      // ---------------------------------------------------------
      const pipelineResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
          SOURCE DATA (from Agent 1):
          ${JSON.stringify(batchToAnalyze)}

          INSTRUCTIONS:
          Run the Source Credibility Agent, Content Analysis Agent, and Verdict Agent on the data above.
          Follow the system instructions strictly.
        `,
        config: {
          systemInstruction: AGENT_PIPELINE_INSTRUCTION,
          responseMimeType: "application/json", // We CAN use JSON mode here because no tools are used in this step
        }
      });

      const analyzedArticles = this.parseJSON(pipelineResponse.text);

      if (!Array.isArray(analyzedArticles)) {
        console.error("Pipeline Agents returned invalid format.");
        return [];
      }

      // Map to frontend model
      return analyzedArticles.map((art: any, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: art.title || "Untitled",
        summary: art.summary || art.snippet || "No summary.",
        source: art.source || "Unknown",
        url: art.url,
        publishedAt: art.publishedAt || new Date().toISOString(),
        verdict: (art.verdict as VerdictType) || VerdictType.UNVERIFIED,
        confidenceScore: art.confidenceScore || 70,
        imageUrl: `https://picsum.photos/seed/${index + Date.now()}/400/225`, // Placeholder for demo
        topics: topics,
        agentAnalysis: {
          sourceScore: art.agentAnalysis?.sourceScore || 50,
          sourceNotes: art.agentAnalysis?.sourceNotes || "Analysis pending.",
          contentScore: art.agentAnalysis?.contentScore || 50,
          contentNotes: art.agentAnalysis?.contentNotes || "Analysis pending.",
          evidence: art.agentAnalysis?.evidence || []
        }
      }));

    } catch (error) {
      console.error("News Pipeline Error:", error);
      return [];
    }
  }

  async verifyText(text: string): Promise<VerificationResult> {
    if (!this.ai) throw new Error("API Key missing");

    const prompt = `
    AGENT TASK: Verify the following claim.
    INPUT: "${text}"
    
    INSTRUCTIONS:
    1. Executing S.I.F.T. methodology (Stop, Investigate, Find, Trace).
    2. Cross-reference the claim with Google Search results.
    3. Determine the verdict based on the weight of evidence.

    OUTPUT FORMAT (Raw JSON only):
    {
      "verdict": "REAL" | "SUSPICIOUS" | "FAKE",
      "confidence": number (0-100),
      "summary": "Concise summary of the investigation",
      "evidence": ["Evidence point 1", "Evidence point 2"],
      "sources": [{"title": "Source Name", "url": "http..."}] 
    }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_VERIFIER,
          tools: [{ googleSearch: {} }],
        }
      });

      const data = this.parseJSON(response.text) || {};
      
      const metadataSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "Web Source",
        uri: chunk.web?.uri || "#"
      })).filter((s: any) => s.uri !== "#") || [];

      const modelSources = data.sources?.map((s: any) => ({ title: s.title, uri: s.url })) || [];
      const allSources = [...modelSources, ...metadataSources];
      const uniqueSources = Array.from(new Map(allSources.map(item => [item.uri, item])).values());

      return {
        verdict: (data.verdict as VerdictType) || VerdictType.UNVERIFIED,
        confidence: data.confidence || 0,
        summary: data.summary || "Agent could not verify this claim.",
        evidence: data.evidence || [],
        sources: uniqueSources,
        analysisType: 'TEXT'
      };

    } catch (error) {
      console.error("Verification Agent error:", error);
      throw new Error("TruthLens Agent failed to verify text.");
    }
  }

  async verifyImage(base64Image: string, promptText?: string): Promise<VerificationResult> {
    if (!this.ai) throw new Error("API Key missing");

    const userPrompt = promptText ? `User Context: "${promptText}". ` : "";
    
    const prompt = `
    ${userPrompt}
    AGENT TASK: Perform forensic analysis on the attached image.
    1. Scan for AI generation artifacts (hands, text rendering, textures).
    2. Check for metadata inconsistencies or editing signs.
    3. Cross-reference with visual search to find original context.
    
    OUTPUT FORMAT (Raw JSON only):
    {
      "verdict": "REAL" | "SUSPICIOUS" | "FAKE",
      "confidence": number (0-100),
      "summary": "Forensic analysis findings",
      "evidence": ["Visual artifact 1", "Context mismatch 2"],
      "sources": [{"title": "Source Name", "url": "http..."}]
    }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_IMAGE_ANALYST,
          tools: [{ googleSearch: {} }], 
        }
      });

      const data = this.parseJSON(response.text) || {};
      
      const metadataSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "Web Source",
        uri: chunk.web?.uri || "#"
      })).filter((s: any) => s.uri !== "#") || [];

      const modelSources = data.sources?.map((s: any) => ({ title: s.title, uri: s.url })) || [];
      const allSources = [...modelSources, ...metadataSources];
      const uniqueSources = Array.from(new Map(allSources.map(item => [item.uri, item])).values());

      return {
        verdict: (data.verdict as VerdictType) || VerdictType.UNVERIFIED,
        confidence: data.confidence || 0,
        summary: data.summary || "Image analysis inconclusive.",
        evidence: data.evidence || [],
        sources: uniqueSources, 
        analysisType: 'IMAGE'
      };

    } catch (error) {
      console.error("Image Analyst Agent error:", error);
      throw new Error("TruthLens Agent failed to analyze image.");
    }
  }
}
