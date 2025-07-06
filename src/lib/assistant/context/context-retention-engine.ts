import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database-types";
import type {
  UserProfile,
  SessionMemory,
  ConversationEntry,
  LearningInsight,
  BehaviorPattern,
  ContextualKnowledge,
  UserPreferences,
  RelationshipMap,
  ContextRetentionConfig,
  ContextQuery,
  ContextResponse,
  MemorySearchCriteria,
  MemorySearchResult,
  ContextStats,
  ContextType,
} from "./types";

export class ContextRetentionEngine {
  private static instance: ContextRetentionEngine;
  private supabase;
  private config: ContextRetentionConfig;

  private constructor() {
    this.supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.config = {
      maxSessionMemoryDays: 30,
      maxPersistentMemoryDays: 365,
      compressionThreshold: 1000,
      privacyMode: "balanced",
      enableLearning: true,
      enablePrediction: true,
      dataRetentionPolicy: {
        conversationHistory: 90,
        userPreferences: 365,
        behaviorPatterns: 180,
        learningInsights: 365,
        anonymizeAfter: 730,
        hardDeleteAfter: 1095,
      },
    };
  }

  public static getInstance(): ContextRetentionEngine {
    if (!ContextRetentionEngine.instance) {
      ContextRetentionEngine.instance = new ContextRetentionEngine();
    }
    return ContextRetentionEngine.instance;
  }

