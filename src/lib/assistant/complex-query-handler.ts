import { parseIntent, type ParsedIntent } from "./nlp/intent-parser";
import { getDataSource } from "./data-source-registry";
import { mlOrchestrator, type MLQuery } from "./ml/ml-orchestrator";
import { OpenAI } from "openai";
// Note: mlModelRegistry and ChatCompletionMessageParam removed as they're currently unused
import {
  getPersonalityEngine,
  type PersonalityContext,
} from "../ai-configuration/personality-engine";

// Context-aware imports
import type { ContextEnhancedConversationContext } from "./context/context-aware-assistant";

export interface ComplexQuery {
  originalQuestion: string;
  decomposedQueries: SubQuery[];
  crossDomainAnalysis: boolean;
  explanationLevel: "basic" | "detailed" | "expert";
  context?: ConversationContext;
}

export interface SubQuery {
  subQuestion: string;
  domain: string;
  priority: number;
  intent: ParsedIntent;
  dataSources: string[];
  mlAnalysisNeeded: boolean;
}

export interface ConversationContext {
  previousQueries: string[];
  userPreferences: Record<string, any>;
  currentDashboardState?: Record<string, any>;
  sessionData: Record<string, any>;
}

export interface ComplexQueryResult {
  answer: string;
  detailedExplanation: string;
  visualizationSuggestions: VisualizationSuggestion[];
  insights: BusinessInsight[];
  followUpQuestions: string[];
  sources: string[];
  confidence: number;
  executionTime: number;
}

export interface VisualizationSuggestion {
  type: "chart" | "table" | "metric" | "dashboard";
  title: string;
  description: string;
  dataKey: string;
  chartType?: string;
  priority: "high" | "medium" | "low";
}

export interface BusinessInsight {
  type: "trend" | "correlation" | "anomaly" | "prediction" | "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  urgency: "immediate" | "short-term" | "long-term";
  confidence: number;
  supportingData: any[];
  actionable: boolean;
  recommendations?: string[];
}

// Initialize OpenAI with fallback for missing API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

function hasValidOpenAIKey(): boolean {
  return !!(
    process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "dummy-key"
  );
}

/**
 * Enhanced query decomposition that identifies complex, multi-domain questions
 */
