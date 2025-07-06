/**
 * User Behavior Prediction System
 * Advanced ML system for predicting user needs and preferences
 * Task 18.3: Implement Machine Learning for User Behavior Prediction
 */

import { ContextRetentionEngine } from "../context/context-retention-engine";
import type { ConversationEntry, SessionMemory } from "../context/types";

// ML Prediction Interfaces
export interface BehaviorPrediction {
  predictedAction: string;
  confidence: number;
  reasoning: string[];
  suggestedResponse?: string;
  category:
    | "query_type"
    | "content_preference"
    | "interaction_pattern"
    | "timing_pattern";
  timeframe: "immediate" | "short_term" | "long_term";
  metadata: Record<string, any>;
}

export interface UserBehaviorModel {
  userId: string;
  queryPatterns: QueryPattern[];
  interactionPatterns: InteractionPattern[];
  preferenceWeights: PreferenceWeights;
  temporalPatterns: TemporalPattern[];
  expertiseLevel: ExpertiseLevel;
  communicationStyle: CommunicationStyle;
  businessFocus: string[];
  lastModelUpdate: Date;
  modelVersion: string;
  accuracy: number;
}

export interface QueryPattern {
  pattern: string;
  frequency: number;
  contextTags: string[];
  followUpQueries: string[];
  successRate: number;
  averageConfidence: number;
  timeOfDay: number[];
  dayOfWeek: number[];
}

export interface InteractionPattern {
  type: "sequence" | "cycle" | "branching" | "exploratory";
  trigger: string;
  sequence: string[];
  probability: number;
  conditions: Record<string, any>;
  outcomes: string[];
}

export interface PreferenceWeights {
  conciseness: number; // -1 (detailed) to 1 (brief)
  technicalDepth: number; // 0 (basic) to 1 (expert)
  visualPreference: number; // 0 (text) to 1 (visual)
  analysisDepth: number; // 0 (surface) to 1 (deep)
  responseSpeed: number; // 0 (accuracy) to 1 (speed)
  proactivity: number; // 0 (reactive) to 1 (proactive)
}

export interface TemporalPattern {
  timeWindow: "hour" | "day" | "week" | "month";
  peak: number;
  variance: number;
  patterns: Array<{
    time: number;
    activity: number;
    queryTypes: string[];
  }>;
}

export interface ExpertiseLevel {
  overall: number; // 0-1 scale
  domains: Record<string, number>;
  learningRate: number;
  adaptability: number;
}

export interface CommunicationStyle {
  formality: number; // 0 (casual) to 1 (formal)
  directness: number; // 0 (indirect) to 1 (direct)
  emotionalTone: number; // 0 (neutral) to 1 (expressive)
  questioningStyle: number; // 0 (broad) to 1 (specific)
}

export interface BehaviorPredictionContext {
  currentSession: SessionMemory;
  recentQueries: string[];
  timeContext: {
    hour: number;
    dayOfWeek: number;
    timeInSession: number;
  };
  environmentContext: Record<string, any>;
}

// Main Behavior Prediction Engine
export class UserBehaviorPredictionEngine {
  private static instance: UserBehaviorPredictionEngine;
  private contextEngine: ContextRetentionEngine;
  private userModels: Map<string, UserBehaviorModel> = new Map();
  private predictionCache: Map<string, BehaviorPrediction[]> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MODEL_UPDATE_THRESHOLD = 10; // Update model after 10 new interactions

  private constructor() {
    this.contextEngine = ContextRetentionEngine.getInstance();
  }

  public static getInstance(): UserBehaviorPredictionEngine {
    if (!UserBehaviorPredictionEngine.instance) {
      UserBehaviorPredictionEngine.instance =
        new UserBehaviorPredictionEngine();
    }
    return UserBehaviorPredictionEngine.instance;
  }

