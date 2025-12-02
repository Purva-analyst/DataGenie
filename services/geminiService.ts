import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, ColumnStats, DataRow } from '../types';

const apiKey = process.env.API_KEY || ''; 

// We create the instance only when needed to ensure we use the latest key if it changes, 
// though typically it's static in env.
const getAI = () => new GoogleGenAI({ apiKey });

export const generateAIInsights = async (
  datasetName: string,
  stats: ColumnStats[],
  sampleData: DataRow[]
): Promise<AnalysisResult> => {
  
  if (!apiKey) {
    return {
      executiveSummary: "API Key missing. Please configure the Gemini API key to generate insights.",
      keyFindings: [],
      suggestedActions: [],
      generatedAt: new Date().toISOString()
    };
  }

  const ai = getAI();
  const model = "gemini-2.5-flash";
  
  const statsSummary = stats.map(s => {
    if (s.type === 'numeric') {
      return `${s.name} (Numeric): Mean=${s.mean?.toFixed(2)}, Min=${s.min}, Max=${s.max}`;
    } else {
      return `${s.name} (Categorical): ${s.unique} unique values, Most Freq=${s.mostFreq}`;
    }
  }).join('\n');

  const prompt = `
    Analyze the following dataset summary and sample rows.
    
    Dataset Name: ${datasetName}
    
    Column Statistics:
    ${statsSummary}
    
    Sample Data (First 3 rows):
    ${JSON.stringify(sampleData.slice(0, 3))}
    
    Provide an executive summary, key findings (trends, outliers, patterns), and suggested business actions.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: "A concise paragraph summarizing the dataset context and main trends." },
            keyFindings: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 key insights." },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 suggested actions based on data." }
          },
          required: ["executiveSummary", "keyFindings", "suggestedActions"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);

    return {
      executiveSummary: result.executiveSummary || "Could not generate summary.",
      keyFindings: result.keyFindings || [],
      suggestedActions: result.suggestedActions || [],
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      executiveSummary: "Error generating insights using Gemini AI. Please try again later.",
      keyFindings: [],
      suggestedActions: [],
      generatedAt: new Date().toISOString()
    };
  }
};