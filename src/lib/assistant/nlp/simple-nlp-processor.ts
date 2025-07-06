/**
 * Simple Client-Safe NLP Processor
 * Task 13.4: Develop Natural Language Processing (NLP) Capabilities
 *
 * This is a simplified version that works in the browser without OpenAI dependencies
 */

export type CommandType =
  | "navigate"
  | "search"
  | "filter"
  | "analyze"
  | "command";
export type SupportedLanguage = "en" | "nl";

export interface NavigationCommand {
  type: CommandType;
  target: string;
  confidence: number;
  page?: string;
  filters?: Record<string, any>;
  parameters?: Record<string, any>;
  language: SupportedLanguage;
}

export interface NLPResult {
  command: NavigationCommand;
  navigationPath: string[];
  suggestedActions: string[];
  errorMessage?: string;
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

export class SimpleNLPProcessor {
  private language: SupportedLanguage = "en";

  constructor(language: SupportedLanguage = "en") {
    this.language = language;
  }

  /**
   * Process natural language input for navigation
   */
  processCommand(input: string): NLPResult {
    const cleanInput = input.trim().toLowerCase();

    // Try to match patterns
    const patterns = NAVIGATION_PATTERNS[this.language];
    let bestMatch: {
      type: CommandType;
      match: RegExpMatchArray;
      confidence: number;
    } | null = null;

    // Check each command type
    for (const [type, regexList] of Object.entries(patterns)) {
      for (const regex of regexList) {
        const match = cleanInput.match(regex);
        if (match) {
          const confidence = this.calculateConfidence(match, regex);
          if (!bestMatch || confidence > bestMatch.confidence) {
            bestMatch = { type: type as CommandType, match, confidence };
          }
        }
      }
    }

    if (bestMatch) {
      const command = this.createCommand(bestMatch);
      return {
        command,
        navigationPath: this.generateNavigationPath(command),
        suggestedActions: this.generateSuggestedActions(command),
      };
    }

    // Fallback command
    const fallbackCommand: NavigationCommand = {
      type: "navigate",
      target: "dashboard",
      confidence: 0.3,
      page: "/dashboard",
      language: this.language,
    };

    return {
      command: fallbackCommand,
      navigationPath: ["/dashboard"],
      suggestedActions: ["Navigate to dashboard"],
      errorMessage:
        "Could not understand the command. Defaulting to dashboard.",
    };
  }

  private createCommand(match: {
    type: CommandType;
    match: RegExpMatchArray;
    confidence: number;
  }): NavigationCommand {
    const target = match.match[match.match.length - 1] || "dashboard";
    const pageMappings = PAGE_MAPPINGS[this.language];
    const page = this.findPageMapping(target, pageMappings);

    return {
      type: match.type,
      target,
      confidence: match.confidence,
      page,
      language: this.language,
      parameters: this.extractParameters(target),
    };
  }

  private findPageMapping(
    target: string,
    mappings: Record<string, string>
  ): string {
    const cleanTarget = target.toLowerCase();

    // Direct match
    if (mappings[cleanTarget]) {
      return mappings[cleanTarget];
    }

    // Partial match
    for (const [key, value] of Object.entries(mappings)) {
      if (cleanTarget.includes(key) || key.includes(cleanTarget)) {
        return value;
      }
    }

    return "/dashboard"; // Default fallback
  }

  private extractParameters(target: string): Record<string, any> {
    const params: Record<string, any> = {};

    // Extract common parameters
    if (target.includes("filter")) {
      params.filterType = "default";
    }
    if (target.includes("search")) {
      params.searchTerm = target;
    }
    if (target.includes("date") || target.includes("time")) {
      params.timeframe = "default";
    }

    return params;
  }

  private calculateConfidence(match: RegExpMatchArray, regex: RegExp): number {
    let confidence = 0.7; // Base confidence

    // Higher confidence for longer matches
    if (match[0].length > 20) confidence += 0.1;

    // Higher confidence for multiple capture groups
    if (match.length > 2) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  private generateNavigationPath(command: NavigationCommand): string[] {
    const path = [command.page || "/dashboard"];

    // Add additional paths based on command type
    if (command.type === "filter" && command.parameters?.filterType) {
      path.push(`?filter=${command.parameters.filterType}`);
    }
    if (command.type === "search" && command.parameters?.searchTerm) {
      path.push(`?search=${encodeURIComponent(command.parameters.searchTerm)}`);
    }

    return path;
  }

  private generateSuggestedActions(command: NavigationCommand): string[] {
    const actions: string[] = [];

    switch (command.type) {
      case "navigate":
        actions.push(`Navigate to ${command.target}`);
        actions.push("View related information");
        break;
      case "search":
        actions.push(`Search for ${command.target}`);
        actions.push("View search results");
        break;
      case "filter":
        actions.push(`Apply filter: ${command.target}`);
        actions.push("Clear filters");
        break;
      case "analyze":
        actions.push(`Analyze ${command.target}`);
        actions.push("View detailed analysis");
        break;
      case "command":
        actions.push(`Execute command: ${command.target}`);
        break;
    }

    return actions;
  }

  setLanguage(language: SupportedLanguage): void {
    this.language = language;
  }

  getLanguage(): SupportedLanguage {
    return this.language;
  }
}
