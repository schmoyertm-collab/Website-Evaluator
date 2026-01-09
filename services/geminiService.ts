
import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { EvaluationResult, GroundingSource, CompetitiveAnalysis, LocalCompetitor } from "../types";

export const evaluateWebsite = async (url: string): Promise<EvaluationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Evaluate this primary website URL: ${url}. 
      Use Google Search to find current performance benchmarks, SEO status, and reputation.
      Also, identify the specific industry this business belongs to.`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: { type: Type.NUMBER },
            humanSummary: { type: Type.STRING },
            industry: { type: Type.STRING },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  weight: { type: Type.NUMBER },
                  findings: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        action: { type: Type.STRING },
                        priority: { type: Type.STRING },
                        rationale: { type: Type.STRING },
                        impact: { type: Type.STRING }
                      },
                      required: ["action", "priority", "rationale", "impact"]
                    }
                  }
                },
                required: ["name", "score", "weight", "findings", "recommendations"]
              }
            }
          },
          required: ["overallScore", "humanSummary", "categories", "industry"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // Extract grounding sources
    const sources: GroundingSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      ...result,
      url,
      rawJson: response.text || "{}",
      sources: uniqueSources
    };
  } catch (error) {
    console.error("Evaluation Error:", error);
    throw new Error("Failed to evaluate website. Please check the URL and try again.");
  }
};

export const findLocalCompetitors = async (industry: string, location: string): Promise<LocalCompetitor[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 3-5 local competitors in the "${industry}" industry located in "${location}". 
      For each, identify their website URL and give them an estimated website quality score (0-100) based on their search presence, mobile friendliness, and visible SEO.
      Return the data in the specified JSON format.`,
      config: {
        systemInstruction: "You are a local marketing expert. Focus on identifying real businesses with functional websites. Return JSON only.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            competitors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  url: { type: Type.STRING },
                  score: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["name", "url", "score", "description"]
              }
            }
          },
          required: ["competitors"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result.competitors || [];
  } catch (error) {
    console.error("Local Search Error:", error);
    throw new Error("Failed to find local competitors.");
  }
};

export const analyzeIndustryGaps = async (primaryUrl: string): Promise<CompetitiveAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform an industry gap analysis for ${primaryUrl}. 
      1. Identify 2-3 specific competitors in the same industry that currently have poor website experiences (slow speed, bad UX, or weak mobile responsiveness).
      2. Compare them to the primary site.
      3. Identify "Low-Hanging Fruit" opportunities where the primary site can capitalize on these specific competitor weaknesses.`,
      config: {
        systemInstruction: "You are a competitive strategist. Return JSON only.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            identifiedCompetitors: { type: Type.ARRAY, items: { type: Type.STRING } },
            gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  competitorWeakness: { type: Type.STRING },
                  ourAdvantage: { type: Type.STRING }
                },
                required: ["subject", "competitorWeakness", "ourAdvantage"]
              }
            }
          },
          required: ["summary", "identifiedCompetitors", "gaps"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Competitive Analysis Error:", error);
    throw new Error("Failed to perform industry gap analysis.");
  }
};
