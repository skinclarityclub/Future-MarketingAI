// Supabase Database Types for Context Retention System

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          user_id: string;
          expertise_level: "beginner" | "intermediate" | "advanced" | "expert";
          communication_style: "concise" | "detailed" | "visual" | "technical";
          business_focus: string[];
          preferred_analysis_depth: "basic" | "detailed" | "comprehensive";
          timezone: string;
          language: string;
          last_active: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          expertise_level?: "beginner" | "intermediate" | "advanced" | "expert";
          communication_style?: "concise" | "detailed" | "visual" | "technical";
          business_focus?: string[];
          preferred_analysis_depth?: "basic" | "detailed" | "comprehensive";
          timezone?: string;
          language?: string;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          expertise_level?: "beginner" | "intermediate" | "advanced" | "expert";
          communication_style?: "concise" | "detailed" | "visual" | "technical";
          business_focus?: string[];
          preferred_analysis_depth?: "basic" | "detailed" | "comprehensive";
          timezone?: string;
          language?: string;
          last_active?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      session_memories: {
        Row: {
          session_id: string;
          user_id: string;
          start_time: string;
          last_activity: string;
          context_summary: string;
          active_topics: string[];
          user_intent: string;
          satisfaction_score: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          session_id: string;
          user_id: string;
          start_time?: string;
          last_activity?: string;
          context_summary?: string;
          active_topics?: string[];
          user_intent?: string;
          satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          session_id?: string;
          user_id?: string;
          start_time?: string;
          last_activity?: string;
          context_summary?: string;
          active_topics?: string[];
          user_intent?: string;
          satisfaction_score?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversation_entries: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          timestamp: string;
          user_query: string;
          assistant_response: string;
          context: Record<string, any>;
          feedback: "positive" | "negative" | "neutral" | null;
          follow_up: boolean;
          query_type: "simple" | "complex" | "clarification";
          confidence: number;
          response_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          timestamp?: string;
          user_query: string;
          assistant_response: string;
          context?: Record<string, any>;
          feedback?: "positive" | "negative" | "neutral" | null;
          follow_up?: boolean;
          query_type?: "simple" | "complex" | "clarification";
          confidence?: number;
          response_time?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          timestamp?: string;
          user_query?: string;
          assistant_response?: string;
          context?: Record<string, any>;
          feedback?: "positive" | "negative" | "neutral" | null;
          follow_up?: boolean;
          query_type?: "simple" | "complex" | "clarification";
          confidence?: number;
          response_time?: number;
          created_at?: string;
        };
      };
      learning_insights: {
        Row: {
          id: string;
          user_id: string;
          insight: string;
          category: "preference" | "behavior" | "expertise" | "context";
          confidence: number;
          evidence: string[];
          impact: "high" | "medium" | "low";
          validated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          insight: string;
          category: "preference" | "behavior" | "expertise" | "context";
          confidence: number;
          evidence: string[];
          impact?: "high" | "medium" | "low";
          validated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          insight?: string;
          category?: "preference" | "behavior" | "expertise" | "context";
          confidence?: number;
          evidence?: string[];
          impact?: "high" | "medium" | "low";
          validated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      behavior_patterns: {
        Row: {
          pattern_id: string;
          user_id: string;
          pattern: string;
          frequency: number;
          context: string[];
          predictive_power: number;
          last_seen: string;
          first_observed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          pattern_id?: string;
          user_id: string;
          pattern: string;
          frequency?: number;
          context?: string[];
          predictive_power?: number;
          last_seen?: string;
          first_observed?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          pattern_id?: string;
          user_id?: string;
          pattern?: string;
          frequency?: number;
          context?: string[];
          predictive_power?: number;
          last_seen?: string;
          first_observed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contextual_knowledge: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          knowledge: string;
          relevance_score: number;
          source_queries: string[];
          access_count: number;
          last_accessed: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic: string;
          knowledge: string;
          relevance_score?: number;
          source_queries?: string[];
          access_count?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic?: string;
          knowledge?: string;
          relevance_score?: number;
          source_queries?: string[];
          access_count?: number;
          last_accessed?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          visualization_types: string[];
          data_granularity: "summary" | "detailed" | "raw";
          update_frequency: "real-time" | "hourly" | "daily" | "weekly";
          notification_settings: Record<string, boolean>;
          dashboard_layout: Record<string, any>;
          report_formats: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          visualization_types?: string[];
          data_granularity?: "summary" | "detailed" | "raw";
          update_frequency?: "real-time" | "hourly" | "daily" | "weekly";
          notification_settings?: Record<string, boolean>;
          dashboard_layout?: Record<string, any>;
          report_formats?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          visualization_types?: string[];
          data_granularity?: "summary" | "detailed" | "raw";
          update_frequency?: "real-time" | "hourly" | "daily" | "weekly";
          notification_settings?: Record<string, boolean>;
          dashboard_layout?: Record<string, any>;
          report_formats?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      relationship_maps: {
        Row: {
          id: string;
          user_id: string;
          entity_type: "customer" | "product" | "campaign" | "metric";
          entity_id: string;
          relationship_type:
            | "interested"
            | "expert"
            | "responsible"
            | "stakeholder";
          strength: number;
          context: string[];
          last_interaction: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          entity_type: "customer" | "product" | "campaign" | "metric";
          entity_id: string;
          relationship_type:
            | "interested"
            | "expert"
            | "responsible"
            | "stakeholder";
          strength?: number;
          context?: string[];
          last_interaction?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          entity_type?: "customer" | "product" | "campaign" | "metric";
          entity_id?: string;
          relationship_type?:
            | "interested"
            | "expert"
            | "responsible"
            | "stakeholder";
          strength?: number;
          context?: string[];
          last_interaction?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// SQL migrations for creating the tables
export const contextDatabaseMigrations = `
-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  expertise_level TEXT CHECK (expertise_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
  communication_style TEXT CHECK (communication_style IN ('concise', 'detailed', 'visual', 'technical')) DEFAULT 'detailed',
  business_focus TEXT[] DEFAULT '{}',
  preferred_analysis_depth TEXT CHECK (preferred_analysis_depth IN ('basic', 'detailed', 'comprehensive')) DEFAULT 'detailed',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session memories table
CREATE TABLE IF NOT EXISTS session_memories (
  session_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  context_summary TEXT DEFAULT '',
  active_topics TEXT[] DEFAULT '{}',
  user_intent TEXT DEFAULT '',
  satisfaction_score DECIMAL(3,2) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversation entries table
CREATE TABLE IF NOT EXISTS conversation_entries (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES session_memories(session_id) ON DELETE CASCADE,
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_query TEXT NOT NULL,
  assistant_response TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  feedback TEXT CHECK (feedback IN ('positive', 'negative', 'neutral')),
  follow_up BOOLEAN DEFAULT FALSE,
  query_type TEXT CHECK (query_type IN ('simple', 'complex', 'clarification')) DEFAULT 'simple',
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1) DEFAULT 0.5,
  response_time INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create learning insights table
CREATE TABLE IF NOT EXISTS learning_insights (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  insight TEXT NOT NULL,
  category TEXT CHECK (category IN ('preference', 'behavior', 'expertise', 'context')) NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1) NOT NULL,
  evidence TEXT[] DEFAULT '{}',
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')) DEFAULT 'medium',
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create behavior patterns table
CREATE TABLE IF NOT EXISTS behavior_patterns (
  pattern_id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  pattern TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  context TEXT[] DEFAULT '{}',
  predictive_power DECIMAL(3,2) CHECK (predictive_power >= 0 AND predictive_power <= 1) DEFAULT 0.5,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  first_observed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contextual knowledge table
CREATE TABLE IF NOT EXISTS contextual_knowledge (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  knowledge TEXT NOT NULL,
  relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0 AND relevance_score <= 1) DEFAULT 0.5,
  source_queries TEXT[] DEFAULT '{}',
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  visualization_types TEXT[] DEFAULT '{}',
  data_granularity TEXT CHECK (data_granularity IN ('summary', 'detailed', 'raw')) DEFAULT 'detailed',
  update_frequency TEXT CHECK (update_frequency IN ('real-time', 'hourly', 'daily', 'weekly')) DEFAULT 'real-time',
  notification_settings JSONB DEFAULT '{}',
  dashboard_layout JSONB DEFAULT '{}',
  report_formats TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create relationship maps table
CREATE TABLE IF NOT EXISTS relationship_maps (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  entity_type TEXT CHECK (entity_type IN ('customer', 'product', 'campaign', 'metric')) NOT NULL,
  entity_id TEXT NOT NULL,
  relationship_type TEXT CHECK (relationship_type IN ('interested', 'expert', 'responsible', 'stakeholder')) NOT NULL,
  strength DECIMAL(3,2) CHECK (strength >= 0 AND strength <= 1) DEFAULT 0.5,
  context TEXT[] DEFAULT '{}',
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_memories_user_id ON session_memories(user_id);
CREATE INDEX IF NOT EXISTS idx_session_memories_last_activity ON session_memories(last_activity);
CREATE INDEX IF NOT EXISTS idx_conversation_entries_session_id ON conversation_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_entries_user_id ON conversation_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_entries_timestamp ON conversation_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_insights_category ON learning_insights(category);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_user_id ON behavior_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_user_id ON contextual_knowledge(user_id);
CREATE INDEX IF NOT EXISTS idx_contextual_knowledge_topic ON contextual_knowledge(topic);
CREATE INDEX IF NOT EXISTS idx_relationship_maps_user_id ON relationship_maps(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_maps_entity ON relationship_maps(entity_type, entity_id);

-- Create RLS (Row Level Security) policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contextual_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_maps ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for session_memories
CREATE POLICY "Users can view their own sessions" ON session_memories FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own sessions" ON session_memories FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own sessions" ON session_memories FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for conversation_entries
CREATE POLICY "Users can view their own conversations" ON conversation_entries FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own conversations" ON conversation_entries FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own conversations" ON conversation_entries FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for learning_insights
CREATE POLICY "Users can view their own insights" ON learning_insights FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own insights" ON learning_insights FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own insights" ON learning_insights FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for behavior_patterns
CREATE POLICY "Users can view their own patterns" ON behavior_patterns FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own patterns" ON behavior_patterns FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own patterns" ON behavior_patterns FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for contextual_knowledge
CREATE POLICY "Users can view their own knowledge" ON contextual_knowledge FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own knowledge" ON contextual_knowledge FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own knowledge" ON contextual_knowledge FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own preferences" ON user_preferences FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- RLS policies for relationship_maps
CREATE POLICY "Users can view their own relationships" ON relationship_maps FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update their own relationships" ON relationship_maps FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert their own relationships" ON relationship_maps FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_memories_updated_at BEFORE UPDATE ON session_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_insights_updated_at BEFORE UPDATE ON learning_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_behavior_patterns_updated_at BEFORE UPDATE ON behavior_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contextual_knowledge_updated_at BEFORE UPDATE ON contextual_knowledge FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relationship_maps_updated_at BEFORE UPDATE ON relationship_maps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;