export async function decomposeComplexQuery(
  question: string,
  context?: ConversationContext
): Promise<ComplexQuery> {
  const decompositionPrompt = `You are an expert business intelligence query analyzer. 
  Analyze this complex business question and decompose it into manageable sub-queries.

  Original Question: "${question}"

  Consider these business domains:
  - Customer Analytics (churn, segmentation, lifetime value)
  - Sales Performance (revenue, conversions, trends)
  - Content Performance (ROI, engagement, optimization)
  - Marketing Analytics (campaigns, attribution, spend efficiency)
  - Financial Metrics (profit margins, costs, forecasting)
  - Operational Metrics (inventory, supply chain, efficiency)

  Determine:
  1. Is this a simple single-domain query or complex multi-domain query?
  2. What sub-questions need to be answered?
  3. Which domains are involved?
  4. What data sources are needed?
  5. Is ML analysis required for predictions/insights?
  6. Does it require cross-domain correlation analysis?

  Return JSON with:
  - "isComplex": boolean
  - "domains": array of domain names
  - "subQueries": array of objects with {subQuestion, domain, priority (1-3), mlNeeded}
  - "crossDomainAnalysis": boolean
  - "explanationNeeded": boolean

  Examples of complex queries:
  - "How do our marketing campaigns affect customer churn and which content performs best for retention?"
  - "What's the correlation between our top-selling products and customer satisfaction scores?"
  - "How can we optimize our content strategy based on seasonal sales trends and customer behavior?"`;

  if (!hasValidOpenAIKey()) {
    // Fallback decomposition for demo mode
    return {
      originalQuestion: question,
      decomposedQueries: [
        {
          subQuestion: question,
          domain: "general",
          priority: 1,
          intent: { intent: "kpi_query", entities: {} },
          dataSources: ["demo"],
          mlAnalysisNeeded: false,
        },
      ],
      crossDomainAnalysis: false,
      explanationLevel: "basic",
      context,
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.1,
      messages: [
        { role: "system", content: decompositionPrompt },
        { role: "user", content: question },
      ],
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");

    // Create sub-queries with detailed intent parsing
    const decomposedQueries: SubQuery[] = [];

    for (const subQ of analysis.subQueries || []) {
      const intent = await parseIntent(subQ.subQuestion);
      decomposedQueries.push({
        subQuestion: subQ.subQuestion,
        domain: subQ.domain,
        priority: subQ.priority || 1,
        intent,
        dataSources: mapDomainToDataSources(subQ.domain),
        mlAnalysisNeeded: subQ.mlNeeded || false,
      });
    }

    return {
      originalQuestion: question,
      decomposedQueries,
      crossDomainAnalysis: analysis.crossDomainAnalysis || false,
      explanationLevel: analysis.explanationNeeded ? "detailed" : "basic",
      context,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Query decomposition failed:", error);
    }

    // Fallback to simple parsing
    const intent = await parseIntent(question);
    return {
      originalQuestion: question,
      decomposedQueries: [
        {
          subQuestion: question,
          domain: "general",
          priority: 1,
          intent,
          dataSources: ["supabase_financial"],
          mlAnalysisNeeded: true,
        },
      ],
      crossDomainAnalysis: false,
      explanationLevel: "basic",
      context,
    };
  }
}

/**
 * Main interface for complex query processing
 */
export async function processComplexQuery(
  question: string,
  context?: ConversationContext,
  explanationLevel: "basic" | "detailed" | "expert" = "detailed"
): Promise<ComplexQueryResult> {
  const _startTime = Date.now(); // Reserved for future performance tracking

  try {
    // Check if we have enhanced context available
    const hasEnhancedContext = isEnhancedContext(context);

    // If we have enhanced context, leverage the additional data
    if (hasEnhancedContext) {
      return await processComplexQueryWithEnhancedContext(
        question,
        context,
        explanationLevel
      );
    }

    // Otherwise, proceed with standard complex query processing
    return await executeStandardComplexQuery(
      question,
      context,
      explanationLevel
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Complex query processing failed:", error);
    }
    throw error;
  }
}

/**
 * Process complex query with enhanced context awareness
 */
async function processComplexQueryWithEnhancedContext(
  question: string,
  context: ContextEnhancedConversationContext,
  explanationLevel: "basic" | "detailed" | "expert"
): Promise<ComplexQueryResult> {
  const startTime = Date.now();

  // Leverage user profile information for better query decomposition
  const userProfile = context.userProfile;
  const relevantHistory = context.relevantHistory || [];
  const sessionMemory = context.sessionMemory;

  // Enhanced query decomposition using user context
  const complexQuery = await decomposeComplexQueryWithContext(
    question,
    context
  );

  // Execute the complex query with enhanced context
  const result = await executeComplexQuery(complexQuery);

  // Enhance insights with user-specific context
  if (userProfile) {
    result.insights = enhanceInsightsWithUserContext(
      result.insights,
      userProfile
    );
  }

  // Add personalized recommendations based on history
  if (relevantHistory.length > 0) {
    const personalizedRecommendations = generatePersonalizedRecommendations(
      result.insights,
      relevantHistory,
      userProfile
    );
    result.followUpQuestions = [
      ...result.followUpQuestions,
      ...personalizedRecommendations,
    ];
  }

  // Adapt explanation level based on user expertise
  if (userProfile?.expertiseLevel) {
    const adaptedExplanationLevel = adaptExplanationLevel(
      explanationLevel,
      userProfile.expertiseLevel
    );

    const enhancedExplanation = await generateDetailedExplanation(
      question,
      [result],
      result.insights,
      adaptedExplanationLevel
    );

    result.answer = enhancedExplanation.answer;
    result.detailedExplanation = enhancedExplanation.detailedExplanation;
  }

  result.executionTime = Date.now() - startTime;
  return result;
}

/**
 * Standard complex query processing (fallback)
 */
async function executeStandardComplexQuery(
  question: string,
  context?: ConversationContext,
  _explanationLevel: "basic" | "detailed" | "expert" = "detailed"
): Promise<ComplexQueryResult> {
  // This is the existing implementation
  const complexQuery = await decomposeComplexQuery(question, context);
  return await executeComplexQuery(complexQuery);
}

/**
 * Enhanced query decomposition using context
 */
async function decomposeComplexQueryWithContext(
  question: string,
  context: ContextEnhancedConversationContext
): Promise<ComplexQuery> {
  const userProfile = context.userProfile;
  const relevantHistory = context.relevantHistory || [];

  // Start with standard decomposition
  const baseQuery = await decomposeComplexQuery(question, context);

  // Enhance with user context
  if (userProfile) {
    // Adjust domains based on user's business focus
    baseQuery.decomposedQueries = baseQuery.decomposedQueries.map(subQuery => {
      if (
        userProfile.businessFocus.some(focus =>
          subQuery.subQuestion.toLowerCase().includes(focus.toLowerCase())
        )
      ) {
        subQuery.priority = Math.min(subQuery.priority + 1, 3); // Boost priority
      }
      return subQuery;
    });

    // Add context-aware sub-queries based on user patterns
    if (relevantHistory.length > 0) {
      const commonPatterns = extractCommonPatterns(relevantHistory);
      const contextualSubQueries = generateContextualSubQueries(
        question,
        commonPatterns
      );
      baseQuery.decomposedQueries.push(...contextualSubQueries);
    }
  }

  return baseQuery;
}

/**
 * Enhance insights with user-specific context
 */
function enhanceInsightsWithUserContext(
  insights: BusinessInsight[],
  userProfile: any
): BusinessInsight[] {
  return insights.map(insight => {
    // Adjust insight relevance based on user's business focus
    if (
      userProfile.businessFocus.some((focus: string) =>
        insight.description.toLowerCase().includes(focus.toLowerCase())
      )
    ) {
      insight.impact =
        insight.impact === "low"
          ? "medium"
          : insight.impact === "medium"
            ? "high"
            : insight.impact;
    }

    // Adjust urgency based on user's communication style
    if (
      userProfile.communicationStyle === "concise" &&
      insight.urgency === "long-term"
    ) {
      insight.urgency = "short-term";
    }

    return insight;
  });
}

/**
 * Generate personalized recommendations based on history
 */
function generatePersonalizedRecommendations(
  insights: BusinessInsight[],
  history: any[],
  userProfile?: any
): string[] {
  const recommendations: string[] = [];

  // Generate recommendations based on recent queries
  const recentTopics = history
    .slice(-3)
    .map(entry => entry.userQuery.toLowerCase());

  if (recentTopics.some(topic => topic.includes("performance"))) {
    recommendations.push(
      "Would you like me to dive deeper into performance optimization strategies?"
    );
  }

  if (recentTopics.some(topic => topic.includes("customer"))) {
    recommendations.push(
      "Should we explore customer segmentation analysis next?"
    );
  }

  // Add recommendations based on user profile
  if (userProfile?.communicationStyle === "visual") {
    recommendations.push(
      "Would you like me to suggest visualizations for this data?"
    );
  }

  return recommendations;
}

/**
 * Adapt explanation level based on user expertise
 */
function adaptExplanationLevel(
  requestedLevel: "basic" | "detailed" | "expert",
  userExpertise: "beginner" | "intermediate" | "advanced" | "expert"
): "basic" | "detailed" | "expert" {
  // Adjust explanation level based on user expertise
  if (userExpertise === "beginner" && requestedLevel === "expert") {
    return "detailed";
  }

  if (userExpertise === "expert" && requestedLevel === "basic") {
    return "detailed";
  }

  return requestedLevel;
}

/**
 * Extract common patterns from conversation history
 */
function extractCommonPatterns(history: any[]): string[] {
  const patterns: string[] = [];

  // Simple pattern extraction - look for recurring topics
  const allQueries = history
    .map(entry => entry.userQuery.toLowerCase())
    .join(" ");
  const businessTerms = [
    "revenue",
    "customers",
    "marketing",
    "sales",
    "performance",
    "analytics",
  ];

  businessTerms.forEach(term => {
    const count = (allQueries.match(new RegExp(term, "g")) || []).length;
    if (count >= 2) {
      patterns.push(term);
    }
  });

  return patterns;
}

/**
 * Generate contextual sub-queries based on patterns
 */
function generateContextualSubQueries(
  question: string,
  patterns: string[]
): SubQuery[] {
  const contextualQueries: SubQuery[] = [];

  patterns.forEach(pattern => {
    if (!question.toLowerCase().includes(pattern)) {
      contextualQueries.push({
        subQuestion: `How does this relate to our ${pattern} trends?`,
        domain: "general",
        priority: 2,
        intent: { intent: "context_analysis", entities: { pattern } },
        dataSources: ["supabase_financial"],
        mlAnalysisNeeded: true,
      });
    }
  });

  return contextualQueries;
}

/**
 * Execute complex query with detailed explanation generation
 */
export async function executeComplexQuery(
  complexQuery: ComplexQuery
): Promise<ComplexQueryResult> {
  const startTime = Date.now();

  const allResults: any[] = [];
  const allInsights: BusinessInsight[] = [];
  const allSources: string[] = [];
  const visualizations: VisualizationSuggestion[] = [];

  // Execute each sub-query
  for (const subQuery of complexQuery.decomposedQueries) {
    try {
      // Fetch data based on intent and domain
      const data = await fetchDataForSubQuery(subQuery);
      if (data) {
        allResults.push({ subQuery: subQuery.subQuestion, data });
        allSources.push(...subQuery.dataSources);
      }

      // Execute ML analysis if needed
      if (subQuery.mlAnalysisNeeded) {
        const mlQuery: MLQuery = {
          type: "insights",
          domain: subQuery.domain as any,
          parameters: subQuery.intent.entities,
          context: subQuery.subQuestion,
        };

        try {
          const mlResult = await mlOrchestrator.executeQuery(mlQuery);
          if (mlResult.success) {
            allInsights.push(
              ...mlResult.insights.map(insight => ({
                ...insight,
                type: insight.type as any,
                impact: insight.impact as any,
                urgency: insight.urgency as any,
                supportingData: [mlResult.data],
                actionable: true,
              }))
            );
            allSources.push(...mlResult.modelsUsed);
          }
        } catch (mlError) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `ML analysis failed for sub-query: ${subQuery.subQuestion}`,
              mlError
            );
          }
        }
      }

      // Generate visualization suggestions
      visualizations.push(...generateVisualizationSuggestions(subQuery, data));
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `Sub-query execution failed: ${subQuery.subQuestion}`,
          error
        );
      }
    }
  }

  // Generate cross-domain insights if needed
  if (complexQuery.crossDomainAnalysis) {
    const crossDomainInsights = await generateCrossDomainInsights(
      allResults,
      complexQuery.originalQuestion
    );
    allInsights.push(...crossDomainInsights);
  }

  // Generate comprehensive answer and explanation
  const { answer, detailedExplanation } = await generateDetailedExplanation(
    complexQuery.originalQuestion,
    allResults,
    allInsights,
    complexQuery.explanationLevel
  );

  // Generate follow-up questions
  const followUpQuestions = generateFollowUpQuestions(
    complexQuery,
    allInsights
  );

  const executionTime = Date.now() - startTime;
  const confidence = calculateOverallConfidence(allInsights);

  return {
    answer,
    detailedExplanation,
    visualizationSuggestions: visualizations,
    insights: allInsights,
    followUpQuestions,
    sources: [...new Set(allSources)], // Remove duplicates
    confidence,
    executionTime,
  };
}

