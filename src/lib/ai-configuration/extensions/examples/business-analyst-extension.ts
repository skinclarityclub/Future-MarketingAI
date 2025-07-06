/**
 * Example Extension: Business Analyst Personality Pack
 *
 * This demonstrates how to create a personality extension with
 * specialized profiles, message types, and adaptation rules
 * for business analyst scenarios.
 */

import {
  PersonalityExtension,
  ExtendedMessageType,
  AdaptationRule,
  ContextProcessor,
  personalityExtensionRegistry,
} from "../personality-extension-system";
import { PersonalityProfile } from "../../types";

/**
 * Business Analyst specialized personality profiles
 */
const businessAnalystProfiles: PersonalityProfile[] = [
  {
    id: "data-storyteller",
    name: "Data Storyteller",
    description:
      "Expert at turning complex data into compelling narratives for stakeholders",
    tone: "friendly",
    style: "conversational",
    formality: "semi-formal",
    verbosity: "moderate",
    emotionalTone: "enthusiastic",
    technicalLevel: "intermediate",
    customPromptAdditions:
      "Focus on creating data stories with clear narrative arcs. Use analogies and metaphors to explain complex patterns. Always include actionable insights and next steps.",
    language: "nl",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "quantitative-expert",
    name: "Quantitative Expert",
    description:
      "Deep statistical analysis with rigorous methodology and precision",
    tone: "authoritative",
    style: "technical",
    formality: "formal",
    verbosity: "verbose",
    emotionalTone: "neutral",
    technicalLevel: "expert",
    customPromptAdditions:
      "Emphasize statistical significance, confidence intervals, and methodological rigor. Include detailed calculations and assumptions. Mention data quality considerations.",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "executive-briefer",
    name: "Executive Briefer",
    description:
      "Concise, high-impact analysis focused on strategic decision-making",
    tone: "professional",
    style: "concise",
    formality: "formal",
    verbosity: "brief",
    emotionalTone: "calm",
    technicalLevel: "beginner",
    customPromptAdditions:
      "Prioritize executive summary format. Lead with key insights and recommendations. Include financial impact and risk assessment. Avoid technical jargon.",
    language: "nl",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "trend-detective",
    name: "Trend Detective",
    description:
      "Specialist in identifying patterns, anomalies, and emerging trends",
    tone: "friendly",
    style: "conversational",
    formality: "informal",
    verbosity: "verbose",
    emotionalTone: "energetic",
    technicalLevel: "intermediate",
    customPromptAdditions:
      "Focus on pattern recognition and trend analysis. Highlight anomalies and outliers. Provide context about what trends mean for business strategy.",
    isActive: false,
    created: new Date(),
    updated: new Date(),
  },
];

/**
 * Specialized message types for business analysis
 */
