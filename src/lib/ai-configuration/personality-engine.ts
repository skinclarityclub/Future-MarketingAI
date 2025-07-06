import { PersonalityProfile, SystemMessageConfig } from "./types";
import { AIConfigurationService } from "./types";

export interface PersonalityContext {
  userRole?: string;
  dashboardPage?: string;
  timeOfDay?: "morning" | "afternoon" | "evening";
  isFirstVisit?: boolean;
  conversationLength?: number;
  userQuestion?: string;
  previousInteractions?: string[];
}

export interface AdaptedPrompt {
  systemMessage: string;
  personalityModifier: string;
  contextualAdditions: string;
  responseGuidelines: string;
}

export interface ContextAnalysis {
  contextSummary: string;
  adaptationSuggestions: string[];
  detectedContext: PersonalityContext;
  confidence: number;
}

export class PersonalityEngine {
  private configService: AIConfigurationService;
  private activeProfile: PersonalityProfile | null = null;
  private systemMessages: SystemMessageConfig[] = [];

  constructor() {
    this.configService = new AIConfigurationService();
    this.initializeEngine();
  }

  private async initializeEngine() {
    try {
      // Load active personality profile and system messages
      const [profiles, messages, activeProfileId] = await Promise.all([
        this.configService.getPersonalityProfiles(),
        this.configService.getSystemMessages(),
        this.configService.getActivePersonalityProfile(),
      ]);

      this.activeProfile =
        profiles.find(p => p.id === activeProfileId) || profiles[0] || null;
      this.systemMessages = messages;
    } catch (error) {
      console.warn("Failed to initialize personality engine:", error);
      // Fall back to default behavior
      this.activeProfile = null;
      this.systemMessages = [];
    }
  }

  /**
   * Main method to adapt a system prompt based on personality and context
   */
  async adaptPrompt(
    basePrompt: string,
    context: PersonalityContext = {}
  ): Promise<AdaptedPrompt> {
    // Ensure engine is initialized
    if (!this.activeProfile) {
      await this.initializeEngine();
    }

    if (!this.activeProfile) {
      return {
        systemMessage: basePrompt,
        personalityModifier: "",
        contextualAdditions: "",
        responseGuidelines: "",
      };
    }

    const personalityModifier = this.generatePersonalityModifier();
    const contextualAdditions = this.generateContextualAdditions(context);
    const responseGuidelines = this.generateResponseGuidelines(context);
    const systemMessage = this.buildSystemMessage(basePrompt, context);

    return {
      systemMessage,
      personalityModifier,
      contextualAdditions,
      responseGuidelines,
    };
  }

