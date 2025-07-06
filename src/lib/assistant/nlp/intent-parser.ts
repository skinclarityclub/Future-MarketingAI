import { OpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface ParsedIntent {
  intent: string;
  entities: Record<string, string>;
}

const systemPrompt = `You are an intent parser for an advanced business intelligence assistant with ML capabilities.
Extract the user's intent and any relevant entities from their question.

Available intents:
- "sales_report": Sales data queries
- "customer_lookup": Individual customer information
- "business_analysis": Strategic business analysis requiring ML insights
- "performance_analysis": Content/campaign performance analysis
- "churn_prediction": Customer churn risk analysis
- "roi_analysis": Return on investment analysis
- "optimization": Business optimization recommendations
- "trend_prediction": Future trend predictions
- "strategic_insights": Comprehensive strategic insights
- "kpi_query": General KPI queries
- "unknown": When intent is unclear

For entities, extract relevant parameters like:
- startDate, endDate: Date ranges
- customerId, email: Customer identifiers  
- contentId: Content identifiers
- platform: Platform names (shopify, kajabi, etc.)
- timeframe: Time periods (monthly, quarterly, etc.)
- analysisType: Type of analysis requested

Return ONLY valid JSON with keys: intent (string) and entities (object mapping).
If no entities, use an empty object {}`;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export async function parseIntent(question: string): Promise<ParsedIntent> {
  // Check if we have a valid API key
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "dummy-key"
  ) {
    // Return a default intent when no API key is available
    return {
      intent: "kpi_query",
      entities: {},
    };
  }

  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question },
    ];

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      temperature: 0,
      messages,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0].message.content;
    try {
      const parsed = JSON.parse(raw || "{}");
      return {
        intent: parsed.intent || "unknown",
        entities: parsed.entities || {},
      };
    } catch {
      return { intent: "unknown", entities: {} };
    }
  } catch {
    // Return fallback intent on any error
    return { intent: "kpi_query", entities: {} };
  }
}