  /**
   * Generate predictions for user behavior based on historical data
   */
  async predictUserBehavior(
    userId: string,
    context: BehaviorPredictionContext,
    predictionTypes: BehaviorPrediction["category"][] = [
      "query_type",
      "content_preference",
    ]
  ): Promise<BehaviorPrediction[]> {
    const cacheKey = `${userId}-${JSON.stringify(predictionTypes)}-${Date.now()}`;

    // Check cache first
    const cached = this.predictionCache.get(cacheKey);
    if (cached) return cached;

    try {
      // Get or create user behavior model
      const userModel = await this.getUserBehaviorModel(userId);

      const predictions: BehaviorPrediction[] = [];

      // Generate predictions for each requested type
      for (const type of predictionTypes) {
        switch (type) {
          case "query_type":
            predictions.push(
              ...(await this.predictQueryType(userModel, context))
            );
            break;
          case "content_preference":
            predictions.push(
              ...(await this.predictContentPreference(userModel, context))
            );
            break;
          case "interaction_pattern":
            predictions.push(
              ...(await this.predictInteractionPattern(userModel, context))
            );
            break;
          case "timing_pattern":
            predictions.push(
              ...(await this.predictTimingPattern(userModel, context))
            );
            break;
        }
      }

      // Sort by confidence
      predictions.sort((a, b) => b.confidence - a.confidence);

      // Cache results
      this.predictionCache.set(cacheKey, predictions);
      setTimeout(() => this.predictionCache.delete(cacheKey), this.CACHE_TTL);

      return predictions;
    } catch (error) {
      console.error("Error predicting user behavior:", error);
      return [];
    }
  }

  /**
   * Update user behavior model with new interaction data
   */
  async updateUserModel(
    userId: string,
    conversationEntry: ConversationEntry,
    sessionMemory: SessionMemory
  ): Promise<void> {
    try {
      const userModel = await this.getUserBehaviorModel(userId);

      // Update query patterns
      await this.updateQueryPatterns(userModel, conversationEntry);

      // Update interaction patterns
      await this.updateInteractionPatterns(
        userModel,
        conversationEntry,
        sessionMemory
      );

      // Update preference weights
      await this.updatePreferenceWeights(userModel, conversationEntry);

      // Update temporal patterns
      await this.updateTemporalPatterns(userModel, conversationEntry);

      // Update expertise level
      await this.updateExpertiseLevel(userModel, conversationEntry);

      // Update communication style
      await this.updateCommunicationStyle(userModel, conversationEntry);

      // Increment interaction count and check if model needs retraining
      userModel.lastModelUpdate = new Date();

      // Store updated model
      this.userModels.set(userId, userModel);

      // Persist to database if significant changes
      await this.persistUserModel(userModel);
    } catch (error) {
      console.error("Error updating user model:", error);
    }
  }

  /**
   * Get recommended response style based on user behavior
   */
  async getRecommendedResponseStyle(userId: string): Promise<{
    style: string;
    reasoning: string[];
    confidence: number;
  }> {
    const userModel = await this.getUserBehaviorModel(userId);
    const reasoning: string[] = [];
    let style = "balanced";
    let confidence = 0.5;

    // Analyze preference weights
    if (userModel.preferenceWeights.conciseness > 0.3) {
      style = "concise";
      reasoning.push("User prefers brief responses");
      confidence += 0.2;
    } else if (userModel.preferenceWeights.conciseness < -0.3) {
      style = "detailed";
      reasoning.push("User prefers comprehensive explanations");
      confidence += 0.2;
    }

    if (userModel.preferenceWeights.technicalDepth > 0.6) {
      style += "-technical";
      reasoning.push("User demonstrates high technical expertise");
      confidence += 0.1;
    }

    if (userModel.preferenceWeights.visualPreference > 0.5) {
      style += "-visual";
      reasoning.push("User prefers visual representations");
      confidence += 0.1;
    }

    return { style, reasoning, confidence: Math.min(confidence, 1.0) };
  }

  /**
   * Predict likely follow-up questions
   */
  async predictFollowUpQuestions(
    userId: string,
    currentQuery: string,
    context: BehaviorPredictionContext
  ): Promise<string[]> {
    const userModel = await this.getUserBehaviorModel(userId);
    const followUps: string[] = [];

    // Find similar query patterns
    const similarPatterns = userModel.queryPatterns.filter(
      pattern =>
        this.calculateStringSimilarity(pattern.pattern, currentQuery) > 0.6
    );

    // Extract follow-up questions from similar patterns
    for (const pattern of similarPatterns) {
      followUps.push(...pattern.followUpQueries);
    }

    // Use interaction patterns to predict sequence continuations
    const applicablePatterns = userModel.interactionPatterns.filter(pattern =>
      pattern.sequence.some(
        step => this.calculateStringSimilarity(step, currentQuery) > 0.7
      )
    );

    for (const pattern of applicablePatterns) {
      const currentIndex = pattern.sequence.findIndex(
        step => this.calculateStringSimilarity(step, currentQuery) > 0.7
      );

      if (currentIndex !== -1 && currentIndex < pattern.sequence.length - 1) {
        followUps.push(pattern.sequence[currentIndex + 1]);
      }
    }

    // Remove duplicates and return top predictions
    return Array.from(new Set(followUps)).slice(0, 5);
  }