/**
 * Fetch data for a specific sub-query based on its intent and domain
 */
async function fetchDataForSubQuery(subQuery: SubQuery): Promise<any> {
  const { intent, dataSources } = subQuery;

  for (const sourceName of dataSources) {
    try {
      const dataSource = getDataSource(sourceName as any);

      // Map intent to appropriate data fetch parameters
      let fetchParams: any = {};

      switch (intent.intent) {
        case "sales_report":
          fetchParams = {
            type: "orders",
            params: {
              created_at_min: intent.entities.startDate,
              limit: 100,
            },
          };
          break;

        case "customer_lookup":
          fetchParams = {
            type: "customers",
            params: {
              email: intent.entities.email,
              limit: 50,
            },
          };
          break;

        case "business_analysis":
        case "performance_analysis":
          fetchParams = {
            type: "analytics",
            params: {
              timeframe: intent.entities.timeframe || "30d",
              limit: 200,
            },
          };
          break;

        default:
          fetchParams = {
            type: "general",
            params: { limit: 100 },
          };
      }

      const data = await dataSource.fetch(fetchParams);
      if (data) {
        return data;
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`Data fetch failed for source ${sourceName}:`, error);
      }
    }
  }

  return null;
}

/**
 * Generate cross-domain business insights by analyzing correlations
 */