const businessAnalystMessageTypes: ExtendedMessageType[] = [
  {
    id: "trend-alert",
    name: "Trend Alert",
    category: "analysis",
    template:
      "🔍 **Trend Gedetecteerd**: {{trendName}}\n\n📈 **Verandering**: {{changePercentage}}% {{direction}} in {{timeframe}}\n\n💡 **Impact**: {{impact}}\n\n🎯 **Aanbeveling**: {{recommendation}}",
    variables: [
      {
        name: "trendName",
        type: "string",
        required: true,
        description: "Name of the detected trend",
      },
      {
        name: "changePercentage",
        type: "number",
        required: true,
        description: "Percentage change",
      },
      {
        name: "direction",
        type: "string",
        required: true,
        defaultValue: "stijging",
        description: "Direction of change",
      },
      {
        name: "timeframe",
        type: "string",
        required: true,
        description: "Time period",
      },
      {
        name: "impact",
        type: "string",
        required: true,
        description: "Business impact description",
      },
      {
        name: "recommendation",
        type: "string",
        required: true,
        description: "Recommended action",
      },
    ],
    conditions: [],
    translations: {
      en: "🔍 **Trend Detected**: {{trendName}}\n\n📈 **Change**: {{changePercentage}}% {{direction}} over {{timeframe}}\n\n💡 **Impact**: {{impact}}\n\n🎯 **Recommendation**: {{recommendation}}",
      nl: "🔍 **Trend Gedetecteerd**: {{trendName}}\n\n📈 **Verandering**: {{changePercentage}}% {{direction}} in {{timeframe}}\n\n💡 **Impact**: {{impact}}\n\n🎯 **Aanbeveling**: {{recommendation}}",
    },
  },
  {
    id: "executive-summary",
    name: "Executive Summary",
    category: "analysis",
    template:
      "📊 **Executive Summary**\n\n🎯 **Belangrijkste Bevindingen**:\n{{keyFindings}}\n\n📈 **Performance Indicatoren**:\n{{kpis}}\n\n⚠️ **Aandachtspunten**:\n{{concerns}}\n\n💼 **Strategische Aanbevelingen**:\n{{recommendations}}",
    variables: [
      {
        name: "keyFindings",
        type: "string",
        required: true,
        description: "Key findings summary",
      },
      {
        name: "kpis",
        type: "string",
        required: true,
        description: "Key performance indicators",
      },
      {
        name: "concerns",
        type: "string",
        required: false,
        defaultValue: "Geen kritieke aandachtspunten",
        description: "Areas of concern",
      },
      {
        name: "recommendations",
        type: "string",
        required: true,
        description: "Strategic recommendations",
      },
    ],
    conditions: [{ type: "userRole", operator: "equals", value: "executive" }],
    translations: {
      en: "📊 **Executive Summary**\n\n🎯 **Key Findings**:\n{{keyFindings}}\n\n📈 **Performance Indicators**:\n{{kpis}}\n\n⚠️ **Areas of Concern**:\n{{concerns}}\n\n💼 **Strategic Recommendations**:\n{{recommendations}}",
      nl: "📊 **Executive Summary**\n\n🎯 **Belangrijkste Bevindingen**:\n{{keyFindings}}\n\n📈 **Performance Indicatoren**:\n{{kpis}}\n\n⚠️ **Aandachtspunten**:\n{{concerns}}\n\n💼 **Strategische Aanbevelingen**:\n{{recommendations}}",
    },
  },
  {
    id: "data-quality-warning",
    name: "Data Quality Warning",
    category: "error",
    template:
      "⚠️ **Data Kwaliteit Waarschuwing**\n\n🔍 **Probleem**: {{issue}}\n\n📊 **Betrouwbaarheid**: {{confidence}}%\n\n🔧 **Aanbevolen Actie**: {{action}}\n\n💡 **Context**: {{context}}",
    variables: [
      {
        name: "issue",
        type: "string",
        required: true,
        description: "Data quality issue description",
      },
      {
        name: "confidence",
        type: "number",
        required: true,
        description: "Confidence percentage",
      },
      {
        name: "action",
        type: "string",
        required: true,
        description: "Recommended action",
      },
      {
        name: "context",
        type: "string",
        required: false,
        description: "Additional context",
      },
    ],
    conditions: [],
    translations: {
      en: "⚠️ **Data Quality Warning**\n\n🔍 **Issue**: {{issue}}\n\n📊 **Confidence**: {{confidence}}%\n\n🔧 **Recommended Action**: {{action}}\n\n💡 **Context**: {{context}}",
      nl: "⚠️ **Data Kwaliteit Waarschuwing**\n\n🔍 **Probleem**: {{issue}}\n\n📊 **Betrouwbaarheid**: {{confidence}}%\n\n🔧 **Aanbevolen Actie**: {{action}}\n\n💡 **Context**: {{context}}",
    },
  },
];

/**
 * Business-specific adaptation rules
 */
