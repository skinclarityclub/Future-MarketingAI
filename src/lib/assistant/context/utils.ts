import type {
  UserProfile,
  SessionMemory,
  ConversationEntry,
  ContextRetentionConfig,
  DataRetentionPolicy,
} from "./types";

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
}

/**
 * Generate a unique user ID if needed
 */
export function generateUserId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `user_${timestamp}_${random}`;
}

/**
 * Create a context hash for deduplication
 */
export function createContextHash(content: string): string {
  // Simple hash function - in production use crypto
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate retention policy configuration
 */
export function validateRetentionPolicy(policy: DataRetentionPolicy): boolean {
  const requiredFields = [
    "conversationHistory",
    "userPreferences",
    "behaviorPatterns",
    "learningInsights",
    "anonymizeAfter",
    "hardDeleteAfter",
  ];

  for (const field of requiredFields) {
    if (
      !(field in policy) ||
      typeof policy[field as keyof DataRetentionPolicy] !== "number"
    ) {
      return false;
    }
  }

  // Validate logical order
  if (policy.anonymizeAfter >= policy.hardDeleteAfter) {
    return false;
  }

  return true;
}

/**
 * Sanitize user data for privacy compliance
 */
export function sanitizeUserData(data: any): any {
  if (typeof data !== "object" || data === null) {
    return data;
  }

  const sanitized = { ...data };

  // Remove or mask sensitive fields
  const sensitiveFields = [
    "email",
    "phone",
    "address",
    "creditCard",
    "ssn",
    "password",
  ];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = "[REDACTED]";
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === "object" && sanitized[key] !== null) {
      sanitized[key] = sanitizeUserData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * Format context for UI display
 */
export function formatContextForDisplay(context: ConversationEntry): {
  title: string;
  summary: string;
  timestamp: string;
  confidence: string;
  type: string;
} {
  return {
    title: truncateText(context.userQuery, 50),
    summary: truncateText(context.assistantResponse, 100),
    timestamp: formatRelativeTime(context.timestamp),
    confidence: `${Math.round(context.confidence * 100)}%`,
    type:
      context.queryType.charAt(0).toUpperCase() + context.queryType.slice(1),
  };
}

/**
 * Estimate memory usage of context data
 */
export function estimateMemoryUsage(data: any): number {
  if (data === null || data === undefined) {
    return 0;
  }

  if (typeof data === "string") {
    return data.length * 2; // 2 bytes per character in UTF-16
  }

  if (typeof data === "number") {
    return 8; // 8 bytes for number
  }

  if (typeof data === "boolean") {
    return 4; // 4 bytes for boolean
  }

  if (Array.isArray(data)) {
    return data.reduce((total, item) => total + estimateMemoryUsage(item), 0);
  }

  if (typeof data === "object") {
    let total = 0;
    for (const key in data) {
      total += estimateMemoryUsage(key); // Key size
      total += estimateMemoryUsage(data[key]); // Value size
    }
    return total;
  }

  return 0;
}

/**
 * Compress context data by removing redundancy
 */
export function compressContextData(
  conversations: ConversationEntry[]
): ConversationEntry[] {
  // Group by similar queries and responses
  const groups = new Map<string, ConversationEntry[]>();

  conversations.forEach(conv => {
    const key = createContextHash(conv.userQuery + conv.assistantResponse);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(conv);
  });

  // Keep only the most recent from each group
  const compressed: ConversationEntry[] = [];
  groups.forEach(group => {
    // Sort by timestamp and keep the most recent
    group.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    compressed.push(group[0]);
  });

  return compressed.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

/**
 * Calculate content relevance score
 */
export function calculateRelevanceScore(
  content: string,
  query: string,
  context?: {
    userProfile?: UserProfile;
    timeDecay?: number;
    timestamp?: Date;
  }
): number {
  let score = 0;

  // Base text similarity
  const contentLower = content.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

  if (queryWords.length === 0) return 0;

  // Calculate word overlap
  let wordMatches = 0;
  queryWords.forEach(word => {
    if (contentLower.includes(word)) {
      wordMatches++;
    }
  });

  score = wordMatches / queryWords.length;

  // Apply time decay if timestamp provided
  if (context?.timestamp && context?.timeDecay) {
    const ageInDays =
      (Date.now() - context.timestamp.getTime()) / (1000 * 60 * 60 * 24);
    const timeDecayFactor = Math.exp(-ageInDays / context.timeDecay);
    score *= timeDecayFactor;
  }

  // Boost score based on user profile business focus
  if (context?.userProfile?.businessFocus) {
    const businessTerms = context.userProfile.businessFocus.map(term =>
      term.toLowerCase()
    );
    const hasBusinessFocus = businessTerms.some(term =>
      contentLower.includes(term)
    );
    if (hasBusinessFocus) {
      score *= 1.2; // 20% boost
    }
  }

  return Math.min(score, 1.0);
}

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string, limit = 10): string[] {
  // Simple keyword extraction - in production use NLP libraries
  const stopWords = new Set([
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
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "me",
    "him",
    "her",
    "us",
    "them",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

/**
 * Merge user profiles with conflict resolution
 */
export function mergeUserProfiles(
  existing: UserProfile,
  updates: Partial<UserProfile>
): UserProfile {
  const merged = { ...existing };

  // Handle array fields (business focus)
  if (updates.businessFocus) {
    merged.businessFocus = [
      ...new Set([...existing.businessFocus, ...updates.businessFocus]),
    ];
  }

  // Handle preference updates with timestamp consideration
  if (
    updates.communicationStyle &&
    updates.updatedAt &&
    updates.updatedAt > existing.updatedAt
  ) {
    merged.communicationStyle = updates.communicationStyle;
  }

  if (
    updates.expertiseLevel &&
    updates.updatedAt &&
    updates.updatedAt > existing.updatedAt
  ) {
    merged.expertiseLevel = updates.expertiseLevel;
  }

  if (
    updates.preferredAnalysisDepth &&
    updates.updatedAt &&
    updates.updatedAt > existing.updatedAt
  ) {
    merged.preferredAnalysisDepth = updates.preferredAnalysisDepth;
  }

  // Always update these fields
  if (updates.timezone) merged.timezone = updates.timezone;
  if (updates.language) merged.language = updates.language;
  if (updates.lastActive) merged.lastActive = updates.lastActive;

  merged.updatedAt = new Date();

  return merged;
}

/**
 * Validate session memory integrity
 */
export function validateSessionMemory(session: SessionMemory): boolean {
  // Check required fields
  if (!session.sessionId || !session.userId) {
    return false;
  }

  // Check timestamp consistency
  if (session.lastActivity < session.startTime) {
    return false;
  }

  // Check satisfaction score range
  if (
    session.satisfactionScore !== undefined &&
    (session.satisfactionScore < 0 || session.satisfactionScore > 5)
  ) {
    return false;
  }

  return true;
}

/**
 * Generate privacy-compliant export of user data
 */
export function generateDataExport(
  userProfile: UserProfile,
  conversations: ConversationEntry[],
  insights: any[],
  patterns: any[]
): {
  userProfile: UserProfile;
  conversationSummary: {
    totalConversations: number;
    dateRange: { start: Date; end: Date };
    topTopics: string[];
  };
  insights: any[];
  patterns: any[];
  exportDate: Date;
} {
  // Sanitize conversation data
  const sanitizedConversations = conversations.map(conv => ({
    ...conv,
    context: sanitizeUserData(conv.context),
  }));

  // Extract conversation statistics
  const sortedConversations = sanitizedConversations.sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  const conversationSummary = {
    totalConversations: conversations.length,
    dateRange: {
      start: sortedConversations[0]?.timestamp || new Date(),
      end:
        sortedConversations[sortedConversations.length - 1]?.timestamp ||
        new Date(),
    },
    topTopics: extractTopTopics(sanitizedConversations),
  };

  return {
    userProfile: sanitizeUserData(userProfile),
    conversationSummary,
    insights: insights.map(sanitizeUserData),
    patterns: patterns.map(sanitizeUserData),
    exportDate: new Date(),
  };
}

// Helper functions
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString();
}

function extractTopTopics(conversations: ConversationEntry[]): string[] {
  const allQueries = conversations.map(conv => conv.userQuery).join(" ");
  return extractKeywords(allQueries, 5);
}

/**
 * Configuration helpers
 */
export const DEFAULT_RETENTION_CONFIG: ContextRetentionConfig = {
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

/**
 * Privacy mode configurations
 */
export const PRIVACY_CONFIGS = {
  strict: {
    enableLearning: false,
    enablePrediction: false,
    maxSessionMemoryDays: 1,
    maxPersistentMemoryDays: 30,
    dataRetentionPolicy: {
      conversationHistory: 7,
      userPreferences: 30,
      behaviorPatterns: 0, // Disabled
      learningInsights: 0, // Disabled
      anonymizeAfter: 30,
      hardDeleteAfter: 90,
    },
  },
  balanced: {
    enableLearning: true,
    enablePrediction: true,
    maxSessionMemoryDays: 30,
    maxPersistentMemoryDays: 365,
    dataRetentionPolicy: {
      conversationHistory: 90,
      userPreferences: 365,
      behaviorPatterns: 180,
      learningInsights: 365,
      anonymizeAfter: 730,
      hardDeleteAfter: 1095,
    },
  },
  permissive: {
    enableLearning: true,
    enablePrediction: true,
    maxSessionMemoryDays: 90,
    maxPersistentMemoryDays: 1095,
    dataRetentionPolicy: {
      conversationHistory: 365,
      userPreferences: 1095,
      behaviorPatterns: 730,
      learningInsights: 1095,
      anonymizeAfter: 1095,
      hardDeleteAfter: 2190,
    },
  },
};
