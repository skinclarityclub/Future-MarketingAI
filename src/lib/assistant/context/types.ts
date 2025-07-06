export interface UserProfile {
  userId: string;
  expertiseLevel: "beginner" | "intermediate" | "advanced" | "expert";
  communicationStyle: "concise" | "detailed" | "visual" | "technical";
  businessFocus: string[];
  preferredAnalysisDepth: "basic" | "detailed" | "comprehensive";
  timezone: string;
  language: string;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionMemory {
  sessionId: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  queries: ConversationEntry[];
  contextSummary: string;
  activeTopics: string[];
  userIntent: string;
  satisfactionScore?: number;
}

export interface PersistentMemory {
  userId: string;
  learningInsights: LearningInsight[];
  behaviorPatterns: BehaviorPattern[];
  contextualKnowledge: ContextualKnowledge[];
  preferences: UserPreferences;
  relationshipMaps: RelationshipMap[];
  lastUpdated: Date;
}

export interface ConversationEntry {
  id: string;
  timestamp: Date;
  userQuery: string;
  assistantResponse: string;
  context: Record<string, any>;
  feedback?: "positive" | "negative" | "neutral";
  followUp?: boolean;
  queryType: "simple" | "complex" | "clarification";
  confidence: number;
  responseTime: number;
}

export interface LearningInsight {
  id: string;
  userId: string;
  insight: string;
  category: "preference" | "behavior" | "expertise" | "context";
  confidence: number;
  evidence: string[];
  createdAt: Date;
  validatedAt?: Date;
  impact: "high" | "medium" | "low";
}

export interface BehaviorPattern {
  patternId: string;
  userId: string;
  pattern: string;
  frequency: number;
  context: string[];
  predictivePower: number;
  lastSeen: Date;
  firstObserved: Date;
}

export interface ContextualKnowledge {
  id: string;
  userId: string;
  topic: string;
  knowledge: string;
  relevanceScore: number;
  sourceQueries: string[];
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

export interface UserPreferences {
  visualizationTypes: string[];
  dataGranularity: "summary" | "detailed" | "raw";
  updateFrequency: "real-time" | "hourly" | "daily" | "weekly";
  notificationSettings: Record<string, boolean>;
  dashboardLayout: Record<string, any>;
  reportFormats: string[];
}

export interface RelationshipMap {
  userId: string;
  entityType: "customer" | "product" | "campaign" | "metric";
  entityId: string;
  relationshipType: "interested" | "expert" | "responsible" | "stakeholder";
  strength: number;
  context: string[];
  lastInteraction: Date;
}

export interface ContextRetentionConfig {
  maxSessionMemoryDays: number;
  maxPersistentMemoryDays: number;
  compressionThreshold: number;
  privacyMode: "strict" | "balanced" | "permissive";
  enableLearning: boolean;
  enablePrediction: boolean;
  dataRetentionPolicy: DataRetentionPolicy;
}

export interface DataRetentionPolicy {
  conversationHistory: number; // days
  userPreferences: number; // days
  behaviorPatterns: number; // days
  learningInsights: number; // days
  anonymizeAfter: number; // days
  hardDeleteAfter: number; // days
}

export interface ContextQuery {
  userId: string;
  sessionId?: string;
  query: string;
  includeHistory?: boolean;
  maxHistoryEntries?: number;
  contextTypes?: ContextType[];
  timeRange?: {
    start: Date;
    end: Date;
  };
}

export interface ContextResponse {
  relevantContext: ConversationEntry[];
  userProfile: UserProfile;
  sessionSummary?: string;
  recommendations: string[];
  predictedNeeds?: string[];
  confidence: number;
}

export type ContextType =
  | "conversation_history"
  | "user_preferences"
  | "behavior_patterns"
  | "learning_insights"
  | "contextual_knowledge"
  | "relationship_maps";

export interface MemorySearchCriteria {
  userId: string;
  query?: string;
  contextTypes?: ContextType[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  minRelevanceScore?: number;
}

export interface MemorySearchResult {
  type: ContextType;
  content: any;
  relevanceScore: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface ContextStats {
  totalConversations: number;
  averageSessionLength: number;
  topTopics: Array<{ topic: string; count: number }>;
  satisfactionRate: number;
  learningInsights: number;
  behaviorPatterns: number;
  memoryUsage: {
    sessions: number;
    conversations: number;
    insights: number;
    patterns: number;
  };
}