async function generateCrossDomainInsights(
  results: any[],
  originalQuestion: string
): Promise<BusinessInsight[]> {
  if (!hasValidOpenAIKey() || results.length < 2) {
    return [];
  }

  const crossDomainPrompt = `Analyze these multi-domain business data results and identify meaningful correlations, patterns, and strategic insights.

Original Question: "${originalQuestion}"

Data Results: ${JSON.stringify(results, null, 2).slice(0, 3000)}

Generate strategic business insights focusing on:
1. Cross-domain correlations (how different business areas affect each other)
2. Hidden patterns that might not be obvious
3. Strategic recommendations based on the combined data
4. Risk factors or opportunities identified through cross-analysis
5. Actionable next steps for business optimization

Return JSON array of insights with structure:
{
  "type": "correlation|trend|anomaly|prediction|recommendation",
  "title": "Clear, specific title",
  "description": "Detailed explanation",
  "impact": "high|medium|low",
  "urgency": "immediate|short-term|long-term", 
  "confidence": 0.0-1.0,
  "actionable": boolean,
  "recommendations": ["specific action items"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: crossDomainPrompt },
        { role: "user", content: "Analyze and generate cross-domain insights" },
      ],
      response_format: { type: "json_object" },
    });

    const insightsData = JSON.parse(
      response.choices[0].message.content || "{}"
    );
    return insightsData.insights || [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Cross-domain analysis failed:", error);
    }
    return [];
  }
}

/**
 * Generate detailed explanation with multiple levels of depth
 */
async function generateDetailedExplanation(
  question: string,
  results: any[],
  insights: BusinessInsight[],
  level: "basic" | "detailed" | "expert"
): Promise<{ answer: string; detailedExplanation: string }> {
  const explanationPrompts = {
    basic:
      "Provide a clear, concise answer focusing on key findings and main takeaways.",
    detailed:
      "Provide a comprehensive explanation with data analysis, trends, and strategic implications.",
    expert:
      "Provide an expert-level analysis with deep insights, technical details, statistical significance, and advanced recommendations.",
  };

  const baseSystemPrompt = `You are an expert business intelligence analyst. 
  Generate a comprehensive answer to the user's question using the provided data and insights.
  
  ${explanationPrompts[level]}
  
  Structure your response with:
  1. Executive Summary (key findings)
  2. Data Analysis (what the numbers show)
  3. Trends & Patterns (implications)
  4. Strategic Recommendations (actionable next steps)
  5. Risk Assessment (potential concerns)
  
  Use clear business language appropriate for executive decision-making.
  Include specific metrics and data points where relevant.
  Focus on actionable insights that drive business value.`;

  // Apply personality engine adaptations for complex queries
  const personalityEngine = getPersonalityEngine();
  const currentHour = new Date().getHours();
  const timeOfDay =
    currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : "evening";

  const personalityContext: PersonalityContext = {
    userQuestion: question,
    conversationLength: insights.length + 1, // Use insights count as proxy
    timeOfDay,
  };

  // Adapt the system prompt based on personality and context
  const adaptedPrompt = await personalityEngine.adaptPrompt(
    baseSystemPrompt,
    personalityContext
  );
  const systemPrompt = adaptedPrompt.systemMessage;

  if (!hasValidOpenAIKey()) {
    const fallbackAnswer = `Hallo! Voor de vraag "${question}":

📊 **Executive Summary**
Ik heb de beschikbare data geanalyseerd en kan demo-insights bieden.

📈 **Data Analysis** 
${results.length} data bronnen geanalyseerd met ${insights.length} business insights gevonden.

🎯 **Strategic Recommendations**
• Implementeer dashboard monitoring voor real-time inzichten
• Stel ML-gebaseerde analyses in voor diepere inzichten  
• Configureer OPENAI_API_KEY voor volledige functionaliteit

⚠️ **Demo Mode Notice**
Configureer je OpenAI API key voor volledige analyse-mogelijkheden.`;

    return {
      answer: fallbackAnswer,
      detailedExplanation: fallbackAnswer,
    };
  }

  try {
    const contextData = {
      question,
      results: results.slice(0, 3), // Limit data for token management
      insights: insights.slice(0, 5),
      analysisLevel: level,
    };

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Question: "${question}"\n\nContext Data: ${JSON.stringify(contextData, null, 2)}`,
        },
      ],
    });

    const fullExplanation =
      response.choices[0].message.content ||
      "Er kon geen analyse worden gegenereerd.";

    // Extract executive summary for concise answer
    const summaryMatch = fullExplanation.match(
      /(?:Executive Summary|Samenvatting)[\s\S]*?(?=\n##|\n\*\*|$)/i
    );
    const answer = summaryMatch
      ? summaryMatch[0]
      : fullExplanation.slice(0, 500) + "...";

    return {
      answer,
      detailedExplanation: fullExplanation,
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Explanation generation failed:", error);
    }

    const fallbackAnswer = `Voor "${question}": Ik heb ${results.length} databronnen geanalyseerd en ${insights.length} insights gevonden. Er was een probleem met de AI-service voor gedetailleerde analyse.`;

    return {
      answer: fallbackAnswer,
      detailedExplanation: fallbackAnswer,
    };
  }
}