  /**
   * Get personalized dashboard recommendations
   */
  async getPersonalizedRecommendations(
    userId: string,
    context: BehaviorPredictionContext
  ): Promise<{
    dashboardWidgets: string[];
    chartTypes: string[];
    dataFilters: Record<string, any>;
    reportTemplates: string[];
  }> {
    const userModel = await this.getUserBehaviorModel(userId);

    return {
      dashboardWidgets: this.recommendDashboardWidgets(userModel),
      chartTypes: this.recommendChartTypes(userModel),
      dataFilters: this.recommendDataFilters(userModel),
      reportTemplates: this.recommendReportTemplates(userModel),
    };
  }

  // Private helper methods
  private async getUserBehaviorModel(
    userId: string
  ): Promise<UserBehaviorModel> {
    if (this.userModels.has(userId)) {
      return this.userModels.get(userId)!;
    }

    // Create new model
    const newModel = await this.createNewUserModel(userId);
    this.userModels.set(userId, newModel);
    return newModel;
  }

  private async createNewUserModel(userId: string): Promise<UserBehaviorModel> {
    // Get user's historical data to bootstrap the model
    const userProfile = await this.contextEngine.getUserProfile(userId);

    const model: UserBehaviorModel = {
      userId,
      queryPatterns: [],
      interactionPatterns: [],
      preferenceWeights: {
        conciseness: 0,
        technicalDepth: 0,
        visualPreference: 0,
        analysisDepth: 0,
        responseSpeed: 0,
        proactivity: 0,
      },
      temporalPatterns: [],
      expertiseLevel: {
        overall: 0.3,
        domains: {},
        learningRate: 0.5,
        adaptability: 0.5,
      },
      communicationStyle: {
        formality: 0.5,
        directness: 0.5,
        emotionalTone: 0.3,
        questioningStyle: 0.5,
      },
      businessFocus: userProfile?.businessFocus || [],
      lastModelUpdate: new Date(),
      modelVersion: "1.0.0",
      accuracy: 0.5,
    };

    return model;
  }

  private async predictQueryType(
    userModel: UserBehaviorModel,
    context: BehaviorPredictionContext
  ): Promise<BehaviorPrediction[]> {
    const predictions: BehaviorPrediction[] = [];

    // Basic prediction based on time patterns
    const currentHour = context.timeContext.hour;

    // Find patterns that match current time context
    const relevantPatterns = userModel.queryPatterns.filter(pattern =>
      pattern.timeOfDay.includes(currentHour)
    );

    // Generate predictions based on patterns
    for (const pattern of relevantPatterns.slice(0, 3)) {
      predictions.push({
        predictedAction: `User likely to ask about: ${pattern.pattern}`,
        confidence: pattern.successRate * 0.8,
        reasoning: [
          `Pattern matches current time context`,
          `Historical success rate: ${(pattern.successRate * 100).toFixed(1)}%`,
          `Frequency: ${pattern.frequency} times`,
        ],
        category: "query_type",
        timeframe: "immediate",
        metadata: {
          pattern: pattern.pattern,
          frequency: pattern.frequency,
          contextTags: pattern.contextTags,
        },
      });
    }

    return predictions;
  }