  // User Profile Management
  async createOrUpdateUserProfile(
    profile: Partial<UserProfile>
  ): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .upsert({
        user_id: profile.userId!,
        expertise_level: profile.expertiseLevel || "intermediate",
        communication_style: profile.communicationStyle || "detailed",
        business_focus: profile.businessFocus || [],
        preferred_analysis_depth: profile.preferredAnalysisDepth || "detailed",
        timezone: profile.timezone || "UTC",
        language: profile.language || "en",
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDbUserProfile(data);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? this.mapDbUserProfile(data) : null;
  }

  // Session Memory Management
  async createSession(
    userId: string,
    sessionId?: string
  ): Promise<SessionMemory> {
    const id = sessionId || this.generateSessionId();
    const { data, error } = await this.supabase
      .from("session_memories")
      .insert({
        session_id: id,
        user_id: userId,
        start_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDbSessionMemory(data);
  }

  async updateSession(
    sessionId: string,
    updates: Partial<SessionMemory>
  ): Promise<SessionMemory> {
    const { data, error } = await this.supabase
      .from("session_memories")
      .update({
        last_activity: new Date().toISOString(),
        context_summary: updates.contextSummary,
        active_topics: updates.activeTopics,
        user_intent: updates.userIntent,
        satisfaction_score: updates.satisfactionScore,
        updated_at: new Date().toISOString(),
      })
      .eq("session_id", sessionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapDbSessionMemory(data);
  }

  async getSession(sessionId: string): Promise<SessionMemory | null> {
    const { data, error } = await this.supabase
      .from("session_memories")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? this.mapDbSessionMemory(data) : null;
  }

  // Conversation Entry Management
  async addConversationEntry(
    entry: Omit<ConversationEntry, "id">
  ): Promise<ConversationEntry> {
    const { data, error } = await this.supabase
      .from("conversation_entries")
      .insert({
        session_id: entry.timestamp.toString(), // Using timestamp as session reference
        user_id: entry.userQuery, // Temporary mapping - should be proper user ID
        timestamp: entry.timestamp.toISOString(),
        user_query: entry.userQuery,
        assistant_response: entry.assistantResponse,
        context: entry.context,
        feedback: entry.feedback,
        follow_up: entry.followUp || false,
        query_type: entry.queryType,
        confidence: entry.confidence,
        response_time: entry.responseTime,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDbConversationEntry(data);
  }

  // Context Retrieval
  async getContext(query: ContextQuery): Promise<ContextResponse> {
    const userProfile = await this.getUserProfile(query.userId);
    if (!userProfile) {
      throw new Error(`User profile not found for user: ${query.userId}`);
    }

    // Get relevant conversation history
    const conversationHistory = await this.getConversationHistory(
      query.userId,
      query.sessionId,
      query.maxHistoryEntries || 10
    );

    // Get contextual knowledge
    const contextualKnowledge = await this.searchContextualKnowledge(
      query.userId,
      query.query
    );

    // Get behavior patterns
    const behaviorPatterns = await this.getBehaviorPatterns(query.userId);

    // Generate recommendations based on context
    const recommendations = await this.generateRecommendations(
      userProfile,
      conversationHistory,
      contextualKnowledge,
      behaviorPatterns
    );

    // Calculate confidence score
    const confidence = this.calculateContextConfidence(
      conversationHistory,
      contextualKnowledge,
      behaviorPatterns
    );

    return {
      relevantContext: conversationHistory,
      userProfile,
      sessionSummary: await this.generateSessionSummary(query.sessionId),
      recommendations,
      predictedNeeds: await this.predictUserNeeds(
        userProfile,
        behaviorPatterns
      ),
      confidence,
    };
  }

  // Learning and Insights
  async addLearningInsight(
    insight: Omit<LearningInsight, "id">
  ): Promise<LearningInsight> {
    const { data, error } = await this.supabase
      .from("learning_insights")
      .insert({
        user_id: insight.userId,
        insight: insight.insight,
        category: insight.category,
        confidence: insight.confidence,
        evidence: insight.evidence,
        impact: insight.impact,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDbLearningInsight(data);
  }

  // Behavior Pattern Management
  async addBehaviorPattern(
    pattern: Omit<BehaviorPattern, "patternId">
  ): Promise<BehaviorPattern> {
    const { data, error } = await this.supabase
      .from("behavior_patterns")
      .insert({
        user_id: pattern.userId,
        pattern: pattern.pattern,
        frequency: pattern.frequency,
        context: pattern.context,
        predictive_power: pattern.predictivePower,
        last_seen: pattern.lastSeen.toISOString(),
        first_observed: pattern.firstObserved.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDbBehaviorPattern(data);
  }

  // Memory Search
  async searchMemory(
    criteria: MemorySearchCriteria
  ): Promise<MemorySearchResult[]> {
    const results: MemorySearchResult[] = [];

    // Search conversation history if requested
    if (
      !criteria.contextTypes ||
      criteria.contextTypes.includes("conversation_history")
    ) {
      const conversations = await this.searchConversations(criteria);
      results.push(...conversations);
    }

    // Search learning insights if requested
    if (
      !criteria.contextTypes ||
      criteria.contextTypes.includes("learning_insights")
    ) {
      const insights = await this.searchInsights(criteria);
      results.push(...insights);
    }

    // Search behavior patterns if requested
    if (
      !criteria.contextTypes ||
      criteria.contextTypes.includes("behavior_patterns")
    ) {
      const patterns = await this.searchPatterns(criteria);
      results.push(...patterns);
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results.slice(0, criteria.limit || 50);
  }

  // Analytics and Stats
  async getContextStats(userId: string): Promise<ContextStats> {
    const [
      conversationsResult,
      sessionsResult,
      insightsResult,
      patternsResult,
    ] = await Promise.all([
      this.supabase
        .from("conversation_entries")
        .select("*", { count: "exact" })
        .eq("user_id", userId),
      this.supabase.from("session_memories").select("*").eq("user_id", userId),
      this.supabase
        .from("learning_insights")
        .select("*", { count: "exact" })
        .eq("user_id", userId),
      this.supabase
        .from("behavior_patterns")
        .select("*", { count: "exact" })
        .eq("user_id", userId),
    ]);

    const totalConversations = conversationsResult.count || 0;
    const sessions = sessionsResult.data || [];
    const learningInsights = insightsResult.count || 0;
    const behaviorPatterns = patternsResult.count || 0;

    // Calculate average session length
    const averageSessionLength =
      sessions.reduce((acc, session) => {
        const start = new Date(session.start_time).getTime();
        const end = new Date(session.last_activity).getTime();
        return acc + (end - start);
      }, 0) /
      sessions.length /
      (1000 * 60); // Convert to minutes

    return {
      totalConversations,
      averageSessionLength: averageSessionLength || 0,
      topTopics: [], // Topic analysis not implemented in this version
      satisfactionRate: 0, // Feedback satisfaction calculation not implemented in this version
      learningInsights,
      behaviorPatterns,
      memoryUsage: {
        sessions: sessions.length,
        conversations: totalConversations,
        insights: learningInsights,
        patterns: behaviorPatterns,
      },
    };
  }

  // Privacy and Data Management
  async clearUserData(userId: string, hardDelete = false): Promise<void> {
    if (hardDelete) {
      // Hard delete all user data
      await Promise.all([
        this.supabase
          .from("conversation_entries")
          .delete()
          .eq("user_id", userId),
        this.supabase.from("learning_insights").delete().eq("user_id", userId),
        this.supabase.from("behavior_patterns").delete().eq("user_id", userId),
        this.supabase
          .from("contextual_knowledge")
          .delete()
          .eq("user_id", userId),
        this.supabase.from("user_preferences").delete().eq("user_id", userId),
        this.supabase.from("relationship_maps").delete().eq("user_id", userId),
        this.supabase.from("session_memories").delete().eq("user_id", userId),
        this.supabase.from("user_profiles").delete().eq("user_id", userId),
      ]);
    } else {
      // Soft delete - anonymize data
      const anonymizedUserId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await Promise.all([
        this.supabase
          .from("conversation_entries")
          .update({
            user_query: "[REDACTED]",
            assistant_response: "[REDACTED]",
          })
          .eq("user_id", userId),
        this.supabase
          .from("user_profiles")
          .update({ user_id: anonymizedUserId })
          .eq("user_id", userId),
      ]);
    }
  }

  // Helper methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getConversationHistory(
    userId: string,
    sessionId?: string,
    limit = 10
  ): Promise<ConversationEntry[]> {
    let query = this.supabase
      .from("conversation_entries")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (sessionId) {
      query = query.eq("session_id", sessionId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(this.mapDbConversationEntry).reverse();
  }

  private async searchContextualKnowledge(
    userId: string,
    query: string
  ): Promise<ContextualKnowledge[]> {
    const { data, error } = await this.supabase
      .from("contextual_knowledge")
      .select("*")
      .eq("user_id", userId)
      .textSearch("knowledge", query)
      .order("relevance_score", { ascending: false })
      .limit(5);

    if (error) throw error;
    return (data || []).map(this.mapDbContextualKnowledge);
  }

  private async getBehaviorPatterns(
    userId: string
  ): Promise<BehaviorPattern[]> {
    const { data, error } = await this.supabase
      .from("behavior_patterns")
      .select("*")
      .eq("user_id", userId)
      .order("predictive_power", { ascending: false })
      .limit(10);

    if (error) throw error;
    return (data || []).map(this.mapDbBehaviorPattern);
  }

  private async generateRecommendations(
    userProfile: UserProfile,
    conversationHistory: ConversationEntry[],
    contextualKnowledge: ContextualKnowledge[],
    behaviorPatterns: BehaviorPattern[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Generate recommendations based on user profile
    if (userProfile.communicationStyle === "visual") {
      recommendations.push(
        "Consider adding charts or graphs to better visualize the data"
      );
    }

    // Generate recommendations based on conversation patterns
    const recentQueries = conversationHistory
      .slice(-3)
      .map(entry => entry.userQuery.toLowerCase());
    if (recentQueries.some(query => query.includes("performance"))) {
      recommendations.push(
        "You might want to explore performance optimization strategies"
      );
    }

    return recommendations;
  }

  private async predictUserNeeds(
    userProfile: UserProfile,
    behaviorPatterns: BehaviorPattern[]
  ): Promise<string[]> {
    const predictions: string[] = [];

    // Predict based on behavior patterns
    behaviorPatterns.forEach(pattern => {
      if (pattern.predictivePower > 0.7) {
        predictions.push(
          `Based on your usage patterns, you might be interested in ${pattern.pattern}`
        );
      }
    });

    return predictions;
  }

  private calculateContextConfidence(
    conversationHistory: ConversationEntry[],
    contextualKnowledge: ContextualKnowledge[],
    behaviorPatterns: BehaviorPattern[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on conversation history
    if (conversationHistory.length > 0) {
      confidence += Math.min(conversationHistory.length * 0.05, 0.3);
    }

    // Increase confidence based on contextual knowledge
    if (contextualKnowledge.length > 0) {
      confidence += Math.min(contextualKnowledge.length * 0.03, 0.15);
    }

    // Increase confidence based on behavior patterns
    if (behaviorPatterns.length > 0) {
      confidence += Math.min(behaviorPatterns.length * 0.02, 0.1);
    }

    return Math.min(confidence, 1.0);
  }

  private async generateSessionSummary(
    sessionId?: string
  ): Promise<string | undefined> {
    if (!sessionId) return undefined;

    const session = await this.getSession(sessionId);
    return session?.contextSummary || "No session summary available";
  }

  private async searchConversations(
    criteria: MemorySearchCriteria
  ): Promise<MemorySearchResult[]> {
    const { data, error } = await this.supabase
      .from("conversation_entries")
      .select("*")
      .eq("user_id", criteria.userId)
      .limit(criteria.limit || 10);

    if (error) throw error;

    return (data || []).map(entry => ({
      type: "conversation_history" as ContextType,
      content: entry,
      relevanceScore: this.calculateRelevanceScore(
        entry.user_query,
        criteria.query || ""
      ),
      timestamp: new Date(entry.timestamp),
      metadata: { queryType: entry.query_type, confidence: entry.confidence },
    }));
  }

  private async searchInsights(
    criteria: MemorySearchCriteria
  ): Promise<MemorySearchResult[]> {
    const { data, error } = await this.supabase
      .from("learning_insights")
      .select("*")
      .eq("user_id", criteria.userId)
      .limit(criteria.limit || 10);

    if (error) throw error;

    return (data || []).map(insight => ({
      type: "learning_insights" as ContextType,
      content: insight,
      relevanceScore: this.calculateRelevanceScore(
        insight.insight,
        criteria.query || ""
      ),
      timestamp: new Date(insight.created_at),
      metadata: { category: insight.category, confidence: insight.confidence },
    }));
  }

  private async searchPatterns(
    criteria: MemorySearchCriteria
  ): Promise<MemorySearchResult[]> {
    const { data, error } = await this.supabase
      .from("behavior_patterns")
      .select("*")
      .eq("user_id", criteria.userId)
      .limit(criteria.limit || 10);

    if (error) throw error;

    return (data || []).map(pattern => ({
      type: "behavior_patterns" as ContextType,
      content: pattern,
      relevanceScore: pattern.predictive_power,
      timestamp: new Date(pattern.last_seen),
      metadata: { frequency: pattern.frequency, context: pattern.context },
    }));
  }

  private calculateRelevanceScore(content: string, query: string): number {
    if (!query) return 0.5;

    const contentLower = content.toLowerCase();
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(" ");

    let score = 0;
    queryWords.forEach(word => {
      if (contentLower.includes(word)) {
        score += 1 / queryWords.length;
      }
    });

    return Math.min(score, 1.0);
  }

  // Database mapping helpers
  private mapDbUserProfile(data: any): UserProfile {
    return {
      userId: data.user_id,
      expertiseLevel: data.expertise_level,
      communicationStyle: data.communication_style,
      businessFocus: data.business_focus || [],
      preferredAnalysisDepth: data.preferred_analysis_depth,
      timezone: data.timezone,
      language: data.language,
      lastActive: new Date(data.last_active),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapDbSessionMemory(data: any): SessionMemory {
    return {
      sessionId: data.session_id,
      userId: data.user_id,
      startTime: new Date(data.start_time),
      lastActivity: new Date(data.last_activity),
      queries: [], // Will be populated separately
      contextSummary: data.context_summary || "",
      activeTopics: data.active_topics || [],
      userIntent: data.user_intent || "",
      satisfactionScore: data.satisfaction_score,
    };
  }

  private mapDbConversationEntry(data: any): ConversationEntry {
    return {
      id: data.id,
      timestamp: new Date(data.timestamp),
      userQuery: data.user_query,
      assistantResponse: data.assistant_response,
      context: data.context || {},
      feedback: data.feedback,
      followUp: data.follow_up || false,
      queryType: data.query_type,
      confidence: data.confidence,
      responseTime: data.response_time,
    };
  }

  private mapDbLearningInsight(data: any): LearningInsight {
    return {
      id: data.id,
      userId: data.user_id,
      insight: data.insight,
      category: data.category,
      confidence: data.confidence,
      evidence: data.evidence || [],
      createdAt: new Date(data.created_at),
      validatedAt: data.validated_at ? new Date(data.validated_at) : undefined,
      impact: data.impact,
    };
  }

  private mapDbBehaviorPattern(data: any): BehaviorPattern {
    return {
      patternId: data.pattern_id,
      userId: data.user_id,
      pattern: data.pattern,
      frequency: data.frequency,
      context: data.context || [],
      predictivePower: data.predictive_power,
      lastSeen: new Date(data.last_seen),
      firstObserved: new Date(data.first_observed),
    };
  }

  private mapDbContextualKnowledge(data: any): ContextualKnowledge {
    return {
      id: data.id,
      userId: data.user_id,
      topic: data.topic,
      knowledge: data.knowledge,
      relevanceScore: data.relevance_score,
      sourceQueries: data.source_queries || [],
      createdAt: new Date(data.created_at),
      accessCount: data.access_count,
      lastAccessed: new Date(data.last_accessed),
    };
  }
}