  /**
   * Generate personality-specific modifications to the prompt
   */
  private generatePersonalityModifier(): string {
    if (!this.activeProfile) return "";

    const modifiers: string[] = [];

    // Tone modifications
    switch (this.activeProfile.tone) {
      case "friendly":
        modifiers.push("Gebruik een vriendelijke en warme toon");
        break;
      case "professional":
        modifiers.push("Houdt een professionele en zakelijke toon aan");
        break;
      case "casual":
        modifiers.push("Communiceer op een informele en ontspannen manier");
        break;
      case "authoritative":
        modifiers.push("Spreek met autoriteit en vertrouwen");
        break;
      case "empathetic":
        modifiers.push("Toon empathie en begrip in je reacties");
        break;
    }

    // Style modifications
    switch (this.activeProfile.style) {
      case "concise":
        modifiers.push("Houd antwoorden kort en bondig");
        break;
      case "detailed":
        modifiers.push("Geef uitgebreide en gedetailleerde uitleg");
        break;
      case "conversational":
        modifiers.push(
          "Gebruik een conversationele stijl alsof je met een collega praat"
        );
        break;
      case "technical":
        modifiers.push(
          "Gebruik technische terminologie en ga diep in op details"
        );
        break;
      case "creative":
        modifiers.push("Wees creatief en gebruik metaforen waar gepast");
        break;
    }

    // Formality modifications
    switch (this.activeProfile.formality) {
      case "formal":
        modifiers.push(
          "Gebruik formele bewoordingen en spreek gebruikers aan met 'u'"
        );
        break;
      case "informal":
        modifiers.push(
          "Gebruik informele bewoordingen en spreek gebruikers aan met 'je'"
        );
        break;
      case "semi-formal":
        modifiers.push(
          "Gebruik een semi-formele toon die professioneel maar toegankelijk is"
        );
        break;
    }

    // Verbosity modifications
    switch (this.activeProfile.verbosity) {
      case "brief":
        modifiers.push("Geef korte, to-the-point antwoorden");
        break;
      case "moderate":
        modifiers.push("Geef balanced antwoorden met essentiële informatie");
        break;
      case "verbose":
        modifiers.push(
          "Geef uitgebreide antwoorden met veel context en voorbeelden"
        );
        break;
    }

    // Emotional tone modifications
    switch (this.activeProfile.emotionalTone) {
      case "enthusiastic":
        modifiers.push("Toon enthousiasme en energie in je reacties");
        break;
      case "calm":
        modifiers.push("Behoud een kalme en bedachtzame toon");
        break;
      case "energetic":
        modifiers.push("Wees energiek en dynamisch in je communicatie");
        break;
      case "neutral":
        modifiers.push("Houdt een neutrale en objectieve toon aan");
        break;
    }

    // Technical level modifications
    switch (this.activeProfile.technicalLevel) {
      case "beginner":
        modifiers.push("Leg technische concepten uit in eenvoudige termen");
        break;
      case "intermediate":
        modifiers.push("Gebruik matig technische taal met uitleg waar nodig");
        break;
      case "expert":
        modifiers.push(
          "Gebruik technische terminologie en ga ervan uit dat de gebruiker expertise heeft"
        );
        break;
    }

    // Add custom prompt additions
    if (this.activeProfile.customPromptAdditions) {
      modifiers.push(this.activeProfile.customPromptAdditions);
    }

    return modifiers.join(". ") + ".";
  }

  /**
   * Generate context-specific additions to the prompt
   */
  private generateContextualAdditions(context: PersonalityContext): string {
    if (!this.activeProfile) return "";

    const additions: string[] = [];

    // Dashboard context adaptations
    if (context.dashboardPage && this.activeProfile.dashboardContext) {
      const pageContext =
        this.activeProfile.dashboardContext[
          context.dashboardPage as keyof typeof this.activeProfile.dashboardContext
        ];

      if (pageContext) {
        if (pageContext.emphasizeMetrics) {
          additions.push("Focus extra op belangrijke metrics en KPI's");
        }
        if (pageContext.focusOnInsights) {
          additions.push("Geef prioriteit aan actionable insights");
        }
        if (pageContext.suggestActions) {
          additions.push("Stel concrete acties voor waar mogelijk");
        }
        if (pageContext.includeContext) {
          additions.push("Geef relevante context bij data-interpretaties");
        }
      }
    }

    // Time-based adaptations
    if (context.timeOfDay) {
      switch (context.timeOfDay) {
        case "morning":
          additions.push(
            "Houdt rekening met dat het ochtend is - wees energiek en vooruitkijkend"
          );
          break;
        case "afternoon":
          additions.push(
            "Het is middag - focus op productiviteit en voortgang"
          );
          break;
        case "evening":
          additions.push("Het is avond - focus op samenvatting en reflectie");
          break;
      }
    }

    // First visit adaptations
    if (context.isFirstVisit) {
      additions.push(
        "Dit is mogelijk een eerste bezoek - wees extra behulpzaam en leg uit hoe je kunt helpen"
      );
    }

    // Conversation length adaptations
    if (context.conversationLength) {
      if (context.conversationLength > 10) {
        additions.push(
          "Dit is al een lange conversatie - wees beknopter tenzij uitgebreide uitleg nodig is. Continue the conversation efficiently"
        );
      } else if (context.conversationLength === 1) {
        additions.push(
          "Dit is het begin van de conversatie - geef een warme welkom"
        );
      }
    }

    return additions.length > 0 ? additions.join(". ") + "." : "";
  }

