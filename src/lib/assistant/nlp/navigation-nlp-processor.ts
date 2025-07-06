/**
 * Navigation NLP Processor - Client-Safe Version
 * Task 13.4: Develop Natural Language Processing (NLP) Capabilities
 *
 * This processor handles natural language commands for dashboard navigation
 * without direct AI API calls (moved to server-side API routes)
 */

// Removed direct OpenAI import to make client-safe
// import { parseIntent, type ParsedIntent } from "./intent-parser";

// Fallback interface when server API is not available
export interface ParsedIntent {
  intent: string;
  entities: Record<string, string>;
}

// Type definitions
export type CommandType =
  | "navigate"
  | "search"
  | "filter"
  | "analyze"
  | "command";
export type SupportedLanguage = "en" | "nl";
export type CommandPatterns = {
  navigate: RegExp[];
  search: RegExp[];
  filter: RegExp[];
  analyze: RegExp[];
  command: RegExp[];
};

export interface NavigationCommand {
  type: CommandType;
  target: string;
  confidence: number;
  page?: string;
  filters?: Record<string, any>;
  parameters?: Record<string, any>;
  language: SupportedLanguage;
}

export interface NLPProcessingResult {
  command: NavigationCommand;
  intent: ParsedIntent;
  navigationPath: string[];
  suggestedActions: string[];
  errorMessage?: string;
}

export interface VoiceCommand {
  transcript: string;
  confidence: number;
  alternates?: string[];
  language: string;
  timestamp: Date;
}

export interface NLPConfig {
  languages: ("en" | "nl")[];
  voiceEnabled: boolean;
  confidenceThreshold: number;
  maxProcessingTime: number;
  fallbackLanguage: "en" | "nl";
}

// Navigation command patterns for different languages
const NAVIGATION_PATTERNS = {
  en: {
    navigate: [
      /^(go to|navigate to|open|show me) (.+)$/i,
      /^take me to (.+)$/i,
      /^I want to see (.+)$/i,
      /^display (.+)$/i,
    ],
    search: [
      /^search for (.+)$/i,
      /^find (.+)$/i,
      /^look for (.+)$/i,
      /^where is (.+)$/i,
    ],
    filter: [/^filter (.+) by (.+)$/i, /^show only (.+)$/i, /^limit to (.+)$/i],
    analyze: [
      /^analyze (.+)$/i,
      /^what is the (.+) of (.+)$/i,
      /^compare (.+) and (.+)$/i,
      /^show trends for (.+)$/i,
    ],
    command: [
      /^(create|add|delete|remove|update|edit) (.+)$/i,
      /^export (.+)$/i,
      /^download (.+)$/i,
    ],
  },
  nl: {
    navigate: [
      /^(ga naar|navigeer naar|open|laat zien) (.+)$/i,
      /^breng me naar (.+)$/i,
      /^ik wil (.+) zien$/i,
      /^toon (.+)$/i,
    ],
    search: [
      /^zoek naar (.+)$/i,
      /^vind (.+)$/i,
      /^waar is (.+)$/i,
      /^zoeken (.+)$/i,
    ],
    filter: [
      /^filter (.+) op (.+)$/i,
      /^toon alleen (.+)$/i,
      /^beperk tot (.+)$/i,
    ],
    analyze: [
      /^analyseer (.+)$/i,
      /^wat is de (.+) van (.+)$/i,
      /^vergelijk (.+) en (.+)$/i,
      /^toon trends voor (.+)$/i,
    ],
    command: [
      /^(maak|toevoegen|verwijder|bijwerken|bewerk) (.+)$/i,
      /^exporteer (.+)$/i,
      /^download (.+)$/i,
    ],
  },
};

// Page/section mappings for navigation
const PAGE_MAPPINGS = {
  en: {
    dashboard: "/dashboard",
    home: "/dashboard",
    sales: "/dashboard/sales",
    customers: "/dashboard/customers",
    analytics: "/dashboard/analytics",
    reports: "/dashboard/reports",
    settings: "/settings",
    profile: "/profile",
    revenue: "/dashboard/revenue",
    performance: "/dashboard/performance",
    insights: "/dashboard/insights",
    trends: "/dashboard/trends",
    kpi: "/dashboard/kpi",
    metrics: "/dashboard/metrics",
  },
  nl: {
    dashboard: "/dashboard",
    overzicht: "/dashboard",
    verkoop: "/dashboard/sales",
    klanten: "/dashboard/customers",
    analytics: "/dashboard/analytics",
    rapporten: "/dashboard/reports",
    instellingen: "/settings",
    profiel: "/profile",
    omzet: "/dashboard/revenue",
    prestaties: "/dashboard/performance",
    inzichten: "/dashboard/insights",
    trends: "/dashboard/trends",
    kpi: "/dashboard/kpi",
    statistieken: "/dashboard/metrics",
  },
};