  private async predictContentPreference(
    userModel: UserBehaviorModel,
    context: BehaviorPredictionContext
  ): Promise<BehaviorPrediction[]> {
    const predictions: BehaviorPrediction[] = [];

    // Predict preferred content types based on preference weights
    if (userModel.preferenceWeights.visualPreference > 0.5) {
      predictions.push({
        predictedAction:
          "User prefers visual content (charts, graphs, dashboards)",
        confidence: userModel.preferenceWeights.visualPreference,
        reasoning: [
          "High visual preference weight",
          "Historical preference for charts",
        ],
        category: "content_preference",
        timeframe: "immediate",
        metadata: { preferredContentType: "visual" },
      });
    }

    if (userModel.preferenceWeights.technicalDepth > 0.6) {
      predictions.push({
        predictedAction: "User prefers detailed technical explanations",
        confidence: userModel.preferenceWeights.technicalDepth,
        reasoning: [
          "High technical depth preference",
          "Demonstrated technical expertise",
        ],
        category: "content_preference",
        timeframe: "immediate",
        metadata: { preferredContentType: "technical" },
      });
    }

    return predictions;
  }

  private async predictInteractionPattern(
    userModel: UserBehaviorModel,
    context: BehaviorPredictionContext
  ): Promise<BehaviorPrediction[]> {
    return []; // Basic implementation
  }

  private async predictTimingPattern(
    userModel: UserBehaviorModel,
    context: BehaviorPredictionContext
  ): Promise<BehaviorPrediction[]> {
    return []; // Basic implementation
  }

  // Model update methods
  private async updateQueryPatterns(
    userModel: UserBehaviorModel,
    conversationEntry: ConversationEntry
  ): Promise<void> {
    const query = conversationEntry.userQuery.toLowerCase();
    const existingPattern = userModel.queryPatterns.find(
      p => this.calculateStringSimilarity(p.pattern, query) > 0.8
    );

    if (existingPattern) {
      // Update existing pattern
      existingPattern.frequency++;
      existingPattern.averageConfidence =
        (existingPattern.averageConfidence + conversationEntry.confidence) / 2;

      // Update time patterns
      const hour = conversationEntry.timestamp.getHours();
      const dayOfWeek = conversationEntry.timestamp.getDay();

      if (!existingPattern.timeOfDay.includes(hour)) {
        existingPattern.timeOfDay.push(hour);
      }
      if (!existingPattern.dayOfWeek.includes(dayOfWeek)) {
        existingPattern.dayOfWeek.push(dayOfWeek);
      }
    } else {
      // Create new pattern
      const newPattern: QueryPattern = {
        pattern: query,
        frequency: 1,
        contextTags: await this.extractContextTags(conversationEntry),
        followUpQueries: [],
        successRate: conversationEntry.confidence,
        averageConfidence: conversationEntry.confidence,
        timeOfDay: [conversationEntry.timestamp.getHours()],
        dayOfWeek: [conversationEntry.timestamp.getDay()],
      };

      userModel.queryPatterns.push(newPattern);
    }

    // Limit the number of patterns to prevent memory bloat
    if (userModel.queryPatterns.length > 100) {
      userModel.queryPatterns.sort((a, b) => b.frequency - a.frequency);
      userModel.queryPatterns = userModel.queryPatterns.slice(0, 100);
    }
  }

  private async updateInteractionPatterns(
    userModel: UserBehaviorModel,
    conversationEntry: ConversationEntry,
    sessionMemory: SessionMemory
  ): Promise<void> {
    // Analyze conversation flow within session
    const sessionQueries = await this.getSessionQueries(
      sessionMemory.sessionId
    );

    if (sessionQueries.length >= 2) {
      const sequence = sessionQueries.map(q => q.userQuery.toLowerCase());

      // Look for existing similar sequences
      const similarPattern = userModel.interactionPatterns.find(
        pattern =>
          this.calculateSequenceSimilarity(pattern.sequence, sequence) > 0.7
      );

      if (similarPattern) {
        similarPattern.probability = Math.min(
          similarPattern.probability + 0.1,
          1.0
        );
      } else {
        // Create new interaction pattern
        const newPattern: InteractionPattern = {
          type: this.classifyInteractionType(sequence),
          trigger: sequence[0],
          sequence: sequence,
          probability: 0.3,
          conditions: {
            sessionLength: sessionQueries.length,
            timeOfDay: conversationEntry.timestamp.getHours(),
          },
          outcomes: [conversationEntry.assistantResponse],
        };

        userModel.interactionPatterns.push(newPattern);
      }
    }
  }