  /**
   * Generate response guidelines based on personality and context
   */
  private generateResponseGuidelines(context: PersonalityContext): string {
    if (!this.activeProfile) return "";

    const guidelines: string[] = [];

    // Always include basic response structure
    guidelines.push(
      "Structureer je antwoord logisch met duidelijke kopjes waar nodig"
    );

    // Add personality-specific guidelines
    if (this.activeProfile.tone === "friendly") {
      guidelines.push(
        "Gebruik waar gepast emoji's en een persoonlijke benadering"
      );
    }

    if (this.activeProfile.style === "technical") {
      guidelines.push("Geef technische details en methodologie uitleg");
    }

    if (this.activeProfile.technicalLevel === "expert") {
      guidelines.push("Gebruik vakjargon en ga diep in op technische aspecten");
    } else if (this.activeProfile.technicalLevel === "beginner") {
      guidelines.push("Vermijd jargon en geef stap-voor-stap uitleg");
    }

    // Context-specific guidelines
    if (context.userRole === "executive") {
      guidelines.push(
        "Focus op high-level insights en strategische implicaties"
      );
    } else if (context.userRole === "analyst") {
      guidelines.push("Geef gedetailleerde data-analyse en methodologie");
    }

    return guidelines.join(". ") + ".";
  }

  /**
   * Build the complete system message with personality and context
   */
  private buildSystemMessage(
    basePrompt: string,
    context: PersonalityContext
  ): string {
    const contextMessage = this.getContextualSystemMessage(context);
    const personalityModifier = this.generatePersonalityModifier();
    const contextualAdditions = this.generateContextualAdditions(context);
    const responseGuidelines = this.generateResponseGuidelines(context);

    const systemParts = [
      contextMessage || basePrompt,
      personalityModifier,
      contextualAdditions,
      responseGuidelines,
    ].filter(Boolean);

    return systemParts.join("\n\n");
  }

  /**
   * Get the appropriate system message for the current context
   */
  private getContextualSystemMessage(context: PersonalityContext): string {
    if (!this.systemMessages.length) return "";

    // Find the most appropriate system message
    let selectedMessage = this.systemMessages.find(
      msg => msg.enabled && msg.context === "general"
    );

    // Context-specific message selection
    if (context.dashboardPage) {
      const dashboardMessage = this.systemMessages.find(
        msg => msg.enabled && msg.context === "dashboard"
      );
      if (dashboardMessage) selectedMessage = dashboardMessage;
    }

    if (context.isFirstVisit) {
      const welcomeMessage = this.systemMessages.find(
        msg => msg.enabled && msg.context === "welcome"
      );
      if (welcomeMessage) selectedMessage = welcomeMessage;
    }

    return selectedMessage?.content || "";
  }

  /**
   * Update the active personality profile
   */
  async setActiveProfile(profileId: string): Promise<void> {
    try {
      const profiles = await this.configService.getPersonalityProfiles();
      this.activeProfile = profiles.find(p => p.id === profileId) || null;
    } catch (error) {
      console.error("Failed to set active profile:", error);
    }
  }

  /**
   * Get the current active personality profile
   */
  getActiveProfile(): PersonalityProfile | null {
    return this.activeProfile;
  }

  /**
   * Get the current personality profile with fallback to default
   */
  async getCurrentPersonalityProfile(): Promise<PersonalityProfile> {
    try {
      // Ensure engine is initialized
      if (!this.activeProfile) {
        await this.initializeEngine();
      }

      // Return active profile or fallback to default
      if (this.activeProfile) {
        return this.activeProfile;
      }
    } catch (error) {
      console.warn("Failed to get active profile, using fallback:", error);
    }

    // Fallback to default professional profile
    return {
      id: "professional-business-analyst",
      name: "Professional Business Analyst",
      description: "Default professional profile for business intelligence",
      tone: "professional",
      style: "detailed",
      formality: "semi-formal",
      verbosity: "moderate",
      emotionalTone: "neutral",
      technicalLevel: "expert",
      customPromptAdditions: "Focus on KPIs and business metrics",
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      isDefault: true,
      isActive: true,
    };
  }

  /**
   * Analyze user context and return analysis (overloaded version for tests)
   */
  async analyzeUserContext(
    context: PersonalityContext
  ): Promise<ContextAnalysis>;
  /**
   * Analyze user input to extract context hints (legacy version)
   */
  analyzeUserContext(
    userInput: string,
    previousContext?: PersonalityContext
  ): PersonalityContext;
  /**
   * Implementation
   */
  analyzeUserContext(
    contextOrInput: PersonalityContext | string,
    previousContext?: PersonalityContext
  ): PersonalityContext | Promise<ContextAnalysis> {
    // Handle overloaded calls
    if (typeof contextOrInput === "object") {
      // New async version for tests
      return this.analyzeContextObject(contextOrInput);
    } else {
      // Legacy string-based version
      return this.analyzeUserInput(contextOrInput, previousContext);
    }
  }