export class NavigationNLPProcessor {
  private config: NLPConfig;
  private supportedLanguages: Set<string>;
  private language: SupportedLanguage = "en";
  private patterns: CommandPatterns;

  constructor(
    config: Partial<NLPConfig> = {},
    language: SupportedLanguage = "en"
  ) {
    this.config = {
      languages: ["en", "nl"],
      voiceEnabled: true,
      confidenceThreshold: 0.6,
      maxProcessingTime: 5000,
      fallbackLanguage: "en",
      ...config,
    };
    this.supportedLanguages = new Set(this.config.languages);
    this.language = language;
    this.patterns = NAVIGATION_PATTERNS[language];
  }

  /**
   * Process natural language input for navigation
   */
  async processNavigationQuery(
    input: string,
    language: "en" | "nl" = "en",
    modality: "text" | "voice" = "text"
  ): Promise<NLPProcessingResult> {
    try {
      // Start with intent parsing
      const intent = await parseIntent(input);

      // Parse the navigation command
      const command = await this.parseNavigationCommand(
        input,
        language,
        modality
      );

      // Generate navigation path
      const navigationPath = this.generateNavigationPath(command, language);

      // Generate suggested actions
      const suggestedActions = this.generateSuggestedActions(
        command,
        intent,
        language
      );

      return {
        command,
        intent,
        navigationPath,
        suggestedActions,
      };
    } catch (error) {
      return {
        command: this.createFallbackCommand(input, language, modality),
        intent: { intent: "unknown", entities: {} },
        navigationPath: ["/dashboard"],
        suggestedActions: [],
        errorMessage:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Process voice command specifically
   */
  async processVoiceCommand(
    voiceCommand: VoiceCommand
  ): Promise<NLPProcessingResult> {
    if (!this.config.voiceEnabled) {
      throw new Error("Voice commands are not enabled");
    }

    if (voiceCommand.confidence < this.config.confidenceThreshold) {
      // Try alternates if available
      if (voiceCommand.alternates && voiceCommand.alternates.length > 0) {
        for (const alternate of voiceCommand.alternates) {
          try {
            return await this.processNavigationQuery(
              alternate,
              voiceCommand.language as "en" | "nl",
              "voice"
            );
          } catch {
            continue;
          }
        }
      }

      throw new Error("Voice command confidence too low");
    }

    return this.processNavigationQuery(
      voiceCommand.transcript,
      voiceCommand.language as "en" | "nl",
      "voice"
    );
  }

  /**
   * Parse navigation command from natural language
   */
  private async parseNavigationCommand(
    input: string,
    language: "en" | "nl",
    modality: "text" | "voice"
  ): Promise<NavigationCommand> {
    const patterns = NAVIGATION_PATTERNS[language];
    const normalizedInput = input.trim().toLowerCase();

    // Try each command type
    for (const [type, commandPatterns] of Object.entries(patterns)) {
      for (const pattern of commandPatterns) {
        const match = normalizedInput.match(pattern);
        if (match) {
          const action = type;
          const target = match[1] || match[2] || "";
          const parameters = this.extractParameters(match, type, language);

          return {
            type: type as NavigationCommand["type"],
            action,
            target: target.trim(),
            parameters,
            confidence: this.calculateConfidence(match, pattern),
            language,
            modality,
          };
        }
      }
    }

    // Fallback: treat as search
    return {
      type: "search",
      action: "search",
      target: normalizedInput,
      parameters: {},
      confidence: 0.3,
      language,
      modality,
    };
  }

  /**
   * Extract parameters from regex match
   */
  private extractParameters(
    match: RegExpMatchArray,
    type: string,
    language: "en" | "nl"
  ): Record<string, any> {
    const parameters: Record<string, any> = {};

    if (type === "filter" && match.length >= 3) {
      parameters.field = match[1];
      parameters.value = match[2];
    } else if (type === "analyze" && match.length >= 3) {
      parameters.metric = match[1];
      parameters.subject = match[2];
    }

    // Extract common parameters
    if (match[0]) {
      parameters.originalQuery = match[0];
      parameters.extractedTerms = this.extractKeyTerms(match[0], language);
    }

    return parameters;
  }

  /**
   * Extract key terms from query
   */
  private extractKeyTerms(query: string, language: "en" | "nl"): string[] {
    const stopWords =
      language === "en"
        ? [
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "being",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "could",
            "should",
            "may",
            "might",
            "must",
            "can",
            "go",
            "show",
            "me",
            "my",
            "i",
            "you",
            "he",
            "she",
            "it",
            "we",
            "they",
            "this",
            "that",
            "these",
            "those",
          ]
        : [
            "de",
            "het",
            "een",
            "en",
            "of",
            "maar",
            "in",
            "op",
            "bij",
            "naar",
            "voor",
            "van",
            "met",
            "door",
            "is",
            "zijn",
            "was",
            "waren",
            "ben",
            "bent",
            "geweest",
            "hebben",
            "heeft",
            "had",
            "hadden",
            "doen",
            "doet",
            "deed",
            "deden",
            "zal",
            "zou",
            "kunnen",
            "moeten",
            "mogen",
            "kan",
            "ga",
            "gaan",
            "toon",
            "laat",
            "zien",
            "mij",
            "mijn",
            "ik",
            "jij",
            "hij",
            "zij",
            "het",
            "wij",
            "jullie",
            "dit",
            "dat",
            "deze",
            "die",
          ];

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 5); // Limit to top 5 terms
  }

  /**
   * Calculate confidence score for pattern match
   */
  private calculateConfidence(
    match: RegExpMatchArray,
    pattern: RegExp
  ): number {
    let confidence = 0.7; // Base confidence

    // Boost confidence for exact matches
    if (match[0] === match.input) {
      confidence += 0.2;
    }

    // Boost confidence for longer matches
    if (match[0] && match[0].length > 10) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate navigation path from command
   */
  private generateNavigationPath(
    command: NavigationCommand,
    language: "en" | "nl"
  ): string[] {
    const mappings = PAGE_MAPPINGS[language];
    const target = command.target.toLowerCase();

    // Direct mapping
    if (mappings[target]) {
      return [mappings[target]];
    }

    // Fuzzy matching
    for (const [key, path] of Object.entries(mappings)) {
      if (target.includes(key) || key.includes(target)) {
        return [path];
      }
    }

    // Command-specific paths
    switch (command.type) {
      case "analyze":
        return ["/dashboard/analytics", "/dashboard/insights"];
      case "search":
        return ["/dashboard", "/dashboard/search"];
      case "filter":
        return ["/dashboard", "/dashboard/reports"];
      default:
        return ["/dashboard"];
    }
  }

  /**
   * Generate suggested actions based on command and intent
   */
  private generateSuggestedActions(
    command: NavigationCommand,
    intent: ParsedIntent,
    language: "en" | "nl"
  ): string[] {
    const suggestions: string[] = [];

    const texts =
      language === "en"
        ? {
            viewDashboard: "View main dashboard",
            searchResults: "Search for related content",
            filterData: "Apply filters to data",
            analyzeMetrics: "Analyze key metrics",
            exportData: "Export current data",
            customizeView: "Customize view settings",
          }
        : {
            viewDashboard: "Bekijk hoofddashboard",
            searchResults: "Zoek gerelateerde inhoud",
            filterData: "Pas filters toe op data",
            analyzeMetrics: "Analyseer belangrijke statistieken",
            exportData: "Exporteer huidige data",
            customizeView: "Pas weergave-instellingen aan",
          };

    // Intent-based suggestions
    switch (intent.intent) {
      case "sales_report":
        suggestions.push(
          texts.viewDashboard,
          texts.analyzeMetrics,
          texts.exportData
        );
        break;
      case "customer_lookup":
        suggestions.push(texts.searchResults, texts.filterData);
        break;
      case "business_analysis":
        suggestions.push(texts.analyzeMetrics, texts.customizeView);
        break;
      default:
        suggestions.push(texts.viewDashboard, texts.searchResults);
    }

    // Command-specific suggestions
    switch (command.type) {
      case "navigate":
        suggestions.push(texts.customizeView);
        break;
      case "search":
        suggestions.push(texts.filterData);
        break;
      case "analyze":
        suggestions.push(texts.exportData);
        break;
    }

    return [...new Set(suggestions)].slice(0, 4);
  }

  /**
   * Create fallback command when parsing fails
   */
  private createFallbackCommand(
    input: string,
    language: "en" | "nl",
    modality: "text" | "voice"
  ): NavigationCommand {
    return {
      type: "search",
      action: "fallback_search",
      target: input,
      parameters: { fallback: true },
      confidence: 0.1,
      language,
      modality,
    };
  }

  /**
   * Check if language is supported
   */
  isLanguageSupported(language: string): boolean {
    return this.supportedLanguages.has(language);
  }

  /**
   * Get configuration
   */
  getConfig(): NLPConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<NLPConfig>): void {
    this.config = { ...this.config, ...updates };
    this.supportedLanguages = new Set(this.config.languages);
  }

  /**
   * Enhanced intent parsing using server-side API
   */
  async parseAdvancedIntent(input: string): Promise<{
    intent: string;
    entities: Record<string, string>;
    confidence: number;
  }> {
    try {
      const response = await fetch("/api/nlp/parse-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();

      return {
        intent: result.intent || "unknown",
        entities: result.entities || {},
        confidence: 0.8, // Default confidence for API results
      };
    } catch (error) {
      console.warn("Advanced intent parsing failed, using fallback:", error);

      // Fallback to pattern-based parsing
      const command = this.processCommand(input);
      return {
        intent: command.type,
        entities: command.parameters || {},
        confidence: command.confidence,
      };
    }
  }
}