  private async updatePreferenceWeights(
    userModel: UserBehaviorModel,
    conversationEntry: ConversationEntry
  ): Promise<void> {
    const query = conversationEntry.userQuery.toLowerCase();
    const response = conversationEntry.assistantResponse.toLowerCase();

    // Update conciseness preference
    if (
      query.includes("brief") ||
      query.includes("quick") ||
      query.includes("summary")
    ) {
      userModel.preferenceWeights.conciseness = Math.min(
        userModel.preferenceWeights.conciseness + 0.1,
        1.0
      );
    } else if (
      query.includes("detail") ||
      query.includes("explain") ||
      query.includes("comprehensive")
    ) {
      userModel.preferenceWeights.conciseness = Math.max(
        userModel.preferenceWeights.conciseness - 0.1,
        -1.0
      );
    }

    // Update technical depth preference
    const technicalTerms = [
      "algorithm",
      "api",
      "database",
      "optimization",
      "correlation",
      "regression",
    ];
    const technicalCount = technicalTerms.filter(
      term => query.includes(term) || response.includes(term)
    ).length;

    if (technicalCount > 0) {
      userModel.preferenceWeights.technicalDepth = Math.min(
        userModel.preferenceWeights.technicalDepth + technicalCount * 0.05,
        1.0
      );
    }

    // Update visual preference
    if (
      query.includes("chart") ||
      query.includes("graph") ||
      query.includes("visual")
    ) {
      userModel.preferenceWeights.visualPreference = Math.min(
        userModel.preferenceWeights.visualPreference + 0.1,
        1.0
      );
    }
  }

  private async updateTemporalPatterns(
    userModel: UserBehaviorModel,
    conversationEntry: ConversationEntry
  ): Promise<void> {
    const hour = conversationEntry.timestamp.getHours();
    const dayOfWeek = conversationEntry.timestamp.getDay();

    // Update hourly patterns
    let hourlyPattern = userModel.temporalPatterns.find(
      p => p.timeWindow === "hour"
    );
    if (!hourlyPattern) {
      hourlyPattern = {
        timeWindow: "hour",
        peak: hour,
        variance: 0,
        patterns: [],
      };
      userModel.temporalPatterns.push(hourlyPattern);
    }

    // Update or add pattern for this hour
    const existingHourPattern = hourlyPattern.patterns.find(
      p => p.time === hour
    );
    if (existingHourPattern) {
      existingHourPattern.activity = Math.min(
        existingHourPattern.activity + 0.1,
        1.0
      );
      const queryType = this.classifyQueryType(conversationEntry.userQuery);
      if (!existingHourPattern.queryTypes.includes(queryType)) {
        existingHourPattern.queryTypes.push(queryType);
      }
    } else {
      hourlyPattern.patterns.push({
        time: hour,
        activity: 0.1,
        queryTypes: [this.classifyQueryType(conversationEntry.userQuery)],
      });
    }
  }

  private async updateExpertiseLevel(
    userModel: UserBehaviorModel,
    conversationEntry: ConversationEntry
  ): Promise<void> {
    const query = conversationEntry.userQuery.toLowerCase();
    const domains = this.extractDomains(query);

    // Update domain-specific expertise
    for (const domain of domains) {
      if (!userModel.expertiseLevel.domains[domain]) {
        userModel.expertiseLevel.domains[domain] = 0.1;
      }

      // Increase expertise based on query complexity and confidence
      const complexityScore = this.calculateQueryComplexity(query);
      const expertiseIncrease =
        complexityScore * conversationEntry.confidence * 0.05;

      userModel.expertiseLevel.domains[domain] = Math.min(
        userModel.expertiseLevel.domains[domain] + expertiseIncrease,
        1.0
      );
    }

    // Update overall expertise as average of domain expertise
    const domainScores = Object.values(userModel.expertiseLevel.domains);
    if (domainScores.length > 0) {
      userModel.expertiseLevel.overall =
        domainScores.reduce((sum, score) => sum + score, 0) /
        domainScores.length;
    }
  }