/**
 * Generate relevant visualization suggestions based on query and data
 */
function generateVisualizationSuggestions(
  subQuery: SubQuery,
  data: any
): VisualizationSuggestion[] {
  const suggestions: VisualizationSuggestion[] = [];

  const { intent, domain } = subQuery;

  // Domain-specific visualization suggestions
  if (domain === "customer" || intent.intent === "customer_lookup") {
    suggestions.push({
      type: "chart",
      title: "Customer Segmentation",
      description: "Visualize customer segments and behavior patterns",
      dataKey: "customer_segments",
      chartType: "pie",
      priority: "high",
    });
  }

  if (domain === "sales" || intent.intent === "sales_report") {
    suggestions.push({
      type: "chart",
      title: "Revenue Trends",
      description: "Track sales performance over time",
      dataKey: "revenue_trends",
      chartType: "line",
      priority: "high",
    });
  }

  if (
    intent.intent === "business_analysis" ||
    intent.intent === "performance_analysis"
  ) {
    suggestions.push({
      type: "dashboard",
      title: "Performance Dashboard",
      description: "Comprehensive business metrics overview",
      dataKey: "performance_metrics",
      priority: "medium",
    });
  }

  return suggestions;
}

/**
 * Generate intelligent follow-up questions
 */
function generateFollowUpQuestions(
  complexQuery: ComplexQuery,
  insights: BusinessInsight[]
): string[] {
  const followUps: string[] = [];

  // Based on insights found
  insights.forEach(insight => {
    if (insight.type === "trend") {
      followUps.push(
        `What factors are driving the ${insight.title.toLowerCase()} trend?`
      );
    }
    if (insight.type === "correlation") {
      followUps.push(
        `How can we leverage the relationship between these metrics?`
      );
    }
    if (insight.type === "recommendation") {
      followUps.push(`What would be the ROI of implementing ${insight.title}?`);
    }
  });

  // Domain-specific follow-ups
  const domains = complexQuery.decomposedQueries.map(q => q.domain);
  if (domains.includes("customer")) {
    followUps.push("What customer segments should we focus on for growth?");
  }
  if (domains.includes("content")) {
    followUps.push("Which content types generate the highest ROI?");
  }
  if (domains.includes("sales")) {
    followUps.push("What's the forecast for next quarter's revenue?");
  }

  return followUps.slice(0, 3); // Limit to top 3 suggestions
}

/**
 * Calculate overall confidence score
 */
function calculateOverallConfidence(insights: BusinessInsight[]): number {
  if (insights.length === 0) return 0.5;

  const totalConfidence = insights.reduce(
    (sum, insight) => sum + insight.confidence,
    0
  );
  return totalConfidence / insights.length;
}

/**
 * Map business domain to appropriate data sources
 */
function mapDomainToDataSources(domain: string): string[] {
  const domainMap: Record<string, string[]> = {
    customer: ["supabase_customer", "shopify"],
    sales: ["shopify", "supabase_financial"],
    content: ["kajabi", "supabase_financial"],
    marketing: ["marketing", "supabase_financial"],
    financial: ["supabase_financial"],
    general: ["supabase_financial", "supabase_customer"],
  };

  return domainMap[domain] || ["supabase_financial"];
}

// Helper function to check if context is enhanced
export function isEnhancedContext(
  context: any
): context is ContextEnhancedConversationContext {
  return (
    context && typeof context === "object" && context.contextAware === true
  );
}

// Export the main complex query handler for compatibility
export const complexQueryHandler = {
  decomposeComplexQuery,
  processComplexQuery,
  executeComplexQuery,
  isEnhancedContext,
};
