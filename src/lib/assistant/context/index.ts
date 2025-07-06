// Context Retention System - Main Exports

// Core Engine
export { ContextRetentionEngine } from "./context-retention-engine";

// Context-Aware Assistant
export { ContextAwareAssistant } from "./context-aware-assistant";
export type {
  ContextAwareQuery,
  ContextAwareResponse,
  ContextEnhancedConversationContext,
} from "./context-aware-assistant";

// Type Definitions
export type {
  UserProfile,
  SessionMemory,
  PersistentMemory,
  ConversationEntry,
  LearningInsight,
  BehaviorPattern,
  ContextualKnowledge,
  UserPreferences,
  RelationshipMap,
  ContextRetentionConfig,
  DataRetentionPolicy,
  ContextQuery,
  ContextResponse,
  ContextType,
  MemorySearchCriteria,
  MemorySearchResult,
  ContextStats,
} from "./types";

// Database Types
export type { Database } from "./database-types";
export { contextDatabaseMigrations } from "./database-types";

// Utility Functions
export {
  generateSessionId,
  generateUserId,
  createContextHash,
  validateRetentionPolicy,
  sanitizeUserData,
  formatContextForDisplay,
  estimateMemoryUsage,
  compressContextData,
  calculateRelevanceScore,
  extractKeywords,
  mergeUserProfiles,
  validateSessionMemory,
  generateDataExport,
  DEFAULT_RETENTION_CONFIG,
  PRIVACY_CONFIGS,
} from "./utils";

// Singleton instance getter for easy access
export const getContextRetentionEngine = () =>
  ContextRetentionEngine.getInstance();
export const getContextAwareAssistant = () =>
  ContextAwareAssistant.getInstance();

// Configuration constants
export const CONTEXT_CONFIG = {
  DEFAULT_SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_CONTEXT_ENTRIES: 50,
  COMPRESSION_THRESHOLD: 1000,
  MIN_RELEVANCE_SCORE: 0.3,
  DEFAULT_MEMORY_LIMIT: 100, // MB
  LEARNING_CONFIDENCE_THRESHOLD: 0.7,
  PATTERN_FREQUENCY_THRESHOLD: 3,
} as const;

// Event types for context system
export const CONTEXT_EVENTS = {
  USER_PROFILE_UPDATED: "user_profile_updated",
  SESSION_STARTED: "session_started",
  SESSION_ENDED: "session_ended",
  CONVERSATION_ADDED: "conversation_added",
  INSIGHT_LEARNED: "insight_learned",
  PATTERN_DETECTED: "pattern_detected",
  MEMORY_COMPRESSED: "memory_compressed",
  DATA_EXPORTED: "data_exported",
  DATA_DELETED: "data_deleted",
} as const;

// Helper functions for integration
export function isContextAware(
  context: any
): context is ContextEnhancedConversationContext {
  return (
    context && typeof context === "object" && context.contextAware === true
  );
}

export function createContextAwareQuery(
  query: string,
  userId: string,
  options: {
    sessionId?: string;
    userRole?: string;
    dashboardContext?: Record<string, any>;
    preferences?: Record<string, any>;
  } = {}
): ContextAwareQuery {
  return {
    query,
    userId,
    sessionId: options.sessionId,
    userRole: options.userRole,
    dashboardContext: options.dashboardContext,
    preferences: options.preferences,
  };
}

// Context system status checker
export async function checkContextSystemHealth(): Promise<{
  status: "healthy" | "degraded" | "error";
  details: {
    engine: boolean;
    assistant: boolean;
    database: boolean;
  };
  message: string;
}> {
  try {
    const engine = getContextRetentionEngine();
    const assistant = getContextAwareAssistant();

    // Basic functionality test
    const testUserId = "health_check_user";

    try {
      // Test engine
      await engine.getUserProfile(testUserId);

      // Test assistant
      const testResponse = await assistant.askWithContext({
        query: "System health check",
        userId: testUserId,
      });

      return {
        status: "healthy",
        details: {
          engine: true,
          assistant: true,
          database: true,
        },
        message: "Context system is functioning normally",
      };
    } catch (error) {
      return {
        status: "degraded",
        details: {
          engine: true,
          assistant: true,
          database: false,
        },
        message:
          "Context system has limited functionality - database issues detected",
      };
    }
  } catch (error) {
    return {
      status: "error",
      details: {
        engine: false,
        assistant: false,
        database: false,
      },
      message: `Context system error: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Migration helper for existing applications
export async function migrateExistingData(
  existingConversations: Array<{
    userId: string;
    query: string;
    response: string;
    timestamp: Date;
    context?: Record<string, any>;
  }>
): Promise<{
  migrated: number;
  errors: Array<{ index: number; error: string }>;
}> {
  const engine = getContextRetentionEngine();
  let migrated = 0;
  const errors: Array<{ index: number; error: string }> = [];

  for (let i = 0; i < existingConversations.length; i++) {
    const conv = existingConversations[i];

    try {
      // Create user profile if it doesn't exist
      let userProfile = await engine.getUserProfile(conv.userId);
      if (!userProfile) {
        userProfile = await engine.createOrUpdateUserProfile({
          userId: conv.userId,
          expertiseLevel: "intermediate",
          communicationStyle: "detailed",
          businessFocus: [],
          preferredAnalysisDepth: "detailed",
          timezone: "UTC",
          language: "en",
        });
      }

      // Create session
      const session = await engine.createSession(conv.userId);

      // Add conversation entry
      await engine.addConversationEntry({
        timestamp: conv.timestamp,
        userQuery: conv.query,
        assistantResponse: conv.response,
        context: conv.context || {},
        queryType: "simple",
        confidence: 0.7,
        responseTime: 1000,
        followUp: false,
      });

      migrated++;
    } catch (error) {
      errors.push({
        index: i,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { migrated, errors };
}

// Performance monitoring helpers
export function createContextMetrics() {
  return {
    responseTimes: [] as number[],
    memoryUsage: [] as number[],
    cacheHitRate: 0,
    errorRate: 0,
    activeUsers: new Set<string>(),

    recordResponseTime(time: number) {
      this.responseTimes.push(time);
      if (this.responseTimes.length > 100) {
        this.responseTimes.shift();
      }
    },

    recordMemoryUsage(usage: number) {
      this.memoryUsage.push(usage);
      if (this.memoryUsage.length > 100) {
        this.memoryUsage.shift();
      }
    },

    getAverageResponseTime() {
      return this.responseTimes.length > 0
        ? this.responseTimes.reduce((a, b) => a + b, 0) /
            this.responseTimes.length
        : 0;
    },

    getAverageMemoryUsage() {
      return this.memoryUsage.length > 0
        ? this.memoryUsage.reduce((a, b) => a + b, 0) / this.memoryUsage.length
        : 0;
    },

    addActiveUser(userId: string) {
      this.activeUsers.add(userId);
    },

    removeActiveUser(userId: string) {
      this.activeUsers.delete(userId);
    },

    getActiveUserCount() {
      return this.activeUsers.size;
    },
  };
}
