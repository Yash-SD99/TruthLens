import { GoogleGenAI, Type } from "@google/genai";
import { VerificationResult, VerdictType, NewsArticle } from "../types";
import { SYSTEM_INSTRUCTION_VERIFIER, SYSTEM_INSTRUCTION_FEED } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey });
  }

  private getModel(useSearch = false) {
    if (!this.ai) throw new Error("AI not initialized");
    // Using gemini-2.5-flash for speed and cost effectiveness in a demo
    return useSearch ? 'gemini-2.5-flash' : 'gemini-2.5-flash'; 
  }

  /**
   * Helper to parse JSON from model output that might contain Markdown
   */
  private parseJSON(text: string | undefined): any {
    if (!text) return null;
    try {
      // Remove markdown code blocks if present
      let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      return null;
    }
  }

  /**
   * Verifies text or a URL claim using Grounding
   */
  async verifyText(text: string): Promise<VerificationResult> {
    if (!this.ai) throw new Error("API Key missing");

    const prompt = `
    Analyze the following claim or article text for veracity:
    "${text}"
    
    Perform a Google Search to find corroborating or debunking evidence.
    
    IMPORTANT: Return the result as a raw JSON object (no markdown formatting).
    Follow this structure:
    {
      "verdict": "REAL" | "SUSPICIOUS" | "FAKE",
      "confidence": number (0-100),
      "summary": "short explanation",
      "evidence": ["fact 1", "fact 2"]
    }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_VERIFIER,
          tools: [{ googleSearch: {} }],
          // Note: responseMimeType and responseSchema are NOT supported with googleSearch
        }
      });

      const data = this.parseJSON(response.text) || {};
      
      // Extract grounding sources
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "Web Source",
        uri: chunk.web?.uri || "#"
      })).filter((s: any) => s.uri !== "#") || [];

      return {
        verdict: (data.verdict as VerdictType) || VerdictType.UNVERIFIED,
        confidence: data.confidence || 0,
        summary: data.summary || "Analysis failed to produce a summary.",
        evidence: data.evidence || [],
        sources: sources,
        analysisType: 'TEXT'
      };

    } catch (error) {
      console.error("Verification error:", error);
      throw new Error("Failed to verify text.");
    }
  }

  /**
   * Analyzes an image for manipulation and context
   */
  async verifyImage(base64Image: string, promptText?: string): Promise<VerificationResult> {
    if (!this.ai) throw new Error("API Key missing");

    const userPrompt = promptText ? `Context provided by user: "${promptText}". ` : "";
    const prompt = `${userPrompt} Analyze this image. Look for:
    1. Digital manipulation (shadows, lighting, artifacts).
    2. Deepfake indicators (eyes, teeth, skin texture).
    3. If it looks like a known event, verify if the context is correct using your knowledge.
    
    Return JSON.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash', // Supports vision
        contents: {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: prompt }
          ]
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION_VERIFIER,
          responseMimeType: "application/json",
           responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: { type: Type.STRING, enum: [VerdictType.REAL, VerdictType.SUSPICIOUS, VerdictType.FAKE] },
              confidence: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              evidence: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["verdict", "confidence", "summary", "evidence"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");

      return {
        verdict: data.verdict as VerdictType,
        confidence: data.confidence,
        summary: data.summary,
        evidence: data.evidence,
        sources: [], // Visual analysis typically doesn't return web sources unless specific grounding tool is compatible/used
        analysisType: 'IMAGE'
      };

    } catch (error) {
      console.error("Image analysis error:", error);
      throw new Error("Failed to analyze image.");
    }
  }

  /**
   * Generates a personalized news feed using live search grounding
   */
  async generateNewsFeed(topics: string[]): Promise<NewsArticle[]> {
    if (!this.ai) throw new Error("API Key missing");

    const topicStr = topics.join(", ");
    const prompt = `Find 6 recent, trending news articles about: ${topicStr}.
    For each, provide a title, summary, source name, and a credibility verdict based on the source's reputation.
    
    IMPORTANT: Return the result as a raw JSON array (no markdown formatting).
    Follow this structure:
    [
      {
        "title": "string",
        "summary": "string",
        "source": "string",
        "verdict": "REAL" | "SUSPICIOUS",
        "publishedAt": "ISO Date",
        "reasoning": "string"
      }
    ]
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: SYSTEM_INSTRUCTION_FEED,
            tools: [{ googleSearch: {} }],
            // Note: responseMimeType and responseSchema are NOT supported with googleSearch
        }
      });
      
      const articles = this.parseJSON(response.text) || [];
      
      return articles.map((art: any, index: number) => ({
        id: `news-${index}-${Date.now()}`,
        title: art.title || "Untitled",
        summary: art.summary || "No summary available.",
        source: art.source || "Unknown Source",
        publishedAt: art.publishedAt || new Date().toISOString(),
        verdict: (art.verdict as VerdictType) || VerdictType.UNVERIFIED,
        confidenceScore: art.verdict === 'REAL' ? 90 : 60, // Simplified for feed
        reasoning: art.reasoning || "Analysis pending.",
        topics: topics,
        imageUrl: `https://picsum.photos/seed/${index + Date.now()}/400/225` // Placeholder
      }));

    } catch (error) {
      console.error("News feed generation error:", error);
      return [];
    }
  }
}