  private async updateCommunicationStyle(
    userModel: UserBehaviorModel,
    conversationEntry: ConversationEntry
  ): Promise<void> {
    const query = conversationEntry.userQuery;

    // Analyze formality
    const formalWords = ["please", "could you", "would you", "kindly"];
    const casualWords = ["hey", "can you", "show me", "what's"];

    const formalCount = formalWords.filter(word =>
      query.toLowerCase().includes(word)
    ).length;
    const casualCount = casualWords.filter(word =>
      query.toLowerCase().includes(word)
    ).length;

    if (formalCount > casualCount) {
      userModel.communicationStyle.formality = Math.min(
        userModel.communicationStyle.formality + 0.05,
        1.0
      );
    } else if (casualCount > formalCount) {
      userModel.communicationStyle.formality = Math.max(
        userModel.communicationStyle.formality - 0.05,
        0.0
      );
    }

    // Analyze directness
    if (
      query.startsWith("what") ||
      query.startsWith("how") ||
      query.startsWith("show")
    ) {
      userModel.communicationStyle.directness = Math.min(
        userModel.communicationStyle.directness + 0.05,
        1.0
      );
    }
  }

  // Utility methods
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateSequenceSimilarity(seq1: string[], seq2: string[]): number {
    if (seq1.length === 0 && seq2.length === 0) return 1.0;
    if (seq1.length === 0 || seq2.length === 0) return 0.0;

    let matches = 0;
    const maxLength = Math.max(seq1.length, seq2.length);

    for (let i = 0; i < Math.min(seq1.length, seq2.length); i++) {
      if (this.calculateStringSimilarity(seq1[i], seq2[i]) > 0.8) {
        matches++;
      }
    }

    return matches / maxLength;
  }

  private classifyInteractionType(
    sequence: string[]
  ): InteractionPattern["type"] {
    if (sequence.length <= 2) return "sequence";

    // Check for cycles (repeated patterns)
    const uniqueQueries = new Set(sequence);
    if (uniqueQueries.size < sequence.length * 0.7) return "cycle";

    // Check for branching (multiple related topics)
    const topics = sequence.map(q => this.extractTopics(q)).flat();
    const uniqueTopics = new Set(topics);
    if (uniqueTopics.size > sequence.length * 0.8) return "branching";

    // Check for exploration (increasing complexity)
    const complexities = sequence.map(q => this.calculateQueryComplexity(q));
    const isIncreasing = complexities.every(
      (c, i) => i === 0 || c >= complexities[i - 1]
    );
    if (isIncreasing) return "exploratory";

    return "sequence";
  }

  private classifyQueryType(query: string): string {
    const queryLower = query.toLowerCase();

    if (queryLower.includes("show") || queryLower.includes("display"))
      return "visualization";
    if (queryLower.includes("optimize") || queryLower.includes("improve"))
      return "optimization";
    if (queryLower.includes("analyze") || queryLower.includes("analysis"))
      return "analysis";
    if (queryLower.includes("predict") || queryLower.includes("forecast"))
      return "prediction";
    if (queryLower.includes("compare") || queryLower.includes("versus"))
      return "comparison";

    return "information";
  }

  private extractTopics(query: string): string[] {
    const businessTopics = [
      "sales",
      "revenue",
      "customers",
      "marketing",
      "performance",
      "analytics",
      "dashboard",
      "reports",
      "optimization",
      "conversion",
      "retention",
      "churn",
      "roi",
      "cost",
      "profit",
      "growth",
    ];

    const queryLower = query.toLowerCase();
    return businessTopics.filter(topic => queryLower.includes(topic));
  }