const businessAnalystAdaptationRules: AdaptationRule[] = [
  {
    id: "executive-mode",
    name: "Executive Communication Mode",
    priority: 100,
    conditions: [{ field: "userRole", operator: "equals", value: "executive" }],
    actions: [
      {
        type: "modifyTone",
        parameters: {
          tone: "executive-focused",
          additions:
            "Focus on strategic implications and bottom-line impact. Use executive language and prioritize actionable insights.",
        },
      },
    ],
    enabled: true,
  },
  {
    id: "technical-depth",
    name: "Technical Depth for Analysts",
    priority: 90,
    conditions: [
      { field: "userRole", operator: "equals", value: "analyst" },
      { field: "conversationLength", operator: "greater", value: 3 },
    ],
    actions: [
      {
        type: "addContext",
        parameters: {
          context:
            "Provide detailed methodology, statistical measures, and data source information. Include confidence intervals and assumptions.",
        },
      },
    ],
    enabled: true,
  },
  {
    id: "time-sensitive-analysis",
    name: "Time-Sensitive Analysis Mode",
    priority: 80,
    conditions: [
      { field: "timeOfDay", operator: "equals", value: "morning" },
      { field: "dashboardPage", operator: "contains", value: "financial" },
    ],
    actions: [
      {
        type: "insertMessage",
        parameters: {
          message:
            "Goedemorgen! Hier zijn de dagelijkse financiële inzichten voor je morning briefing.",
        },
      },
    ],
    enabled: true,
  },
];

/**
 * Context processors for business analysis
 */
const businessAnalystContextProcessors: ContextProcessor[] = [
  {
    id: "business-metrics-extractor",
    name: "Business Metrics Context Extractor",
    priority: 50,
    processContext: async (context: any) => {
      // Extract business-relevant metrics from context
      const businessContext = {
        ...context,
        businessMetrics: {
          hasFinancialData: context.dashboardPage?.includes("financial"),
          hasCustomerData: context.dashboardPage?.includes("customer"),
          hasMarketingData: context.dashboardPage?.includes("marketing"),
          isQuarterEnd: isQuarterEnd(),
          isMonthEnd: isMonthEnd(),
        },
      };

      return businessContext;
    },
    extractFeatures: (userInput: string) => {
      const features: Record<string, any> = {};

      // Extract business-specific features from user input
      if (userInput.match(/\b(revenue|profit|sales|income)\b/i)) {
        features.financialQuery = true;
      }

      if (userInput.match(/\b(customer|churn|retention|satisfaction)\b/i)) {
        features.customerQuery = true;
      }

      if (userInput.match(/\b(trend|pattern|forecast|predict)\b/i)) {
        features.analyticalQuery = true;
      }

      return features;
    },
  },
];

// Helper functions
function isQuarterEnd(): boolean {
  const now = new Date();
  const month = now.getMonth();
  return month === 2 || month === 5 || month === 8 || month === 11; // March, June, September, December
}

function isMonthEnd(): boolean {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return tomorrow.getMonth() !== now.getMonth();
}

/**
 * Complete Business Analyst Extension
 */
export const businessAnalystExtension: PersonalityExtension = {
  id: "business-analyst-pack",
  name: "Business Analyst Personality Pack",
  version: "1.0.0",
  author: "SKC BI Dashboard Team",
  description:
    "Specialized personality profiles and features for business analysis scenarios, including executive briefing, data storytelling, and trend analysis capabilities.",
  profiles: businessAnalystProfiles,
  messageTypes: businessAnalystMessageTypes,
  adaptationRules: businessAnalystAdaptationRules,
  contextProcessors: businessAnalystContextProcessors,
};

/**
 * Auto-register the extension when this module is imported
 */
export function registerBusinessAnalystExtension(): void {
  personalityExtensionRegistry.registerExtension(businessAnalystExtension);
  console.log("📊 Business Analyst Extension registered successfully!");
}

// Auto-register by default
registerBusinessAnalystExtension();