  /**
   * Analyze a context object and return detailed analysis
   */
  private async analyzeContextObject(
    context: PersonalityContext
  ): Promise<ContextAnalysis> {
    const summaryParts: string[] = [];
    const adaptationSuggestions: string[] = [];
    let confidence = 0.5; // Default confidence

    // Analyze user role
    if (context.userRole) {
      summaryParts.push(`User role detected as ${context.userRole}`);
      adaptationSuggestions.push(`Adapt tone for ${context.userRole} context`);
      confidence += 0.2;
    }

    // Analyze dashboard page
    if (context.dashboardPage) {
      summaryParts.push(`Dashboard context: ${context.dashboardPage}`);
      adaptationSuggestions.push(`Focus on ${context.dashboardPage} metrics`);
      confidence += 0.15;
    }

    // Analyze time of day
    if (context.timeOfDay) {
      summaryParts.push(`Time context: ${context.timeOfDay}`);
      adaptationSuggestions.push(`Adjust greeting for ${context.timeOfDay}`);
      confidence += 0.1;
    }

    // Analyze conversation length
    if (context.conversationLength) {
      if (context.conversationLength === 1) {
        summaryParts.push("First interaction in conversation");
        adaptationSuggestions.push("Provide welcoming introduction");
      } else if (context.conversationLength > 5) {
        summaryParts.push("Extended conversation detected");
        adaptationSuggestions.push("Maintain context awareness");
      }
      confidence += 0.05;
    }

    // Analyze user question
    if (context.userQuestion) {
      summaryParts.push("User question provided for context");
      confidence += 0.1;
    }

    const contextSummary =
      summaryParts.length > 0
        ? summaryParts.join(". ")
        : "Basic context detected";

    return {
      contextSummary,
      adaptationSuggestions,
      detectedContext: context,
      confidence: Math.min(confidence, 1.0),
    };
  }

  /**
   * Analyze user input to extract context hints (legacy method)
   */
  private analyzeUserInput(
    userInput: string,
    previousContext?: PersonalityContext
  ): PersonalityContext {
    const context: PersonalityContext = { ...previousContext };

    // Detect time references
    const timeRegex = /\b(ochtend|middag|avond|morning|afternoon|evening)\b/i;
    const timeMatch = userInput.match(timeRegex);
    if (timeMatch) {
      const time = timeMatch[1].toLowerCase();
      if (time.includes("ochtend") || time.includes("morning")) {
        context.timeOfDay = "morning";
      } else if (time.includes("middag") || time.includes("afternoon")) {
        context.timeOfDay = "afternoon";
      } else if (time.includes("avond") || time.includes("evening")) {
        context.timeOfDay = "evening";
      }
    } else {
      // Detect time based on current time
      const hour = new Date().getHours();
      if (hour < 12) {
        context.timeOfDay = "morning";
      } else if (hour < 18) {
        context.timeOfDay = "afternoon";
      } else {
        context.timeOfDay = "evening";
      }
    }

    // Detect dashboard references
    const dashboardKeywords = {
      executive: /\b(executive|management|ceo|director|leiderschap)\b/i,
      customer: /\b(customer|klant|client|retention|churn)\b/i,
      marketing: /\b(marketing|campagne|ads|social|meta|google)\b/i,
      financial: /\b(financial|financieel|revenue|omzet|costs|kosten)\b/i,
    };

    for (const [page, regex] of Object.entries(dashboardKeywords)) {
      if (regex.test(userInput)) {
        context.dashboardPage = page;
        break;
      }
    }

    // Update conversation length
    context.conversationLength = (context.conversationLength || 0) + 1;

    return context;
  }
}

// Singleton instance
let personalityEngineInstance: PersonalityEngine | null = null;

export function getPersonalityEngine(): PersonalityEngine {
  if (!personalityEngineInstance) {
    personalityEngineInstance = new PersonalityEngine();
  }
  return personalityEngineInstance;
}