  private extractDomains(query: string): string[] {
    const domains = [
      "finance",
      "marketing",
      "sales",
      "operations",
      "hr",
      "analytics",
      "customer_service",
      "product",
      "engineering",
      "business_intelligence",
    ];

    const queryLower = query.toLowerCase();
    const extractedDomains: string[] = [];

    // Domain-specific keywords
    const domainKeywords = {
      finance: ["revenue", "profit", "cost", "budget", "roi", "financial"],
      marketing: ["campaign", "leads", "conversion", "brand", "advertising"],
      sales: ["deals", "pipeline", "quota", "prospects", "closing"],
      operations: ["efficiency", "process", "workflow", "productivity"],
      analytics: ["data", "metrics", "kpi", "dashboard", "report"],
      customer_service: ["support", "tickets", "satisfaction", "resolution"],
    };

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => queryLower.includes(keyword))) {
        extractedDomains.push(domain);
      }
    }

    return extractedDomains.length > 0 ? extractedDomains : ["general"];
  }

  private calculateQueryComplexity(query: string): number {
    let complexity = 0.1; // Base complexity

    // Length factor
    complexity += Math.min(query.length / 200, 0.3);

    // Complex words
    const complexWords = [
      "analyze",
      "optimize",
      "correlation",
      "regression",
      "algorithm",
      "prediction",
      "forecast",
      "segmentation",
      "attribution",
    ];
    complexity +=
      complexWords.filter(word => query.toLowerCase().includes(word)).length *
      0.1;

    // Question words indicating complexity
    const complexQuestions = ["why", "how", "what if", "compare"];
    complexity +=
      complexQuestions.filter(q => query.toLowerCase().includes(q)).length *
      0.1;

    return Math.min(complexity, 1.0);
  }

  private async extractContextTags(
    conversationEntry: ConversationEntry
  ): Promise<string[]> {
    const tags: string[] = [];
    const query = conversationEntry.userQuery.toLowerCase();

    // Add query type tag
    tags.push(this.classifyQueryType(query));

    // Add topic tags
    tags.push(...this.extractTopics(query));

    // Add domain tags
    tags.push(...this.extractDomains(query));

    // Add complexity tag
    const complexity = this.calculateQueryComplexity(query);
    if (complexity > 0.7) tags.push("complex");
    else if (complexity < 0.3) tags.push("simple");
    else tags.push("moderate");

    return Array.from(new Set(tags)); // Remove duplicates
  }

  private async getSessionQueries(
    sessionId: string
  ): Promise<ConversationEntry[]> {
    // This would typically query the database for all queries in a session
    // For now, return empty array - implement based on your database structure
    return [];
  }

  private recommendDashboardWidgets(userModel: UserBehaviorModel): string[] {
    const recommendations: string[] = [];

    // Based on business focus
    if (userModel.businessFocus.includes("revenue")) {
      recommendations.push("revenue-trends", "sales-pipeline");
    }
    if (userModel.businessFocus.includes("customer")) {
      recommendations.push("customer-segments", "churn-analysis");
    }

    // Based on expertise level
    if (userModel.expertiseLevel.overall > 0.7) {
      recommendations.push("advanced-analytics", "custom-queries");
    } else {
      recommendations.push("summary-dashboard", "key-metrics");
    }

    return recommendations;
  }

  private recommendChartTypes(userModel: UserBehaviorModel): string[] {
    if (userModel.preferenceWeights.visualPreference > 0.7) {
      return ["interactive-charts", "heatmaps", "treemaps", "sankey-diagrams"];
    } else if (userModel.preferenceWeights.visualPreference > 0.4) {
      return ["bar-charts", "line-charts", "pie-charts"];
    } else {
      return ["tables", "summary-cards"];
    }
  }

  private recommendDataFilters(
    userModel: UserBehaviorModel
  ): Record<string, any> {
    const filters: Record<string, any> = {};

    // Based on temporal patterns
    const hourlyPattern = userModel.temporalPatterns.find(
      p => p.timeWindow === "hour"
    );
    if (hourlyPattern) {
      filters.timeRange = "last_24_hours";
    }

    // Based on business focus
    if (userModel.businessFocus.length > 0) {
      filters.businessArea = userModel.businessFocus[0];
    }

    return filters;
  }

  private recommendReportTemplates(userModel: UserBehaviorModel): string[] {
    const templates: string[] = [];

    // Based on communication style
    if (userModel.communicationStyle.directness > 0.7) {
      templates.push("executive-summary");
    } else {
      templates.push("detailed-analysis");
    }

    // Based on expertise level
    if (userModel.expertiseLevel.overall > 0.6) {
      templates.push("technical-report");
    } else {
      templates.push("business-overview");
    }

    return templates;
  }

  private async persistUserModel(model: UserBehaviorModel): Promise<void> {
    // Implement database persistence logic
    // This would typically save the model to a dedicated table
    console.log(`Persisting user model for user ${model.userId}`);
  }
}

// Export singleton instance
export const userBehaviorPredictionEngine =
  UserBehaviorPredictionEngine.getInstance();
